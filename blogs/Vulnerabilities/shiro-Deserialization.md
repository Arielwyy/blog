---
title: shiro rememberMe 反序列化漏洞（550）
date: 2022-7-15
tags:
 - Vulnerabilities
 - 笔记
categories:
 - Vulnerabilities
---

## shiro remember me 反序列化（550）还有一个721

为了让浏览器或服务器重启后用户不丢失登录状态，Shiro 支持将持久化信息序列化并加密后保存在 Cookie 的 rememberMe 字段中，下次读取时进行解密再反序列化。但是在 Shiro 1.2.4 版本之前内置了一个默认且固定的加密 Key，导致攻击者可以伪造任意的 rememberMe Cookie，进而触发反序列化漏洞。

完整的调用链：

```
java.util.HashSet.readObject()
-> java.util.HashMap.put()
-> java.util.HashMap.hash()
    -> org.apache.commons.collections.keyvalue.TiedMapEntry.hashCode()
    -> org.apache.commons.collections.keyvalue.TiedMapEntry.getValue()
        -> org.apache.commons.collections.map.LazyMap.get()
        -> org.apache.commons.collections.functors.InvokerTransformer.transform()
            -> java.lang.reflect.Method.invoke()
      ... templates gadgets ...
      -> java.lang.Runtime.exec()
```

### 构造思路

这里借助cc的利用链来构造。

cc主要有两条，一条是利用chainedTransformer链式调用transform方法，另一条是利用TemplatesImpl.newTransformer来动态loadClass构造好的恶意类的字节码。

而shiro的deserialize方法第75行使用了ClassResolvingObjectInputStream类，而非传统的ObjectInputStream

![image-20220920103649602](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220920103649.png)

它重写了ObjectInputStream类的resolveClass函数，`ObjectInputStream`的`resolveClass`函数用的是`Class.forName`类获取当前描述器所指代的类的Class对象。而重写后的`resolveClass`函数采用的是ClassUtils.forName。而这个类最终调用的是 `Tomcat` 下的 `webappclassloader`，该类会使用 `Class.forName()` 加载数组类，但是使用的 classloader 是 `URLClassLoader`，无法载入非Java自带的数组类的对象（具体原因参考：https://www.anquanke.com/post/id/192619）也就是说不能加载第三方jar包

![image-20220920103622407](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220920103622.png)

所以显然，这里只能使用TemplatesImpl.newTransformer这条链。

先回顾下CC2的利用链：

```
PriorityQueue.readObject
    -> PriorityQueue.heapify()
    -> PriorityQueue.siftDown()
    -> PriorityQueue.siftDownUsingComparator()
        -> TransformingComparator.compare()
            -> InvokerTransformer.transform()
                -> TemplatesImpl.newTransformer()
                ... templates Gadgets ...
                    -> Runtime.getRuntime().exec()
```

在这条链上，由于TransformingComparator在3.2.1的版本上还没有实现Serializable接口，其在3.2.1版本下是无法反序列化的。所以我们无法直接利用该payload来达到命令执行的目的。

所以需要改造一下。

我们先将注意力关注在`InvokerTransformer.transform()`上

![image-20220920103545028](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220920103545.png)

这里是最经典的反射机制的写法，根据传入的`input`对象，调用其`iMethodName`（可控）。那么如果此时传入的`input`为构造好的`TemplatesImpl`对象呢？

很明显，这样我们就可以通过将`iMethodName`置为`newTransformer`，从而完成后续的templates gadgets。

两种方式：

1.配合`ChainedTransformer`

`InvokerTransformer`往往同`ChainedTransformer`配合，循环构造Runtimes.getRuntime().exec。很明显，这里我们无法利用了。

2.无意义的`String`

这里的无意义的`String`指的是传入到`ConstantTransformer.transform`函数的`input`，该`transform`函数不依赖`input`，而直接返回`iConstant`

这里第一条路肯定断了，那么就是怎么利用这个无意义的`String`了！

从`CommonsCollection5`开始，出现了`TiedMapEntry`，其作为中继，调用了`LazyMap`（map）的`get`函数。

```java
public Object getValue() {
	return map.get(key);
}
```

其中`map`和`key`我们都可以控制，而`LazyMap.get`调用了`transform`函数，并将可控的`key`传入`transform`函数

```java
public Object get(Object key) {
	//create value for key if key is not currently in th map
	if (map.containsKey(key) == false) {
		Object value = factory.transform(key);//重点
		map.put(key, value);
		return value;
	}
	return map.get(key);
}
```

这里就接上了我们前面讨论的，将构造好的`TemplatesImpl`（key）作为`InvokerTransformer.transform`函数的`input`传入，我们就可以将templates gadgets串起来了。

简单来说，我们将`CommonsCollections5,6,9`构造链中的`TiedMapEntry`的key用了起来。

```java
final Object templates = Gadgets.createTemplatesImpl(command);
// TiedMapEntry entry = new TiedMapEntry(lazyMap, "foo"); //原来的利用方式
TiedMapEntry entry = new TiedMapEntry(lazyMap, templates);
```


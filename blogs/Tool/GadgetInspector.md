---
title: GadgetInspector源码学习
date: 2021-7-18
tags:
 - Tool
 - 笔记
categories:
 - Tool
---

## 写在前面

* 观察者模式。当对象间存在一对多关系时，则使用观察者模式。比如，当一个对象被修改时，则会自动通知依赖它的对象

* 策略模式。在策略模式中，一个类的行为或其算法可以在运行时更改

* 反射机制。是指程序可以访问、检测和修改它本身状态或行为的一种能力。反映到程序中，反射就是用来让开发者知道这个类中有什么成员，以及别的类中有什么成员。

  * 反射的作用

    * 让开发人员通过外部类的全路径名创建对象，并使用这些类，实现一些扩展的功能

    * 让开发人员可以枚举出类的全部成员，包括构造函数、属性、方法

    * 利用反射API访问类的私有成员

      * 反射的API包括三类：属性字段、构造函数、方法

        ![img](https://raw.githubusercontent.com/ChenforCode/chen-imagebed/master/img/20211125181102.jpeg)
    
        

    * 获取Class对象
    
      ```java
      //通过字符串获取Class对象，这个字符串必须带上完整路径名
  Class studentClass = Class.forName("com.test.reflection.Student");
      ```

    * 获取成员变量

      * `getDeclaredFields` 和 `getFields`。`getDeclaredFields`用于获取所有声明的字段，包括公有字段和私有字段，`getFields`仅用来获取公有字段
    
      ```java
      // 1.获取所有声明的字段
      Field[] declaredFieldList = studentClass.getDeclaredFields();
      for (Field declaredField : declaredFieldList) {
          System.out.println("declared Field: " + declaredField);
      }
      // 2.获取所有公有的字段
      Field[] fieldList = studentClass.getFields();
      for (Field field : fieldList) {
          System.out.println("field: " + field);
  }
      ```

    * 获取构造方法

      * `getDeclaedConstructors` 和 `getConstructors`。 用于获取所有构造方法的 `getDeclaredConstructors`和用于获取公有构造方法的`getConstructors`
    
        ```java
        // 1.获取所有声明的构造方法
        Constructor[] declaredConstructorList = studentClass.getDeclaredConstructors();
        for (Constructor declaredConstructor : declaredConstructorList) {
            System.out.println("declared Constructor: " + declaredConstructor);
        }
        // 2.获取所有公有的构造方法
        Constructor[] constructorList = studentClass.getConstructors();
        for (Constructor constructor : constructorList) {
            System.out.println("constructor: " + constructor);
    }
        ```

    * 获取非构造方法

      * `getDeclaredMethods` 和 `getMethods`。获取所有声明的非构造函数的 `getDeclaredMethods` 和仅获取公有非构造函数的 `getMethods`
    
        ```java
        // 1.获取所有声明的函数
        Method[] declaredMethodList = studentClass.getDeclaredMethods();
        for (Method declaredMethod : declaredMethodList) {
            System.out.println("declared Method: " + declaredMethod);
        }
        // 2.获取所有公有的函数
        Method[] methodList = studentClass.getMethods();
        for (Method method : methodList) {
            System.out.println("method: " + method);
    }
        ```
    
      * `getMethods` 方法不仅获取到了我们声明的公有方法`setStudentAge`，还获取到了很多 Object 类中的公有方法。因为Object 是所有 Java 类的父类，所有对象都默认实现了 Object 类的方法。 而`getDeclaredMethods`是无法获取到父类中的方法的。

## 源码部分

* main函数，程序的入口

  * 一些数据的准备工作，一步步调用MethodDiscovery、PassthroughDiscovery、CallGraphDiscovery、SourceDiscovery、GadgetChainDiscovery，最终实现gadget chain的挖掘

  * 对序列化的配置。需要指定挖掘的是哪种类型的链，json？原生？等等

  ```java
  public interface GIConfig {
      String getName();
      SerializableDecider getSerializableDecider(Map<MethodReference.Handle, MethodReference> methodMap, InheritanceMap inheritanceMap);
      ImplementationFinder getImplementationFinder(Map<MethodReference.Handle, MethodReference> methodMap,
                                                   Map<MethodReference.Handle, Set<MethodReference.Handle>> methodImplMap,
                                                   InheritanceMap inheritanceMap);
      SourceDiscovery getSourceDiscovery();
  
  }
  ```

* 从这段代码也就知道，针对不同的序列化类型，我们需要去根据它的特征分别实现SerializableDecider、ImplementationFinder和SourceDiscovery

* MethodDiscovery：类、方法数据以及父子类、超类关系数据的搜索

  * discover方法获取了所有的类，并通过`MethodDiscoveryClassVisitor`去记录类和类方法信息。

  ```java
  for (ClassResourceEnumerator.ClassResource classResource : classResourceEnumerator.getAllClasses()) {
      try (InputStream in = classResource.getInputStream()) {
          ClassReader cr = new ClassReader(in);
          try {
            //使用asm的ClassVisitor、MethodVisitor，利用观察模式去扫描所有的class和method并记录
              cr.accept(new MethodDiscoveryClassVisitor(), ClassReader.EXPAND_FRAMES);
          } catch (Exception e) {
              LOGGER.error("Exception analyzing: " + classResource.getName(), e);
          }
      }
  }
  ```

  * `MethodDiscoveryClassVisitor`会重载类的一些方法，`visit`方法会收集它的版本号，类名，签名，父类名，实现接口等信息，并保存到成员变量中。然后还会访问注解信息，成员变量（封装成ClassReference）、方法（记录类名、方法名、签名、以及是否是静态等信息，封装成MethodReference）
  * 然后是Save操作，保存到classes.dat和methods.dat
    * classes.dat `类名 | 父类名 | 所有接口 | 是否是接口 | 成员变量`
    * methods.dat `类名 | 方法名 | 方法描述信息 | 是否是静态方法`
    * `InheritanceDeriver.derive(classMap)`保存到classes.dat和methods.dat的同时，会对所有的类进行递归整合，获取到所有的继承关系，得到集合{class:[subclass]}，保存到inheritanceMap.dat

* PassthroughDiscovery：分析参数和返回值的关系，收集参数能影响到返回值的方法

  * 首先需要加载方法信息`methodMap`、类信息`classMap`、类继承、实现信息`inheritanceMap`
  * 搜索方法间的调用关系，获得类名->类资源的映射关系`classResourceByName`
  * 然后对方法的调用关系进行逆拓扑排序`sortedMethods`，排序后越底层的方法越靠前
  * 最后再把`classResourceByName`,`classMap`, `inheritanceMap`, `sortedMethods`传入去计算`passthroughDataflow`
  * `calculatePassthroughDataflow`是对每个函数进行污点性传递的关键函数，最后返回一个函数与会影响返回值的参数index的集合
  * 最后将`passthroughDataflow`中的信息保存至passthrough.dat中`类名 | 方法名 | 方法描述 | 污点index`

* CallGraphDiscovery：获取各个函数之间的调用关系，记录调用者caller方法和被调用者callee方法的参数传递关系

  * 加载`methodMap`、`classMap`、`inheritanceMap`、`passthroughDataflow`和`serializableDecider`传入`ModelGeneratorClassVisitor`进行观察

  * 注意这里传入了一个`serializableDecider`，可以参看前面主函数中提到的GIConfig接口，对于不同的反序列化类型，都有具体的实现。这里在观察的时候，传入了它，也就是说可能对于不同类型的链，可能是不同的

  * `ModelGeneratorClassVisitor`首先会记录下类的一些相关信息，例如`access`、`name`、`desc`等。然后用`ModelGeneratorMethodVisitor`对方法进行观察

  * `ModelGeneratorMethodVisitor`重写了visitCode、`visitFieldInsn`、`visitMethodInsn`三个方法

  * 最后再将获取到的调用信息`discoveredCalls`存储到callgraph.dat中

    ```pla
    调用者类名 | 调用者方法 | 调用者方法描述 | 被调用者类名 | 被调用者方法 | 被调用者方法描述 | 调用者方法参index | 调用者字段名 | 被调用者方法参数索引
    Main (Ljava/lang/String;)V main A method1 (Ljava/lang/String;)Ljava/lang/String; 1 1
    ```

* SourceDiscovery：入口函数的搜索，也就是我们的特征库硬编码

  * 它是一个抽象类，根据不同的config会有它自己的实现

  * 以Jackson的实现为例，它的discover方法将所有的init方法、get和set方法设为了source

    ```java
    for (MethodReference.Handle method : methodMap.keySet()) {
        if (serializableDecider.apply(method.getClassReference())) {
            if (method.getName().equals("<init>") && method.getDesc().equals("()V")) {
                //Source有两个属性，一个是方法信息，一个是被污染的参数index
                addDiscoveredSource(new Source(method, 0));
            }
            if (method.getName().startsWith("get") && method.getDesc().startsWith("()")) {
                addDiscoveredSource(new Source(method, 0));
            }
            if (method.getName().startsWith("set") && method.getDesc().matches("\\(L[^;]*;\\)V")) {
                addDiscoveredSource(new Source(method, 0));
            }
        }
    }
    ```

  * 最后将收集到的所有source信息保存到sources.dat中

* GadgetChainDiscovery：整合以上数据，搜索是否存在一条从source到sink的链。并通过判断调用链的最末端sink特征，从而判断出可利用的gadget chain
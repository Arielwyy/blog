---
title: Soot简单介绍
date: 2021-11-25
tags:
 - Tool
 - 笔记
categories:
 - Tool
---

## soot简单介绍

* soot是什么

  * 一个分析转换Java和Android应用的优化框架。对Java程序进行分析、优化、插桩

* Soot的输入和输出

  * 输入：Java源码/字节码
  * 输出：程序分析的结果（如活跃变量）/程序的中间表示（如Jimple）

* 为什么要用soot

  * soot有四种适合不同程序分析的中间表示：
    * Bat：基于栈的bytecode。简化了很多，没有常量操作和类型依赖。例如针对于int 和 float类型进行add操作，由于在计算机中整型和浮点型的表达方式不一样，bytecocde在底层实现时需要不同的指令对应不同的数据类型的操作。Bat不必对数据类型做细致区分，只要知道它是个数，并且要对这数进行加法操作就行了。

      ```
      iload 1  // load variable x1, and push it on the stack
      iload 2  // load variable x2, and push it on the stack
      iadd     // pop two values, and push their sum on the stack
      istore 1 // pop a value from the stack, and store it in variable x1
      ```

    * Jimple：带类型的三地址码形式的中间表示，可以用来做各种优化需要的分析（把复杂表达式拆开来），比如类型推测（虚调用优化）、边界检查消除、常量分析以及传播、公共子串分析等等

      ```
      stack1 = x1 // iload 1
      stack2 = x2 // iload 2
      stack1 = stack1 + stack2 // iadd
      x1 = stack1 // istore 1
      ```

    * Shimple：SSA形式的Jimple，每个”变量“只被赋值一次，而且用前会定义，这可以用来做各种reaching分析，比如一个”变量“作用域，进而分析例如内联inline时需要进行的检查等等.用来做控制流很方便，数据流不适合

    * Grimp：保留了复杂表达式，更接近Java源代码，适合用来做反汇编

* Jimple

  * soot的核心，只有15种指令。没有循环，直接用goto

    ![image-20210711115227750](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210711115228.png)

* soot有3种FlowAnalysis的实现：分别是：
  * ForwardFlowAnalysis，从UnitGraph的entry开始
    * 泛型类，有两个类型变量，N是Node的类型，通常是Unit，A是abstraction type，一般是set或map。也可以使用其他类型，只要实现了equals()和hashcode()两个方法即可，因为soot需要这些来确认是否到达fixed point
    * 需要实现的方法：
      * Constructor。至少使用DirectedGraph 作为参数。首先要传递给父类的构造器。同时调用doAnalysis()在构造器的最后，它执行流分析。在父类构造器和doAnalysis()之间，配置自己的分析的数据结构
      * newInitialFlow()和entryInitialFlow()
        * newInitialFlow()返回一个抽象类型A的对象，这个对象被分配为每个语句的初始in-set和out-set，除了第一条语句的in-set之外（它将会被entryInitialFlow()初始化。如果正在进行的是backwards 分析，则是exit statement，例如return或者throw。
      * copy(...)
        * copy方法以两个A类型的变量作为参数（source和target）将source赋值给target
      * merge(...)
        * 在控制流的merge点去合并数据流（例如分支语句if/then/else的末尾）。有三个参数：一个左分支的out-set，一个右分支的out和下一条statement将被用作合并的in-set集合
      * flowThrough(...)
        * flowThrough实现了实际流的功能，以三个元素作为输入：A类型的in-set，要处理的节点（类型为N）和一个A类型的out-set
  * BackwardsFlowAnalysis，从UnitGraph的exit开始逆向分析，同时可以生成对应的InverseGraph，也可以使用ForwardFlowAnalysis
  * ForwardBranchedFlowAnalysis，它与第一个的区别是可以把不同的flow sets传播给不同的分支。例如if(p != null) 就可以把p is not null传播给THEN分支，而p is null 传播给ELSE分支

## 基本的数据对象和数据结构

* Scene

  * 分析所处的完整“环境”。设置应用类（给soot分析的类）、主类（包含主方法的类）和访问有关过程间分析的信息（例如，指向信息和调用图）

* SootClass

  * 类。加载到soot中或使用soot创建的单一类

* SootField

  * 域。一个类的成员字段

* SootMethod

  * 方法。一个类的单个方法

* Body/JimpleBody

  * 函数体，存储一个方法的代码。对应不同的IR，有BafBody，JimpleBody，ShimpleBody和GrimpBody

* Unit

  * 语句。在Jimple中一个Stmt是一个Unit，在Grimple中一个Inst是一个Unit。一个AssignStmt的例子：

    ```
    x = y + z;
    ```

* Local

  ```
  java.lang.String[] r0;
  int i0, i1, i2, $i3, $i4;
  java.io.PrintStream $r1, $r2;
  java.lang.Exception $r3, r4;
  ```

  存在localchain中，通过body.getLocals()访问。对于每个Local r0，可以调用r0.getName(), r0.getType(), r0.setName(), r0.setType等API

* Value

  * 表示数据。包括Local, Constant, Expression(Expr), ParameterRef, CaughtExceptionRef和ThisRef
  * Expr接口又有大量的实现，例如NewExpr和AddExpr。一般来说，一个Expr对一个或几个Value进行一些操作，并返回另一个Value

  ```
  x = y + 2;
  ```

  * 这是一个Assignment，leftOp是x，rightOp是y + 2（是一个AddExpr）。也就是说，这个AddExpr包含Value y和2 作为操作数，前者是一个Local后者是一个Constant

* Box

  * Box在soot在无处不在，它是一个指针，提供对soot对象的间接访问。

  * soot中的Box包含两种，ValueBox和UnitBox。UnitBox包含Unit，VauleBox包含Value

  * UnitBox：一个Unit可能需要一些其他Unit的引用，例如一个GotoStmt需要知道它的target是什么。UnitBox包含一个Unit.

    ```
        x = 5;
        goto l2;
        y = 3;
    l2: z = 9;
    ```

    * 每个Unit都提供getUnitBoxes()，对于大多数的UnitBox，它会返回一个空的list。然后对于GotoStmt，getUnitBoxes返回一个元素列表，其中包含一个指向l2的Box

  * ValueBox：指向Value的Box，包含在Unit中被用到和定义的值

![image-20211124210231697](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20211124210232.png)

* Unit常见的API

  * ```java
    public List getUseBoxes()
    ```

    返回所有被使用的值，包括表达式和组成部分

  * ```java
    public List getUnitBoxes()
    ```

    返回该方法所指向的Unit的UnitBox列表

  * ```java
    public List getBoxesPointingToThis()
    ```

    返回一个包含该Unit作为目标的UnitBoxes

  * ```java
    public boolean fallsThrough();
    public boolean branches();
    ```

    这两个方法和此Unit后的执行流程有关。fallsThrough返回true，如果执行可以继续到下一个Unit。branches返回true，如果执行可能继续执行到一些不是紧接着这个Unit的Unit

  * ```java
    public void redirectJumpsToThisTo(Unit newLocation)
    ```

    用getBoxesPointingToThis去改变这个Unit的所有跳转，让他们指向newLocation


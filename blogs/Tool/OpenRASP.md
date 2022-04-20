---
title: OpenRASP
date: 2022-1-14
tags:
 - Tool
 - 笔记
categories:
 - Tool
---

### OpenRASP执行流

初始化部分分成以下几个部分

* agent初始化
* V8引擎初始化
* 日志配置模块初始化
* 插件模块初始化
* hook点管理模块初始化
* 字节码转换模块初始化

### 初始化流程

#### agent初始化

RASP类的入口点是premain或agentmain方法，在dependency-reduced-pom.xml中标明：

![image-20220416211951463](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220416211951.png)

这里表明了它的Main-class就是cn.pku.edu.rasp.Agent:

![image-20220416212258722](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220416212259.png)

这里将java agent的jar包加入到Bootstrap class path中，如果这里不进行特殊设定，则会默认将jar包加入到system class path中。而这样做的好处就在于，可以将jar包加到BootstrapClassLoad所加载的路径中，在类加载时可以保证加载顺序位于最顶层，这样可以不受到类加载顺序的限制，拦截到系统类

然后ModuleLoader.load根据指定的jar包来实例化模块加载的主流程：

![image-20220416212710787](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220416212711.png)

![image-20220416212744154](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220416212744.png)

这里的ENGINE-JAR就是rasp-engine.jar，也就是源代码中的engine模块。这里通过配置文件中的数值通过反射的方式实例化相应的主流程类：

![image-20220416213023516](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220416213023.png)

![image-20220416213321188](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220416213321.png)

然后就进入到了模块初始化的主流程：

![image-20220416214211987](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220420171721.png)

红框部分完成了hook点管理模块初始化，以及字节码转换模块的初始化

#### hook点管理模块初始化

进入到CheckerManager：

![image-20220416214744329](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220420171721.png)

遍历CheckParameter的Type，将其中的元素添加进枚举映射checkers中

Type的枚举类型定义了不同类型的攻击类型所对应的检测方式：

![image-20220416214947260](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220420171721.png)

#### 字节码转换模块初始化

字节码转换模块是整个Java RASP的重中之重，OpenRasp使用的是Javaassist来才做字节码的，大致写法与ASM并无区别。

在`cn.edu.pku.rasp.EnginBoot#initTransformer`中完成了字节码转换模块的初始化：

![image-20220416215320641](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220420171721.png)

这里在实例化了CustomClassTransformer实现的transformer后，调用了自己写的retransform方法。在这个方法中对Instrumentation已加载的所有类进行遍历，将其进行类的重新转换：

![image-20220416215540778](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220420171721.png)

这里主要是为了支持agentmain模式对类的重新转换

在解释完了retransform后，来整体看一下是如何添加hook点并完成相应hook流程的。这部分在`cn.edu.pku.rasp.transformer#CustomClassTransformer`中：

![image-20220416215852354](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220420171721.png)

inst.addTransformer的功能是在类加载时做拦截，对输入的类的字节码进行修改，也就是具体的检测流程插入都在这一部分。addAnnotationHook则完成了加入hook点的工作

![image-20220416220356643](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220420171728.png)

这里会收集`cn.edu.pku.rasp.hook`下所有的类进行扫描，将所有由HookAnnotation注解的类全部加入到HashSet中。至此，就完成了字节码转换模块的初始化

### 类加载拦截流程

OpenRASP的具体拦截流程是在CustomClassTransformer#transform中完成的：

![image-20220416221324096](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220420171728.png)

可以看到先检测当前拦截类是否是已经注册的需要hook的类，如果是，则直接利用javaassist创建ctClass，然后调用当前hook的transformClass方法。所有hook处理类都继承于AbstractClassHook，在AbstractClassHook中预定义了许多虚方法，同时也提供了很多通用的方法，例如transformClass：

![image-20220416222135674](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220420171728.png)

这里直接调用了每个具体hook类的hookMethod方法来执行具体的逻辑。值得注意的是，这里最终返回的也是一个byte数组，具体流程与ASM并无两样。跟进hookMethod：

![image-20220416222412593](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220416222412.png)

这里首先生成需要插入到代码中的字节码，然后调用自己写的insertBefore来讲字节码插入到hook点的前面。（这里就是决定是插在hook方法的最顶部，还是return前的最后一行，这决定了调用顺序）。

下面简单看一下插入的字节码是如何生成的：

![image-20220416222641845](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220416222642.png)

就是插入一段代码，这段代码将反射实例化当前hook类，调用MethodName所指定的方法，并将paramString所指定的参数传入该方法中。

然后看上面插入的方法，即getBuffer方法的具体逻辑：

![image-20220416223139015](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220420171728.png)

将收集到的信息放入一个名为params的HashMap中，然后调用checkBody方法:

![image-20220416223252271](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220416223252.png)

再调用HookHandler.doCheck方法：

![image-20220416223330846](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220416223331.png)

![image-20220416223410834](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220416223411.png)

![image-20220416223656926](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220416223657.png)

![image-20220416223742537](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220416223742.png)

这就是检测逻辑，完成：检测计时、获取检测结果以及根据检测结果判断是否要进行拦截。

根据check函数，看一下如何获取的检测结果：

![image-20220417132439627](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220417132439.png)

这里的checkers是在hook点管理模块初始化时设置的枚举类映射，所以调用的是XssChecker.check方法：

![image-20220417132550130](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220417132550.png)

其继承树为：XssChecker->ConfigurableChecker->AttackChecker->AbstractChecker，所以最终调用的是AbstractChecker#check方法：

![image-20220417132950961](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220417132951.png)

这里调用的就是XssChecker.checkParam方法：

![image-20220417133100099](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220417133100.png)

如果匹配规则，返回block，完成攻击拦截。至此，整个拦截流程分析完毕。

### 小结

#### 创新点

OpenRASP利用js来编写规则，通过V8来执行js。这样可以更加方便热部署，以及规则的通用性。同时减少了为不同语言重复制定相同规则的问题。

#### 缺陷

##### 关于通用性

1. 语言环境的通配适用性

   web应用程序使用不同的语言编写，那么需要用不同的方式来构建RASP，而不仅仅是构建一个java RASP就行了。这会影响到RASP的推广。

2. 部署的通配适用性

   企业内部存在各种各样框架实现的代码，部署环境也存在各种各样的情况，同时这些应用部署在不同的中间件中。不同的框架、不同的中间件部署方式或多或少有所不同，想要实现通配，很难。

##### 关于自身稳定性

1. 执行逻辑稳定性

   如果在RASP所指定的逻辑中出现了严重错误，将直接将错误抛出在业务逻辑中。轻则当前业务中断，重则整个服务中断。例如在RASP的检测逻辑中存在exit()这样的利用，将直接导致程序退出。

2. 自身安全稳定性

   即使原来的应用没有明显的安全危险，但是在RASP处理过程中存在漏洞，而恰巧攻击者传入一个利用这样漏洞的payload，将直接在RASP处理流中完成触发。例如RASP中使用过了受漏洞影响的FastJson库来处理相应的json数据，那么当攻击者在发送FastJson反序列化攻击payload的时候就会造成目标系统被RCE。也就是说，如果RASP自己的代码不规范不安全，最终将导致直接给业务写了个漏洞。

3. 规则的稳定性

   RASP的规则需要经过专业的安全研究人员反复打磨，根据业务来定制化，需要将所有的可能性都考虑进去，同时尽量减少误报。但是由于攻击贡献者水平的参差不齐，很容易导致规则遗漏，无法拦截相关攻击，或产生大量的攻击误报。

##### 部署复杂性

理想中最佳的Java RASP实践方式是使用agent main模式进行无侵入部署，但是受限于JVM进程保护机制没有办法对目标类添加新的方法，所以无法进行多次重复字节码插入。目前主流的Java RASP推荐的部署方式都是利用premain模式进行部署，这就造成了必须停止相关业务，加入相应的启动参数，再开启服务。而对甲方来说，重启一次业务完成部署RASP的代价是比较高的。

### 参考文献

https://www.anquanke.com/post/id/187415
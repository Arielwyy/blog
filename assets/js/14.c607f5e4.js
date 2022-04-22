(window.webpackJsonp=window.webpackJsonp||[]).push([[14],{588:function(t,a,e){"use strict";e.r(a);var r=e(15),s=Object(r.a)({},(function(){var t=this,a=t.$createElement,e=t._self._c||a;return e("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[e("h3",{attrs:{id:"openrasp执行流"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#openrasp执行流"}},[t._v("#")]),t._v(" OpenRASP执行流")]),t._v(" "),e("p",[t._v("初始化部分分成以下几个部分")]),t._v(" "),e("ul",[e("li",[t._v("agent初始化")]),t._v(" "),e("li",[t._v("V8引擎初始化")]),t._v(" "),e("li",[t._v("日志配置模块初始化")]),t._v(" "),e("li",[t._v("插件模块初始化")]),t._v(" "),e("li",[t._v("hook点管理模块初始化")]),t._v(" "),e("li",[t._v("字节码转换模块初始化")])]),t._v(" "),e("h3",{attrs:{id:"初始化流程"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#初始化流程"}},[t._v("#")]),t._v(" 初始化流程")]),t._v(" "),e("h4",{attrs:{id:"agent初始化"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#agent初始化"}},[t._v("#")]),t._v(" agent初始化")]),t._v(" "),e("p",[t._v("RASP类的入口点是premain或agentmain方法，在dependency-reduced-pom.xml中标明：")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421221619.png",alt:"image-20220416211951463"}})]),t._v(" "),e("p",[t._v("这里表明了它的Main-class就是cn.pku.edu.rasp.Agent:")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421221639.png",alt:"image-20220416212258722"}})]),t._v(" "),e("p",[t._v("这里将java agent的jar包加入到Bootstrap class path中，如果这里不进行特殊设定，则会默认将jar包加入到system class path中。而这样做的好处就在于，可以将jar包加到BootstrapClassLoad所加载的路径中，在类加载时可以保证加载顺序位于最顶层，这样可以不受到类加载顺序的限制，拦截到系统类")]),t._v(" "),e("p",[t._v("然后ModuleLoader.load根据指定的jar包来实例化模块加载的主流程：")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421221656.png",alt:"image-20220416212710787"}})]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421221728.png",alt:"image-20220416212744154"}})]),t._v(" "),e("p",[t._v("这里的ENGINE-JAR就是rasp-engine.jar，也就是源代码中的engine模块。这里通过配置文件中的数值通过反射的方式实例化相应的主流程类：")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421221740.png",alt:"image-20220416213023516"}})]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421221754.png",alt:"image-20220416213321188"}})]),t._v(" "),e("p",[t._v("然后就进入到了模块初始化的主流程：")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421221812.png",alt:"image-20220416214211987"}})]),t._v(" "),e("p",[t._v("红框部分完成了hook点管理模块初始化，以及字节码转换模块的初始化")]),t._v(" "),e("h4",{attrs:{id:"hook点管理模块初始化"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#hook点管理模块初始化"}},[t._v("#")]),t._v(" hook点管理模块初始化")]),t._v(" "),e("p",[t._v("进入到CheckerManager：")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421221827.png",alt:"image-20220416214744329"}})]),t._v(" "),e("p",[t._v("遍历CheckParameter的Type，将其中的元素添加进枚举映射checkers中")]),t._v(" "),e("p",[t._v("Type的枚举类型定义了不同类型的攻击类型所对应的检测方式：")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421221842.png",alt:"image-20220416214947260"}})]),t._v(" "),e("h4",{attrs:{id:"字节码转换模块初始化"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#字节码转换模块初始化"}},[t._v("#")]),t._v(" 字节码转换模块初始化")]),t._v(" "),e("p",[t._v("字节码转换模块是整个Java RASP的重中之重，OpenRasp使用的是Javaassist来才做字节码的，大致写法与ASM并无区别。")]),t._v(" "),e("p",[t._v("在"),e("code",[t._v("cn.edu.pku.rasp.EnginBoot#initTransformer")]),t._v("中完成了字节码转换模块的初始化：")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421221856.png",alt:"image-20220416215320641"}})]),t._v(" "),e("p",[t._v("这里在实例化了CustomClassTransformer实现的transformer后，调用了自己写的retransform方法。在这个方法中对Instrumentation已加载的所有类进行遍历，将其进行类的重新转换：")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421221913.png",alt:"image-20220416215540778"}})]),t._v(" "),e("p",[t._v("这里主要是为了支持agentmain模式对类的重新转换")]),t._v(" "),e("p",[t._v("在解释完了retransform后，来整体看一下是如何添加hook点并完成相应hook流程的。这部分在"),e("code",[t._v("cn.edu.pku.rasp.transformer#CustomClassTransformer")]),t._v("中：")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421221942.png",alt:"image-20220416215852354"}})]),t._v(" "),e("p",[t._v("inst.addTransformer的功能是在类加载时做拦截，对输入的类的字节码进行修改，也就是具体的检测流程插入都在这一部分。addAnnotationHook则完成了加入hook点的工作")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421222003.png",alt:"image-20220416220356643"}})]),t._v(" "),e("p",[t._v("这里会收集"),e("code",[t._v("cn.edu.pku.rasp.hook")]),t._v("下所有的类进行扫描，将所有由HookAnnotation注解的类全部加入到HashSet中。至此，就完成了字节码转换模块的初始化")]),t._v(" "),e("h3",{attrs:{id:"类加载拦截流程"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#类加载拦截流程"}},[t._v("#")]),t._v(" 类加载拦截流程")]),t._v(" "),e("p",[t._v("OpenRASP的具体拦截流程是在CustomClassTransformer#transform中完成的：")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421222021.png",alt:"image-20220416221324096"}})]),t._v(" "),e("p",[t._v("可以看到先检测当前拦截类是否是已经注册的需要hook的类，如果是，则直接利用javaassist创建ctClass，然后调用当前hook的transformClass方法。所有hook处理类都继承于AbstractClassHook，在AbstractClassHook中预定义了许多虚方法，同时也提供了很多通用的方法，例如transformClass：")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421222042.png",alt:"image-20220416222135674"}})]),t._v(" "),e("p",[t._v("这里直接调用了每个具体hook类的hookMethod方法来执行具体的逻辑。值得注意的是，这里最终返回的也是一个byte数组，具体流程与ASM并无两样。跟进hookMethod：")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421222058.png",alt:"image-20220416222412593"}})]),t._v(" "),e("p",[t._v("这里首先生成需要插入到代码中的字节码，然后调用自己写的insertBefore来讲字节码插入到hook点的前面。（这里就是决定是插在hook方法的最顶部，还是return前的最后一行，这决定了调用顺序）。")]),t._v(" "),e("p",[t._v("下面简单看一下插入的字节码是如何生成的：")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421222117.png",alt:"image-20220416222641845"}})]),t._v(" "),e("p",[t._v("就是插入一段代码，这段代码将反射实例化当前hook类，调用MethodName所指定的方法，并将paramString所指定的参数传入该方法中。")]),t._v(" "),e("p",[t._v("然后看上面插入的方法，即getBuffer方法的具体逻辑：")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421222135.png",alt:"image-20220416223139015"}})]),t._v(" "),e("p",[t._v("将收集到的信息放入一个名为params的HashMap中，然后调用checkBody方法:")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421222151.png",alt:"image-20220416223252271"}})]),t._v(" "),e("p",[t._v("再调用HookHandler.doCheck方法：")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421222210.png",alt:"image-20220416223330846"}})]),t._v(" "),e("p",[e("img",{attrs:{src:"https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220416223411.png",alt:"image-20220416223410834"}})]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421222226.png",alt:"image-20220416223656926"}})]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421222240.png",alt:"image-20220416223742537"}})]),t._v(" "),e("p",[t._v("这就是检测逻辑，完成：检测计时、获取检测结果以及根据检测结果判断是否要进行拦截。")]),t._v(" "),e("p",[t._v("根据check函数，看一下如何获取的检测结果：")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421222304.png",alt:"image-20220417132439627"}})]),t._v(" "),e("p",[t._v("这里的checkers是在hook点管理模块初始化时设置的枚举类映射，所以调用的是XssChecker.check方法：")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421222324.png",alt:"image-20220417132550130"}})]),t._v(" "),e("p",[t._v("其继承树为：XssChecker->ConfigurableChecker->AttackChecker->AbstractChecker，所以最终调用的是AbstractChecker#check方法：")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421222336.png",alt:"image-20220417132950961"}})]),t._v(" "),e("p",[t._v("这里调用的就是XssChecker.checkParam方法：")]),t._v(" "),e("p",[e("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421222355.png",alt:"image-20220417133100099"}})]),t._v(" "),e("p",[t._v("如果匹配规则，返回block，完成攻击拦截。至此，整个拦截流程分析完毕。")]),t._v(" "),e("h3",{attrs:{id:"小结"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#小结"}},[t._v("#")]),t._v(" 小结")]),t._v(" "),e("h4",{attrs:{id:"创新点"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#创新点"}},[t._v("#")]),t._v(" 创新点")]),t._v(" "),e("p",[t._v("OpenRASP利用js来编写规则，通过V8来执行js。这样可以更加方便热部署，以及规则的通用性。同时减少了为不同语言重复制定相同规则的问题。")]),t._v(" "),e("h4",{attrs:{id:"缺陷"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#缺陷"}},[t._v("#")]),t._v(" 缺陷")]),t._v(" "),e("h5",{attrs:{id:"关于通用性"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#关于通用性"}},[t._v("#")]),t._v(" 关于通用性")]),t._v(" "),e("ol",[e("li",[e("p",[t._v("语言环境的通配适用性")]),t._v(" "),e("p",[t._v("web应用程序使用不同的语言编写，那么需要用不同的方式来构建RASP，而不仅仅是构建一个java RASP就行了。这会影响到RASP的推广。")])]),t._v(" "),e("li",[e("p",[t._v("部署的通配适用性")]),t._v(" "),e("p",[t._v("企业内部存在各种各样框架实现的代码，部署环境也存在各种各样的情况，同时这些应用部署在不同的中间件中。不同的框架、不同的中间件部署方式或多或少有所不同，想要实现通配，很难。")])])]),t._v(" "),e("h5",{attrs:{id:"关于自身稳定性"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#关于自身稳定性"}},[t._v("#")]),t._v(" 关于自身稳定性")]),t._v(" "),e("ol",[e("li",[e("p",[t._v("执行逻辑稳定性")]),t._v(" "),e("p",[t._v("如果在RASP所指定的逻辑中出现了严重错误，将直接将错误抛出在业务逻辑中。轻则当前业务中断，重则整个服务中断。例如在RASP的检测逻辑中存在exit()这样的利用，将直接导致程序退出。")])]),t._v(" "),e("li",[e("p",[t._v("自身安全稳定性")]),t._v(" "),e("p",[t._v("即使原来的应用没有明显的安全危险，但是在RASP处理过程中存在漏洞，而恰巧攻击者传入一个利用这样漏洞的payload，将直接在RASP处理流中完成触发。例如RASP中使用过了受漏洞影响的FastJson库来处理相应的json数据，那么当攻击者在发送FastJson反序列化攻击payload的时候就会造成目标系统被RCE。也就是说，如果RASP自己的代码不规范不安全，最终将导致直接给业务写了个漏洞。")])]),t._v(" "),e("li",[e("p",[t._v("规则的稳定性")]),t._v(" "),e("p",[t._v("RASP的规则需要经过专业的安全研究人员反复打磨，根据业务来定制化，需要将所有的可能性都考虑进去，同时尽量减少误报。但是由于攻击贡献者水平的参差不齐，很容易导致规则遗漏，无法拦截相关攻击，或产生大量的攻击误报。")])])]),t._v(" "),e("h5",{attrs:{id:"部署复杂性"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#部署复杂性"}},[t._v("#")]),t._v(" 部署复杂性")]),t._v(" "),e("p",[t._v("理想中最佳的Java RASP实践方式是使用agent main模式进行无侵入部署，但是受限于JVM进程保护机制没有办法对目标类添加新的方法，所以无法进行多次重复字节码插入。目前主流的Java RASP推荐的部署方式都是利用premain模式进行部署，这就造成了必须停止相关业务，加入相应的启动参数，再开启服务。而对甲方来说，重启一次业务完成部署RASP的代价是比较高的。")]),t._v(" "),e("h3",{attrs:{id:"参考文献"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#参考文献"}},[t._v("#")]),t._v(" 参考文献")]),t._v(" "),e("p",[t._v("https://www.anquanke.com/post/id/187415")])])}),[],!1,null,null,null);a.default=s.exports}}]);
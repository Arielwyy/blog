(window.webpackJsonp=window.webpackJsonp||[]).push([[12],{420:function(i,l,e){"use strict";e.r(l);var a=e(2),v=Object(a.a)({},(function(){var i=this,l=i._self._c;return l("ContentSlotsDistributor",{attrs:{"slot-key":i.$parent.slotKey}},[l("div",{staticClass:"language- line-numbers-mode"},[l("pre",{pre:!0,attrs:{class:"language-text"}},[l("code",[i._v("title: 稀疏数据流分析\ndate: 2022-2-28\ntags:\n - Tool\n - 笔记\ncategories:\n - Tool\n - ProgramAnalysis\n")])]),i._v(" "),l("div",{staticClass:"line-numbers-wrapper"},[l("span",{staticClass:"line-number"},[i._v("1")]),l("br"),l("span",{staticClass:"line-number"},[i._v("2")]),l("br"),l("span",{staticClass:"line-number"},[i._v("3")]),l("br"),l("span",{staticClass:"line-number"},[i._v("4")]),l("br"),l("span",{staticClass:"line-number"},[i._v("5")]),l("br"),l("span",{staticClass:"line-number"},[i._v("6")]),l("br"),l("span",{staticClass:"line-number"},[i._v("7")]),l("br"),l("span",{staticClass:"line-number"},[i._v("8")]),l("br")])]),l("h1",{attrs:{id:"基于值流图的稀疏数据流分析方法"}},[l("a",{staticClass:"header-anchor",attrs:{href:"#基于值流图的稀疏数据流分析方法"}},[i._v("#")]),i._v(" 基于值流图的稀疏数据流分析方法")]),i._v(" "),l("ul",[l("li",[l("p",[i._v("传统的数据流分析（既然是一种数据流分析方法，那么传统的数据流分析是什么样的呢）")]),i._v(" "),l("ul",[l("li",[l("p",[i._v("数据流分析是通过分析程序状态信息在控制流图中的传播来计算每个静态程序点（语句）在运行时可能出现的状态。也就是说它会将所需计算的状态信息在每个程序点传播得到最终分析结果。")])]),i._v(" "),l("li",[l("p",[i._v("问题：")]),i._v(" "),l("p",[l("img",{attrs:{src:"C:%5CUsers%5Carile%5CAppData%5CRoaming%5CTypora%5Ctypora-user-images%5Cimage-20220210155506619.png",alt:"image-20220210155506619"}})]),i._v(" "),l("ul",[l("li",[i._v("每个结点都要保存一份关于x, y, z的值（即使结点2和y没有关系）")]),i._v(" "),l("li",[i._v("当1的转换函数更新y的时候，该更新只和3有关，但我们不可避免的要通过2才能到达3")]),i._v(" "),l("li",[i._v("这个过程通常存在较多的冗余操作，对效率，特别是过程间数据流分析的效率会有很大影响")])])]),i._v(" "),l("li",[l("p",[i._v("为了进一步提高数据流分析的效率，近年来研究者们提出了多种稀疏的分析方法，从而无需计算状态信息在每个程序点的传播即可得到与数据流分析相同的结果。")])]),i._v(" "),l("li",[l("p",[i._v("该类分析技术通过一个稀疏的值流图直接表示程序变量的依赖关系，从而使得状态信息可以有效地在该稀疏的值流图上传播。该值流图保证了状态信息可以有效地传播到其所需要使用该信息的程序点，并避免了在无效程序点的冗余传播，可大幅度提高效率。")])])])]),i._v(" "),l("li",[l("p",[i._v("什么是值流图（def-use关系）")]),i._v(" "),l("ul",[l("li",[i._v("定义：给定变量x，如果结点A可能改变x的值，结点B可能使用结点A改变后的x的值，则结点A和结点B存在Def-Use关系")]),i._v(" "),l("li",[l("img",{attrs:{src:"https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220210160056.png",alt:"image-20220210160056010"}})]),i._v(" "),l("li",[i._v("相关性质：\n"),l("ul",[l("li",[i._v("假设结果基于集合的May分析，即返回的总是真实结果的超集")]),i._v(" "),l("li",[i._v("健壮性soundness：用原数据流算法求出来的每一个结果新算法都会求出来")]),i._v(" "),l("li",[i._v("准确性precision：用新算法求出来的每一个结果原算法都会求出来")])])])])]),i._v(" "),l("li",[l("p",[i._v("什么是稀疏分析")]),i._v(" "),l("ul",[l("li",[i._v("基于静态单赋值形式的分析通常又称为稀疏分析Sparse Analysis")])])]),i._v(" "),l("li",[l("p",[i._v("基于稀疏框架的静态污点分析优化技术")]),i._v(" "),l("ul",[l("li",[l("p",[i._v("优化对象：flowdroid")])]),i._v(" "),l("li",[l("p",[i._v("针对的问题：flowdroid存在大量无关联污点传播（高达85.2%）导致开销过高")])]),i._v(" "),l("li",[l("p",[i._v("文章的工作：提出了面向流敏感和域敏感的变量使用点索引的计算方法；设计了基于稀疏数据流分析框架的污点分析技术，并基于该技术实现了一个原型系统FlowDroidSP，经过实验验证，在提升性能的同时没有带来精度上的损失")])]),i._v(" "),l("li",[l("p",[i._v("背景：flowdroid与别名分析")]),i._v(" "),l("ul",[l("li",[l("p",[i._v("FlowDroid中污点传播所使用的数据流分析无论是前向求解还是后向求解（计算别名）都是基于IFDS框架的。IFDS框架的计算规模直接影响了污点分析的开销。然而，当前IFDS框架仍然是基于CFG或过程间CFG的，这会导致数据流分析中存在无关联的传播。所谓无关联传播是指数据流值传播到某语句，但是该语句不会利用其生成其他数据流值或将其杀死。例如下图中变量a在行1被使用之后还会继续传递到行2-4直到程序结束，而行3-4没有使用a产生其他数据流值，a在行3-4上的传播就是无关联传播。而本文的目标就是利用稀疏的优化方法来消除这种无关联的传播，从而达到效率优化的目的。")]),i._v(" "),l("p",[l("img",{attrs:{src:"https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220210210340.png",alt:""}})])]),i._v(" "),l("li",[l("p",[i._v("在面向高精确（流敏感和域敏感）的污点分析的计算中，无关联的数据流传播还将被扩大，进而产生更大的性能开销。")]),i._v(" "),l("ul",[l("li",[l("p",[i._v("现代编译器多利用基于3地址的中间表示（例如soot的jimple表示）。对于(a)中行2的"),l("code",[i._v("b.f.h = a.f")]),i._v(" 语句将被转化为(b)的2-4行，将会引入2个临时变量tmp1和tmp2，这种临时变量的使用将会增加无关联传播的规模")]),i._v(" "),l("p",[l("img",{attrs:{src:"https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220210210726.png",alt:"image-20220210210726104"}})])]),i._v(" "),l("li",[l("p",[i._v("为了支持域敏感的分析，FlowDroid使用访问路径来表示污点变量,由于相同对象的不同域需要不同的区分，这会导致同一份代码因不同域的使用而被执行多次、无关联传播将会被放大。例如，图(c)和图(d)中程序都调用了函数foo()，但是它们所传递的参数对应的域是不同的，分别是x.f1和x.f2。对于同一个对象但访问不同参数的情况，IFDS认为它们是不同的变量而不会对其进行摘要优化。此时，参数p.f1传递到tmp2.h等过程产生的变量，如tmp1.f.f1和tmp2.h.f1等，那么对于p.f2的计算，也同样需要再次生成，如变量tmp1.f.f2和tmp2.h.f2等，可见无关联传播增加了1倍")])])])])])])])])]),i._v(" "),l("p",[l("img",{attrs:{src:"https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220210221142.png",alt:"image-20220210221141883"}})]),i._v(" "),l("ul",[l("li",[l("p",[i._v("本文的方法")]),i._v(" "),l("ul",[l("li",[l("p",[i._v("自治数据流图(ADFG)")]),i._v(" "),l("ul",[l("li",[i._v("定义：自治数据流图是一个有向图G=<N, E>，其中节点N表示程序中的变量且所有变量的基对象相同，边E为表示节点所在语句之间的控制流--\x3e也就是说一个图中节点是一个基对象的所有相关变量，边是这些变量所在语句之间的控制流")])])]),i._v(" "),l("li",[l("p",[i._v("特殊的数据结构：变量使用点索引来维护域敏感和流敏感性")]),i._v(" "),l("ul",[l("li",[i._v("定义：变量使用点索引是一个表(map)结构，它的键值(key)是变量的域，它的值(value)是该变量对应域的所有使用点集合。\n"),l("ul",[l("li",[i._v("域为null表示变量中域为空的情况，使用函数setUses[f]=[stmt]表示将语句[stmt]加入到变量的域f的使用点集合中")]),i._v(" "),l("li",[i._v("变量使用点索引的计算：在ADFG上，所有变量的基对象均相同，且仍包含其控制流信息，整个CFG按照基对象的不同被分成多个ADFG。分别遍历每个ADFG，使用数据流分析的方法计算其变量的使用位置，将其存储到使用点索引中")])])])])]),i._v(" "),l("li",[l("p",[i._v("传播函数")]),i._v(" "),l("ul",[l("li",[l("p",[i._v("传播函数将通过变量及其使用点索引获得其使用点集合，然后将数据流值"),l("strong",[i._v("直接传递到其使用点")]),i._v("。-----\x3e不会影响原算法产生新的数据流值的计算，而只是修改其传播的目的语句，既达到稀疏传播而又不影响正确性")])]),i._v(" "),l("li",[l("p",[i._v("a在行2处将仍然会产生b值，但会将b值直接传播到其使用位置，即行3")]),i._v(" "),l("p",[l("img",{attrs:{src:"C:%5CUsers%5Carile%5CAppData%5CRoaming%5CTypora%5Ctypora-user-images%5Cimage-20220211144049673.png",alt:"image-20220211144049673"}})])])])]),i._v(" "),l("li",[l("p",[i._v("稀疏的IFDS框架（将IFDS框架扩展成稀疏的形式）")]),i._v(" "),l("ul",[l("li",[i._v("使用DEF-USE链来代替CFG进行数据流值传播")])])]),i._v(" "),l("li",[l("p",[i._v("基于稀疏框架的污点分析")]),i._v(" "),l("ul",[l("li",[l("p",[i._v("相对于传统的污点分析(FlowDroid)，该框架增加一个预先分析(preAnalysis)的过程，即构建ADFG和计算变量使用点索引的过程")])]),i._v(" "),l("li",[l("p",[i._v("框架的第一部分是待分析程序的ICFG，以此作为预先分析的输入。预先分析过程生成的使用点索引作为污点传播前向分析和后向分析(别名分析)的输入，最后是输出结果部分")]),i._v(" "),l("p",[l("img",{attrs:{src:"https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220211144618.png",alt:"image-20220211144618767"}})])])])])])]),i._v(" "),l("li",[l("p",[i._v("实验部分")]),i._v(" "),l("ul",[l("li",[l("p",[i._v("验证3个问题：")]),i._v(" "),l("ul",[l("li",[l("p",[i._v("相比FlowDroid，本文的方法是否会损失精度")]),i._v(" "),l("ul",[l("li",[i._v("本文方法和FlowDroid产生的结果个数是完全一致的，没有精度损失")])])]),i._v(" "),l("li",[l("p",[i._v("预处理阶段和独立更新算法的开销是多少")]),i._v(" "),l("ul",[l("li",[i._v("预处理过程运行时间平均为0.9s，内存开销平均为126MB。预处理的平均消耗时间占平均总分析时间的百分比小于1%，而内存消耗平均占比为4%。开销很低，相对于分析的平均时间91.1s，几乎可以忽略不计")]),i._v(" "),l("li",[i._v("预处理开销低的原因是由于线性复杂度的ADFG构建算法和在此基础上的过程内的DEF-USE分析")])]),i._v(" "),l("p",[l("img",{attrs:{src:"https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220211165158.png",alt:"image-20220211165158183"}})])]),i._v(" "),l("li",[l("p",[i._v("相比FlowDroid，本文方法的性能提升效果是多少")])])])])])])])])}),[],!1,null,null,null);l.default=v.exports}}]);
---
title: 关于写论文的Tips
date: 2021-05-23
tags:
 - 经验分享
 - Paper
categories:
 - Paper
---

这次改论文前前后后花了差不多1个月的时间，走了很多弯路，想简单总结一下这个过程的收获：

* 摘要一般不分段，按照背景，方法，结论叙述
* 关键词是一篇论文在数据库中检索的依据，因此要从大到小去写，能够代表整篇文章，也就是能让别人在输入某个词时，能检索到这篇文章
* 引言是整篇文章的简单叙述，里面会有部分background、related work，以及自己的一些工作、贡献、亮点等
* 实验部分，不光有实验数据的展示，更重要的是，要去分析导致这个实验结果的原因，如果有多组数据，要去说清楚数据之间的关联，是否存在什么因果关系等
* 讨论或者说未来规划，文章提出的这个方法，有没有什么不足，自己打算怎么做。考虑全面一点，告诉评审人，自己有考虑这些问题，而不是由评审人来指出这些不足
* 参考文献，格式方面一般使用endnote都可以解决，[官网](https://endnote.com/downloads/styles)可以下载不同的格式模板，导入endnote即可。有的网站不支持导出endnote文件，则需要先导出.bib文件（有的可以直接生成，有的则需要手动新建一个bib文件后把内容复制进去），然后再使用JabRef打开再导出endnote(*.txt)文件，然后在endnote导入(import option选择endnote import)。另外发现了一个[网站](https://www.semanticscholar.org/)可以直接搜索论文，然后导出endnote文件。

论文实验部分，因为要做一个反混淆工具的对比，尝试了目前网上提供的很多种方法，最后选择了[D-810](https://gitlab.com/eshard/d810+)

* 要求ida 7.5 pro以上 python3.7以上版本
* 仓库拉下来后，将里面的内容（而不是拉下来的master文件夹）放在plugins目录下，使用Ctrl-Shift-D调出
* 它是分析的伪代码，调出后先点击start开始分析，然后按F5反编译，伪代码窗口会生成反混淆后的伪码，完成后点击end即可

也尝试了一些其他的工具，都不可行，也列在这：

* [CrowdDetox](https://github.com/CrowdStrike/CrowdDetox)
  * 可以自己编译，也可以使用它提供的编译好的版本
  * 我们的尝试是直接把编译好的放在插件目录下，然后使用Shift-F5，能调出，但是空白
* Saturn
  * 来源于论文[SATURN Software Deobfuscation Framework Based on LLVM](https://arxiv.org/abs/1909.01752)
  * 没有源码，GitHub的是它的数据集和测试结果
* [HexRays](https://github.com/RolfRolles/HexRaysDeob)
  * ida 7.5 pro以上
  * 需要自己编译，比较麻烦
* 还有一些杂七杂八的，就不太记得了。。。

Notes: ida插件开发都是针对于ida pro版本的，对于demo、home、free是不支持的。下载可以去看雪找。这里也有ida[官网](https://hex-rays.com/ida-pro/)（只能下载free和demo）具体这四个版本支持的功能，官网有详情。

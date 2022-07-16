(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{413:function(e,r,t){"use strict";t.r(r);var o=t(2),n=Object(o.a)({},(function(){var e=this,r=e._self._c;return r("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[r("p",[e._v("这次改论文前前后后花了差不多1个月的时间，走了很多弯路，想简单总结一下这个过程的收获：")]),e._v(" "),r("ul",[r("li",[e._v("摘要一般不分段，按照背景，方法，结论叙述")]),e._v(" "),r("li",[e._v("关键词是一篇论文在数据库中检索的依据，因此要从大到小去写，能够代表整篇文章，也就是能让别人在输入某个词时，能检索到这篇文章")]),e._v(" "),r("li",[e._v("引言是整篇文章的简单叙述，里面会有部分background、related work，以及自己的一些工作、贡献、亮点等")]),e._v(" "),r("li",[e._v("实验部分，不光有实验数据的展示，更重要的是，要去分析导致这个实验结果的原因，如果有多组数据，要去说清楚数据之间的关联，是否存在什么因果关系等")]),e._v(" "),r("li",[e._v("讨论或者说未来规划，文章提出的这个方法，有没有什么不足，自己打算怎么做。考虑全面一点，告诉评审人，自己有考虑这些问题，而不是由评审人来指出这些不足")]),e._v(" "),r("li",[e._v("参考文献，格式方面一般使用endnote都可以解决，"),r("a",{attrs:{href:"https://endnote.com/downloads/styles",target:"_blank",rel:"noopener noreferrer"}},[e._v("官网"),r("OutboundLink")],1),e._v("可以下载不同的格式模板，导入endnote即可。有的网站不支持导出endnote文件，则需要先导出.bib文件（有的可以直接生成，有的则需要手动新建一个bib文件后把内容复制进去），然后再使用JabRef打开再导出endnote(*.txt)文件，然后在endnote导入(import option选择endnote import)。另外发现了一个"),r("a",{attrs:{href:"https://www.semanticscholar.org/",target:"_blank",rel:"noopener noreferrer"}},[e._v("网站"),r("OutboundLink")],1),e._v("可以直接搜索论文，然后导出endnote文件。")])]),e._v(" "),r("p",[e._v("论文实验部分，因为要做一个反混淆工具的对比，尝试了目前网上提供的很多种方法，最后选择了"),r("a",{attrs:{href:"https://gitlab.com/eshard/d810+",target:"_blank",rel:"noopener noreferrer"}},[e._v("D-810"),r("OutboundLink")],1)]),e._v(" "),r("ul",[r("li",[e._v("要求ida 7.5 pro以上 python3.7以上版本")]),e._v(" "),r("li",[e._v("仓库拉下来后，将里面的内容（而不是拉下来的master文件夹）放在plugins目录下，使用Ctrl-Shift-D调出")]),e._v(" "),r("li",[e._v("它是分析的伪代码，调出后先点击start开始分析，然后按F5反编译，伪代码窗口会生成反混淆后的伪码，完成后点击end即可")])]),e._v(" "),r("p",[e._v("也尝试了一些其他的工具，都不可行，也列在这：")]),e._v(" "),r("ul",[r("li",[r("a",{attrs:{href:"https://github.com/CrowdStrike/CrowdDetox",target:"_blank",rel:"noopener noreferrer"}},[e._v("CrowdDetox"),r("OutboundLink")],1),e._v(" "),r("ul",[r("li",[e._v("可以自己编译，也可以使用它提供的编译好的版本")]),e._v(" "),r("li",[e._v("我们的尝试是直接把编译好的放在插件目录下，然后使用Shift-F5，能调出，但是空白")])])]),e._v(" "),r("li",[e._v("Saturn\n"),r("ul",[r("li",[e._v("来源于论文"),r("a",{attrs:{href:"https://arxiv.org/abs/1909.01752",target:"_blank",rel:"noopener noreferrer"}},[e._v("SATURN Software Deobfuscation Framework Based on LLVM"),r("OutboundLink")],1)]),e._v(" "),r("li",[e._v("没有源码，GitHub的是它的数据集和测试结果")])])]),e._v(" "),r("li",[r("a",{attrs:{href:"https://github.com/RolfRolles/HexRaysDeob",target:"_blank",rel:"noopener noreferrer"}},[e._v("HexRays"),r("OutboundLink")],1),e._v(" "),r("ul",[r("li",[e._v("ida 7.5 pro以上")]),e._v(" "),r("li",[e._v("需要自己编译，比较麻烦")])])]),e._v(" "),r("li",[e._v("还有一些杂七杂八的，就不太记得了。。。")])]),e._v(" "),r("p",[e._v("Notes: ida插件开发都是针对于ida pro版本的，对于demo、home、free是不支持的。下载可以去看雪找。这里也有ida"),r("a",{attrs:{href:"https://hex-rays.com/ida-pro/",target:"_blank",rel:"noopener noreferrer"}},[e._v("官网"),r("OutboundLink")],1),e._v("（只能下载free和demo）具体这四个版本支持的功能，官网有详情。")])])}),[],!1,null,null,null);r.default=n.exports}}]);
---
title: IFDS 框架算法理解
date: 2022-3-14
tags:
 - Tool
 - 笔记
categories:
 - Tool
---

IFDS框架用于interprocedual、finite、distributive subset（IFDS）问题的结果。在这类问题中，流函数是在有限的域上定义的，并且必须对合并操作 "∩"具有可分配性，也就是说，对于任何流函数f和任何a,b∈D来说，必须保持f(a)∩f(b) = f(a∩b)。当满足这些条件时，程序间数据流分析问题可以完全简化为一个图的可达性问题：IFDS框架定义了一个在所谓的爆炸性超级图上运行的算法。在这个图中，任何节点(s,d)都可以从一个特殊的不同的起始节点到达，当且仅当数据流事实d在语句s处成立时

具体算法：

![image-20220324213549121](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220324213549.png)
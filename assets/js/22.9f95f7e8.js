(window.webpackJsonp=window.webpackJsonp||[]).push([[22],{430:function(a,s,t){"use strict";t.r(s);var e=t(2),n=Object(e.a)({},(function(){var a=this,s=a._self._c;return s("ContentSlotsDistributor",{attrs:{"slot-key":a.$parent.slotKey}},[s("h2",{attrs:{id:"shiro-remember-me-反序列化-550-还有一个721"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#shiro-remember-me-反序列化-550-还有一个721"}},[a._v("#")]),a._v(" shiro remember me 反序列化（550）还有一个721")]),a._v(" "),s("p",[a._v("为了让浏览器或服务器重启后用户不丢失登录状态，Shiro 支持将持久化信息序列化并加密后保存在 Cookie 的 rememberMe 字段中，下次读取时进行解密再反序列化。但是在 Shiro 1.2.4 版本之前内置了一个默认且固定的加密 Key，导致攻击者可以伪造任意的 rememberMe Cookie，进而触发反序列化漏洞。")]),a._v(" "),s("p",[a._v("完整的调用链：")]),a._v(" "),s("div",{staticClass:"language- line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[a._v("java.util.HashSet.readObject()\n-> java.util.HashMap.put()\n-> java.util.HashMap.hash()\n    -> org.apache.commons.collections.keyvalue.TiedMapEntry.hashCode()\n    -> org.apache.commons.collections.keyvalue.TiedMapEntry.getValue()\n        -> org.apache.commons.collections.map.LazyMap.get()\n        -> org.apache.commons.collections.functors.InvokerTransformer.transform()\n            -> java.lang.reflect.Method.invoke()\n      ... templates gadgets ...\n      -> java.lang.Runtime.exec()\n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br"),s("span",{staticClass:"line-number"},[a._v("2")]),s("br"),s("span",{staticClass:"line-number"},[a._v("3")]),s("br"),s("span",{staticClass:"line-number"},[a._v("4")]),s("br"),s("span",{staticClass:"line-number"},[a._v("5")]),s("br"),s("span",{staticClass:"line-number"},[a._v("6")]),s("br"),s("span",{staticClass:"line-number"},[a._v("7")]),s("br"),s("span",{staticClass:"line-number"},[a._v("8")]),s("br"),s("span",{staticClass:"line-number"},[a._v("9")]),s("br"),s("span",{staticClass:"line-number"},[a._v("10")]),s("br")])]),s("h3",{attrs:{id:"构造思路"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#构造思路"}},[a._v("#")]),a._v(" 构造思路")]),a._v(" "),s("p",[a._v("这里借助cc的利用链来构造。")]),a._v(" "),s("p",[a._v("cc主要有两条，一条是利用chainedTransformer链式调用transform方法，另一条是利用TemplatesImpl.newTransformer来动态loadClass构造好的恶意类的字节码。")]),a._v(" "),s("p",[a._v("而shiro的deserialize方法第75行使用了ClassResolvingObjectInputStream类，而非传统的ObjectInputStream")]),a._v(" "),s("p",[s("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220920103649.png",alt:"image-20220920103649602"}})]),a._v(" "),s("p",[a._v("它重写了ObjectInputStream类的resolveClass函数，"),s("code",[a._v("ObjectInputStream")]),a._v("的"),s("code",[a._v("resolveClass")]),a._v("函数用的是"),s("code",[a._v("Class.forName")]),a._v("类获取当前描述器所指代的类的Class对象。而重写后的"),s("code",[a._v("resolveClass")]),a._v("函数采用的是ClassUtils.forName。而这个类最终调用的是 "),s("code",[a._v("Tomcat")]),a._v(" 下的 "),s("code",[a._v("webappclassloader")]),a._v("，该类会使用 "),s("code",[a._v("Class.forName()")]),a._v(" 加载数组类，但是使用的 classloader 是 "),s("code",[a._v("URLClassLoader")]),a._v("，无法载入非Java自带的数组类的对象（具体原因参考：https://www.anquanke.com/post/id/192619）也就是说不能加载第三方jar包")]),a._v(" "),s("p",[s("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220920103622.png",alt:"image-20220920103622407"}})]),a._v(" "),s("p",[a._v("所以显然，这里只能使用TemplatesImpl.newTransformer这条链。")]),a._v(" "),s("p",[a._v("先回顾下CC2的利用链：")]),a._v(" "),s("div",{staticClass:"language- line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[a._v("PriorityQueue.readObject\n    -> PriorityQueue.heapify()\n    -> PriorityQueue.siftDown()\n    -> PriorityQueue.siftDownUsingComparator()\n        -> TransformingComparator.compare()\n            -> InvokerTransformer.transform()\n                -> TemplatesImpl.newTransformer()\n                ... templates Gadgets ...\n                    -> Runtime.getRuntime().exec()\n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br"),s("span",{staticClass:"line-number"},[a._v("2")]),s("br"),s("span",{staticClass:"line-number"},[a._v("3")]),s("br"),s("span",{staticClass:"line-number"},[a._v("4")]),s("br"),s("span",{staticClass:"line-number"},[a._v("5")]),s("br"),s("span",{staticClass:"line-number"},[a._v("6")]),s("br"),s("span",{staticClass:"line-number"},[a._v("7")]),s("br"),s("span",{staticClass:"line-number"},[a._v("8")]),s("br"),s("span",{staticClass:"line-number"},[a._v("9")]),s("br")])]),s("p",[a._v("在这条链上，由于TransformingComparator在3.2.1的版本上还没有实现Serializable接口，其在3.2.1版本下是无法反序列化的。所以我们无法直接利用该payload来达到命令执行的目的。")]),a._v(" "),s("p",[a._v("所以需要改造一下。")]),a._v(" "),s("p",[a._v("我们先将注意力关注在"),s("code",[a._v("InvokerTransformer.transform()")]),a._v("上")]),a._v(" "),s("p",[s("img",{attrs:{src:"https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220920103545.png",alt:"image-20220920103545028"}})]),a._v(" "),s("p",[a._v("这里是最经典的反射机制的写法，根据传入的"),s("code",[a._v("input")]),a._v("对象，调用其"),s("code",[a._v("iMethodName")]),a._v("（可控）。那么如果此时传入的"),s("code",[a._v("input")]),a._v("为构造好的"),s("code",[a._v("TemplatesImpl")]),a._v("对象呢？")]),a._v(" "),s("p",[a._v("很明显，这样我们就可以通过将"),s("code",[a._v("iMethodName")]),a._v("置为"),s("code",[a._v("newTransformer")]),a._v("，从而完成后续的templates gadgets。")]),a._v(" "),s("p",[a._v("两种方式：")]),a._v(" "),s("p",[a._v("1.配合"),s("code",[a._v("ChainedTransformer")])]),a._v(" "),s("p",[s("code",[a._v("InvokerTransformer")]),a._v("往往同"),s("code",[a._v("ChainedTransformer")]),a._v("配合，循环构造Runtimes.getRuntime().exec。很明显，这里我们无法利用了。")]),a._v(" "),s("p",[a._v("2.无意义的"),s("code",[a._v("String")])]),a._v(" "),s("p",[a._v("这里的无意义的"),s("code",[a._v("String")]),a._v("指的是传入到"),s("code",[a._v("ConstantTransformer.transform")]),a._v("函数的"),s("code",[a._v("input")]),a._v("，该"),s("code",[a._v("transform")]),a._v("函数不依赖"),s("code",[a._v("input")]),a._v("，而直接返回"),s("code",[a._v("iConstant")])]),a._v(" "),s("p",[a._v("这里第一条路肯定断了，那么就是怎么利用这个无意义的"),s("code",[a._v("String")]),a._v("了！")]),a._v(" "),s("p",[a._v("从"),s("code",[a._v("CommonsCollection5")]),a._v("开始，出现了"),s("code",[a._v("TiedMapEntry")]),a._v("，其作为中继，调用了"),s("code",[a._v("LazyMap")]),a._v("（map）的"),s("code",[a._v("get")]),a._v("函数。")]),a._v(" "),s("div",{staticClass:"language-java line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-java"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("public")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[a._v("Object")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[a._v("getValue")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("{")]),a._v("\n\t"),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("return")]),a._v(" map"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[a._v("get")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),a._v("key"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("}")]),a._v("\n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br"),s("span",{staticClass:"line-number"},[a._v("2")]),s("br"),s("span",{staticClass:"line-number"},[a._v("3")]),s("br")])]),s("p",[a._v("其中"),s("code",[a._v("map")]),a._v("和"),s("code",[a._v("key")]),a._v("我们都可以控制，而"),s("code",[a._v("LazyMap.get")]),a._v("调用了"),s("code",[a._v("transform")]),a._v("函数，并将可控的"),s("code",[a._v("key")]),a._v("传入"),s("code",[a._v("transform")]),a._v("函数")]),a._v(" "),s("div",{staticClass:"language-java line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-java"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("public")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[a._v("Object")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[a._v("get")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),s("span",{pre:!0,attrs:{class:"token class-name"}},[a._v("Object")]),a._v(" key"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("{")]),a._v("\n\t"),s("span",{pre:!0,attrs:{class:"token comment"}},[a._v("//create value for key if key is not currently in th map")]),a._v("\n\t"),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("if")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),a._v("map"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[a._v("containsKey")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),a._v("key"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v("==")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token boolean"}},[a._v("false")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("{")]),a._v("\n\t\t"),s("span",{pre:!0,attrs:{class:"token class-name"}},[a._v("Object")]),a._v(" value "),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v("=")]),a._v(" factory"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[a._v("transform")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),a._v("key"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),s("span",{pre:!0,attrs:{class:"token comment"}},[a._v("//重点")]),a._v("\n\t\tmap"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[a._v("put")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),a._v("key"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(",")]),a._v(" value"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n\t\t"),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("return")]),a._v(" value"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n\t"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("}")]),a._v("\n\t"),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("return")]),a._v(" map"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[a._v("get")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),a._v("key"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("}")]),a._v("\n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br"),s("span",{staticClass:"line-number"},[a._v("2")]),s("br"),s("span",{staticClass:"line-number"},[a._v("3")]),s("br"),s("span",{staticClass:"line-number"},[a._v("4")]),s("br"),s("span",{staticClass:"line-number"},[a._v("5")]),s("br"),s("span",{staticClass:"line-number"},[a._v("6")]),s("br"),s("span",{staticClass:"line-number"},[a._v("7")]),s("br"),s("span",{staticClass:"line-number"},[a._v("8")]),s("br"),s("span",{staticClass:"line-number"},[a._v("9")]),s("br")])]),s("p",[a._v("这里就接上了我们前面讨论的，将构造好的"),s("code",[a._v("TemplatesImpl")]),a._v("（key）作为"),s("code",[a._v("InvokerTransformer.transform")]),a._v("函数的"),s("code",[a._v("input")]),a._v("传入，我们就可以将templates gadgets串起来了。")]),a._v(" "),s("p",[a._v("简单来说，我们将"),s("code",[a._v("CommonsCollections5,6,9")]),a._v("构造链中的"),s("code",[a._v("TiedMapEntry")]),a._v("的key用了起来。")]),a._v(" "),s("div",{staticClass:"language-java line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-java"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("final")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[a._v("Object")]),a._v(" templates "),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v("=")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[a._v("Gadgets")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[a._v("createTemplatesImpl")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),a._v("command"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[a._v('// TiedMapEntry entry = new TiedMapEntry(lazyMap, "foo"); //原来的利用方式')]),a._v("\n"),s("span",{pre:!0,attrs:{class:"token class-name"}},[a._v("TiedMapEntry")]),a._v(" entry "),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v("=")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("new")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[a._v("TiedMapEntry")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),a._v("lazyMap"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(",")]),a._v(" templates"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br"),s("span",{staticClass:"line-number"},[a._v("2")]),s("br"),s("span",{staticClass:"line-number"},[a._v("3")]),s("br")])])])}),[],!1,null,null,null);s.default=n.exports}}]);
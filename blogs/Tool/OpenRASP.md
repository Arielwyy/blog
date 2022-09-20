---
title: OpenRASP
date: 2022-1-14
tags:
 - Tool
 - 笔记
categories:
 - Tool
---

## 任尔混淆绕过，我自岿然不动

### 什么是RASP

Gartner在2014年提出了『运行时自我保护』Runtime application self-protection (RASP)技术的概念，即对应用服务的保护不应该依赖于外部系统，应用应该具备自我保护的能力。RASP的实现被构建或链接到应用程序或应用程序运行环境中，并能够控制应用程序的执行，检测和防止实时攻击。

区别于传统基于流量检测的安全设备，RASP将防御能力内嵌至应用本身，在关键方法调用前对参数进行安全校验。因此与传统防火墙相比，有着更高的攻击检出率与更低的误报率。

### 启动流程--后文以OpenRASP为例

1. 首先进入javaagent的premain函数，该函数会在main函数之前预先执行

   ```java
   public static void premain(String agentArg, Instrumentation inst) {
           init(START_MODE_NORMAL, START_ACTION_INSTALL, inst);
       }
   ```

   ```java
   public static synchronized void init(String mode, String action, Instrumentation inst) {
           try {
               JarFileHelper.addJarToBootstrap(inst);
               readVersion();
               ModuleLoader.load(mode, action, inst);
           } catch (Throwable e) {
               System.err.println("[OpenRASP] Failed to initialize, will continue without security protection.");
               e.printStackTrace();
           }
   }
   ```

2. 首先会将agent.jar添加到BootstrapClassLoader的ClassPath下，这样 hook 由 BootstrapClassLoader 加载的类的时候就能够成功调用到 agent.jar 中的检测入口。否则像java.io.File这样的类将无法加载（双亲委派机制，用户自定义的类将会使用SystemClassLoader）

3. 然后调用ModuleLoader.load函数：

   ```java
   public static synchronized void load(String mode, String action, Instrumentation inst) throws Throwable {
           if (Module.START_ACTION_INSTALL.equals(action)) {
               if (instance == null) {
                   try {
                       instance = new ModuleLoader(mode, inst);
                   } catch (Throwable t) {
                       instance = null;
                       throw t;
                   }
               } else {
                   System.out.println("[OpenRASP] The OpenRASP has bean initialized and cannot be initialized again");
               }
           } else if (Module.START_ACTION_UNINSTALL.equals(action)) {
               release(mode);
           } else {
               throw new IllegalStateException("[OpenRASP] Can not support the action: " + action);
           }
   }
   ```

   ```java
   private ModuleLoader(String mode, Instrumentation inst) throws Throwable {
   
           if (Module.START_MODE_NORMAL == mode) {
               setStartupOptionForJboss();
           }
           engineContainer = new ModuleContainer(ENGINE_JAR);
           engineContainer.start(mode, inst);
   }
   ```

4. 首先看ModuleContainer，这里传入的ENGINE_JAR即rasp-engine.jar

   ```java
   public ModuleContainer(String jarName) throws Throwable {
           try {
               File originFile = new File(baseDirectory + File.separator + jarName);
               JarFile jarFile = new JarFile(originFile);
               Attributes attributes = jarFile.getManifest().getMainAttributes();
               jarFile.close();
               this.moduleName = attributes.getValue("Rasp-Module-Name");
               String moduleEnterClassName = attributes.getValue("Rasp-Module-Class");//com.baidu.openrasp.EngineBoot
               if (moduleName != null && moduleEnterClassName != null
                       && !moduleName.equals("") && !moduleEnterClassName.equals("")) {
                   Class moduleClass;
                   if (ClassLoader.getSystemClassLoader() instanceof URLClassLoader) {
                       Method method = Class.forName("java.net.URLClassLoader").getDeclaredMethod("addURL", URL.class);
                       method.setAccessible(true);
                       method.invoke(moduleClassLoader, originFile.toURI().toURL());
                       method.invoke(ClassLoader.getSystemClassLoader(), originFile.toURI().toURL());
                       moduleClass = moduleClassLoader.loadClass(moduleEnterClassName);//EngineBoot
                       module = (Module) moduleClass.newInstance();//EngineBoot的实例
                   } else if (ModuleLoader.isCustomClassloader()) {
                       moduleClassLoader = ClassLoader.getSystemClassLoader();
                       Method method = moduleClassLoader.getClass().getDeclaredMethod("appendToClassPathForInstrumentation", String.class);
                       method.setAccessible(true);
                       try {
                           method.invoke(moduleClassLoader, originFile.getCanonicalPath());
                       } catch (Exception e) {
                           method.invoke(moduleClassLoader, originFile.getAbsolutePath());
                       }
                       moduleClass = moduleClassLoader.loadClass(moduleEnterClassName);
                       module = (Module) moduleClass.newInstance();
                   } else {
                       throw new Exception("[OpenRASP] Failed to initialize module jar: " + jarName);
                   }
               }
           } catch (Throwable t) {
               System.err.println("[OpenRASP] Failed to initialize module jar: " + jarName);
               throw t;
           }
   }
   ```

   这里会从相关的配置文件中取出moduleEnterClassName值，即为com.baidu.openrasp.EngineBoot，然后去实例化这个类。**也就是说这里的module是一个EngineBoot**

5. 然后再调用engineContainer.start(mode, inst)：

   ```java
   public void start(String mode, Instrumentation inst) throws Throwable {
           module.start(mode, inst);//实际上调用的就是EngineBoot的start方法
   }
   ```

   EngineBoot的start方法：

   ```java
   public void start(String mode, Instrumentation inst) throws Exception {
           System.out.println("\n\n" +
                   "   ____                   ____  ___   _____ ____ \n" +
                   "  / __ \\____  ___  ____  / __ \\/   | / ___// __ \\\n" +
                   " / / / / __ \\/ _ \\/ __ \\/ /_/ / /| | \\__ \\/ /_/ /\n" +
                   "/ /_/ / /_/ /  __/ / / / _, _/ ___ |___/ / ____/ \n" +
                   "\\____/ .___/\\___/_/ /_/_/ |_/_/  |_/____/_/      \n" +
                   "    /_/                                          \n\n");
           try {
               Loader.load();//openrasp_v8_java
           } catch (Exception e) {
               System.out.println("[OpenRASP] Failed to load native library, please refer to https://rasp.baidu.com/doc/install/software.html#faq-v8-load for possible solutions.");
               e.printStackTrace();
               return;
           }
           if (!loadConfig()) {
               return;
           }
           //缓存rasp的build信息
           Agent.readVersion();
           BuildRASPModel.initRaspInfo(Agent.projectVersion, Agent.buildTime, Agent.gitCommit);
           // 初始化插件系统，包括js上下文类初始化和插件文件初始化
           if (!JS.Initialize()) {
               return;
           }
           CheckerManager.init();
           initTransformer(inst);//初始化字节码转换模块
           if (CloudUtils.checkCloudControlEnter()) {
               CrashReporter.install(Config.getConfig().getCloudAddress() + "/v1/agent/crash/report",
                       Config.getConfig().getCloudAppId(), Config.getConfig().getCloudAppSecret(),
                       CloudCacheModel.getInstance().getRaspId());
           }
           deleteTmpDir();
           String message = "[OpenRASP] Engine Initialized [" + Agent.projectVersion + " (build: GitCommit="
                   + Agent.gitCommit + " date=" + Agent.buildTime + ")]";
           System.out.println(message);
           Logger.getLogger(EngineBoot.class.getName()).info(message);
   }
   ```

6. 首先是JS.Initialize()初始化插件系统

   ```java
   public synchronized static boolean Initialize() {
           try {
               if (!V8.Initialize()) {
                   throw new Exception("[OpenRASP] Failed to initialize V8 worker threads");
               }
               V8.SetLogger(new com.baidu.openrasp.v8.Logger() {
                   @Override
                   public void log(String msg) {
                       pluginLog(msg);
                   }
               });//设置v8的logger
               //设置v8获取栈信息的getter方法，这里获得的栈信息，每一条信息包括类名、方法名和行号classname@methodname(linenumber)
               V8.SetStackGetter(new com.baidu.openrasp.v8.StackGetter() {
                   @Override
                   public byte[] get() {
                       try {
                           ByteArrayOutputStream stack = new ByteArrayOutputStream();
                           JsonStream.serialize(StackTrace.getParamStackTraceArray(), stack);
                           stack.write(0);
                           return stack.getByteArray();
                       } catch (Exception e) {
                           return null;
                       }
                   }
               });
               Context.setKeys();
               if (!CloudUtils.checkCloudControlEnter()) {
                   UpdatePlugin();//加载js插件到v8引擎中
                   InitFileWatcher();//启动对js插件的文件监控，从而实现热部署，动态的增删js中的检测规则
               }
               return true;
           } catch (Exception e) {
               e.printStackTrace();
               LOGGER.error(e);
               return false;
           }
   }
   ```

7. 然后CheckerManager.init()：

   ```java
   public synchronized static void init() throws Exception {
       for (Type type : Type.values()) {
           checkers.put(type, type.checker);//加载所有类型的检测放入checkers，type.checker就是某种检测对应的类
       }
   }
   ```

   这里放进去的Type也就是：

   ```java
   public enum Type {
           // js插件检测
           SQL("sql", new V8AttackChecker(), 1),
           COMMAND("command", new V8AttackChecker(), 1 << 1),
           DIRECTORY("directory", new V8AttackChecker(), 1 << 2),
           REQUEST("request", new V8AttackChecker(), 1 << 3),
           READFILE("readFile", new V8AttackChecker(), 1 << 5),
           WRITEFILE("writeFile", new V8AttackChecker(), 1 << 6),
           FILEUPLOAD("fileUpload", new V8AttackChecker(), 1 << 7),
           RENAME("rename", new V8AttackChecker(), 1 << 8),
           XXE("xxe", new V8AttackChecker(), 1 << 9),
           OGNL("ognl", new V8AttackChecker(), 1 << 10),
           DESERIALIZATION("deserialization", new V8AttackChecker(), 1 << 11),
           WEBDAV("webdav", new V8AttackChecker(), 1 << 12),
           INCLUDE("include", new V8AttackChecker(), 1 << 13),
           SSRF("ssrf", new V8AttackChecker(), 1 << 14),
           SQL_EXCEPTION("sql_exception", new V8AttackChecker(), 1 << 15),
           REQUESTEND("requestEnd", new V8AttackChecker(), 1 << 17),
           DELETEFILE("deleteFile", new V8AttackChecker(), 1 << 18),
           MONGO("mongodb", new V8AttackChecker(), 1 << 19),
           LOADLIBRARY("loadLibrary", new V8AttackChecker(), 1 << 20),
           SSRF_REDIRECT("ssrfRedirect", new V8AttackChecker(), 1 << 21),
           RESPONSE("response", new V8AttackChecker(false), 1 << 23),
           LINK("link", new V8AttackChecker(), 1 << 24),
           JNDI("jndi", new V8AttackChecker(), 1 << 25),
           DNS("dns", new V8AttackChecker(), 1 << 26),
   
   
           // java本地检测
           XSS_USERINPUT("xss_userinput", new XssChecker(), 1 << 16),
           SQL_SLOW_QUERY("sqlSlowQuery", new SqlResultChecker(false), 0),
   
           // 安全基线检测
           POLICY_LOG("log", new LogChecker(false), 1 << 22),
           POLICY_MONGO_CONNECTION("mongoConnection", new MongoConnectionChecker(false), 0),
           POLICY_SQL_CONNECTION("sqlConnection", new SqlConnectionChecker(false), 0),
           POLICY_SERVER_TOMCAT("tomcatServer", new TomcatSecurityChecker(false), 0),
           POLICY_SERVER_JBOSS("jbossServer", new JBossSecurityChecker(false), 0),
           POLICY_SERVER_JBOSSEAP("jbossEAPServer", new JBossEAPSecurityChecker(false), 0),
           POLICY_SERVER_JETTY("jettyServer", new JettySecurityChecker(false), 0),
           POLICY_SERVER_RESIN("resinServer", new ResinSecurityChecker(false), 0),
           POLICY_SERVER_WEBSPHERE("websphereServer", new WebsphereSecurityChecker(false), 0),
           POLICY_SERVER_WEBLOGIC("weblogicServer", new WeblogicSecurityChecker(false), 0),
           POLICY_SERVER_WILDFLY("wildflyServer", new WildflySecurityChecker(false), 0),
           POLICY_SERVER_TONGWEB("tongwebServer", new TongwebSecurityChecker(false), 0),
           POLICY_SERVER_BES("bes", new BESSecurityChecker(false), 0);
   
           String name;
           Checker checker;
           Integer code;
   
           Type(String name, Checker checker, Integer code) {
               this.name = name;
               this.checker = checker;
               this.code = code;
           }
   
           public String getName() {
               return name;
           }
   
           public Checker getChecker() {
               return checker;
           }
   
           public Integer getCode() {
               return code;
           }
   
           @Override
           public String toString() {
               return name;
           }
   }
   ```

8. 最后再调用initTransformer(inst)初始化字节码转换模块：

   * 给 load class 操作进行插桩操作，当类加载的时候会先进入 agent 进行处理
   * 对于在初始化前已加载的类执行 retransform 处理，e.g. FileInputStream

   ```java
   private void initTransformer(Instrumentation inst) throws UnmodifiableClassException {
   	transformer = new CustomClassTransformer(inst);
   	transformer.retransform();
   }
   ```

9. 跟进CustomClassTransformer，该类实现了ClassFileTransformer接口（JVM TI接口）

   ```java
   public CustomClassTransformer(Instrumentation inst) {
       this.inst = inst;
       inst.addTransformer(this, true);
       addAnnotationHook();
   }
   ```

10. 跟进addAnnotationHook，获取com.baidu.openrasp.hook包下的AbstractClassHook子类，继续调用addHook

    ```java
    private void addAnnotationHook() {
            Set<Class> classesSet = AnnotationScanner.getClassWithAnnotation(SCAN_ANNOTATION_PACKAGE, HookAnnotation.class);
            for (Class clazz : classesSet) {
                try {
                    Object object = clazz.newInstance();
                    if (object instanceof AbstractClassHook) {
                        addHook((AbstractClassHook) object, clazz.getName());
                    }
                } catch (Exception e) {
                    LogTool.error(ErrorType.HOOK_ERROR, "add hook failed: " + e.getMessage(), e);
                }
            }
    }
    ```

    classSet收集所有有HookAnnotation注解的类

    ```java
    private void addHook(AbstractClassHook hook, String className) {
            if (hook.isNecessary()) {
                necessaryHookType.add(hook.getType());
            }
            String[] ignore = Config.getConfig().getIgnoreHooks();
            for (String s : ignore) {
                if (hook.couldIgnore() && (s.equals("all") || s.equals(hook.getType()))) {
                    LOGGER.info("ignore hook type " + hook.getType() + ", class " + className);
                    return;
                }
            }
            hooks.add(hook);
    }
    ```

    hooks收集所有不是配置文件中忽略的hook信息

11. 然后调用transformer.retransform()

    ```java
    public void retransform() {
            LinkedList<Class> retransformClasses = new LinkedList<Class>();
            Class[] loadedClasses = inst.getAllLoadedClasses();
            for (Class clazz : loadedClasses) {
                if (isClassMatched(clazz.getName().replace(".", "/"))) {
                    if (inst.isModifiableClass(clazz) && !clazz.getName().startsWith("java.lang.invoke.LambdaForm")) {
                        try {
                            // hook已经加载的类，或者是回滚已经加载的类
                            inst.retransformClasses(clazz);
                        } catch (Throwable t) {
                            LogTool.error(ErrorType.HOOK_ERROR,
                                    "failed to retransform class " + clazz.getName() + ": " + t.getMessage(), t);
                        }
                    }
                }
            }
    }
    ```

    其中会调用inst.retransformClasses(clazz)，对已加载的类执行 retransform 处理，经由retransform方法到transform。而对于第一次加载的类，会直接被transform捕获（这里是重写了ClassFileTransformer）

    ```java
    public byte[] transform(ClassLoader loader, String className, Class<?> classBeingRedefined,
                                ProtectionDomain domain, byte[] classfileBuffer) throws IllegalClassFormatException {
            if (loader != null) {
                DependencyFinder.addJarPath(domain);
            }
            if (loader != null && jspClassLoaderNames.contains(loader.getClass().getName())) {
                jspClassLoaderCache.put(className.replace("/", "."), new SoftReference<ClassLoader>(loader));
            }
            for (final AbstractClassHook hook : hooks) {
                if (hook.isClassMatched(className)) {
                    CtClass ctClass = null;
                    try {
                        ClassPool classPool = new ClassPool();
                        addLoader(classPool, loader);
                        ctClass = classPool.makeClass(new ByteArrayInputStream(classfileBuffer));
                        if (loader == null) {
                            hook.setLoadedByBootstrapLoader(true);
                        }
                        classfileBuffer = hook.transformClass(ctClass);
                        if (classfileBuffer != null) {
                            checkNecessaryHookType(hook.getType());
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    } finally {
                        if (ctClass != null) {
                            ctClass.detach();
                        }
                    }
                }
            }
            serverDetector.detectServer(className, loader, domain);
            return classfileBuffer;
    }
    ```

    遍历hooks获取所有Hook类，并通过Hook类的isClassMatched方法判断当前类是否Hook类的关注类，如果是，之后的具体操作则交由Hook类的tranformClass方法 

### Hook Class流程

1. 因为启动时候进行了插桩操作，当有类被 ClassLoader 加载时候，所以会把该类的字节码先交给自定义的 Transformer 处理
2. 自定义 Transformer 会判断该类是否为需要 hook 的类，如果是会将该类交给 javassist 字节码处理框架进行处理
3. javassist 框架会将类的字节码依照事件驱动模型逐步解析每个方法，当触发了我们需要 hook 的方法，我们会在方法的开头或者结尾插入进入检测函数的字节码
4. 把 hook 好的字节码返回给 transformer 从而载入虚拟机

![images/startup.png](https://raw.githubusercontent.com/Arielwyy/image-bed/master/img/20220920105845.png)

下面以ProcessBuilderHook为例：

1. **插桩**

   先根据isClassMatched(String className)方法判断是否对加载的class进行hook

   ```java
   public boolean isClassMatched(String className) {
           if (ModuleLoader.isModularityJdk()) {
               return "java/lang/ProcessImpl".equals(className);
           } else {
               if (OSUtil.isLinux() || OSUtil.isMacOS()) {
   //                LOGGER.info("come into linux hook class");
                   return "java/lang/UNIXProcess".equals(className);
               } else if (OSUtil.isWindows()) {
                   return "java/lang/ProcessImpl".equals(className);
               }
               return false;
           }
   }
   ```

   接着调用的是hook类的transformClass(CtClass ctClass)->hookMethod(CtClass ctClass)方法进行了字节码的修改

   ```java
   protected void hookMethod(CtClass ctClass) throws IOException, CannotCompileException, NotFoundException {
       if (ctClass.getName().contains("ProcessImpl")) {
           if (OSUtil.isWindows()) {
               String src = getInvokeStaticSrc(ProcessBuilderHook.class, "checkCommand",
                       "$1,$2", String[].class, String.class);
               insertBefore(ctClass, "<init>", null, src);
           } else if (ModuleLoader.isModularityJdk()) {
               String src = getInvokeStaticSrc(ProcessBuilderHook.class, "checkCommand",
                       "$1,$2,$4", byte[].class, byte[].class, byte[].class);
               insertBefore(ctClass, "<init>", null, src);
           }
       } else if (ctClass.getName().contains("UNIXProcess")) {
           String src = getInvokeStaticSrc(ProcessBuilderHook.class, "checkCommand",
                   "$1,$2,$4", byte[].class, byte[].class, byte[].class);
           insertBefore(ctClass, "<init>", null, src);
       }
   }
   ```

   这里是想要将checkCommand函数插入到init函数之前。先通过getInvokeStaticSrc方法获取“桩”的JAVA代码，再调用insertBefore方法进行“插”的操作（使用Javassist），如插入在构造方法前，被hook的类在实例化前会调用该插入的方法

   ```java
   public static void checkCommand(byte[] command, byte[] args, final byte[] envBlock) {
       if (HookHandler.enableCmdHook.get()) {
           LinkedList<String> commands = new LinkedList<String>();
           if (command != null && command.length > 0) {
               commands.add(new String(command, 0, command.length - 1));
           }
           if (args != null && args.length > 0) {
               int position = 0;
               for (int i = 0; i < args.length; i++) {
                   if (args[i] == 0) {
                       commands.add(new String(Arrays.copyOfRange(args, position, i)));
                       position = i + 1;
                   }
               }
           }
           LinkedList<String> envList = new LinkedList<String>();
           if (envBlock != null) {
               int index = -1;
               for (int i = 0; i < envBlock.length; i++) {
                   if (envBlock[i] == '\0') {
                       String envItem = new String(envBlock, index + 1, i - index - 1);
                       if (envItem.length() > 0) {
                           envList.add(envItem);
                       }
                       index = i;
                   }
               }
           }
           checkCommand(commands, envList);
       }
   }
   ```

   继续跟进checkCommand

   ```java
   public static void checkCommand(List<String> command, List<String> env) {
       if (command != null && !command.isEmpty()) {
           HashMap<String, Object> params = null;
           try {
               params = new HashMap<String, Object>();
               params.put("command", StringUtils.join(command, " "));
               params.put("env", env);
               List<String> stackInfo = StackTrace.getParamStackTraceArray();
               params.put("stack", stackInfo);
           } catch (Throwable t) {
               LogTool.traceHookWarn(t.getMessage(), t);
           }
           if (params != null) {
               HookHandler.doCheckWithoutRequest(CheckParameter.Type.COMMAND, params);
           }
       }
   }
   ```

   这里收集到的params内容为：

   ```json
   {
       "params": {
           "stack": [
               "java.lang.UNIXProcess.\u003cinit\u003e",
               "java.lang.ProcessImpl.start",
               "java.lang.ProcessBuilder.start",
               "java.lang.Runtime.exec",
               "java.lang.Runtime.exec",
               "superman.shells.T3OrIIOPShell.getServerLocation",
               "superman.shells.T3OrIIOPShell_WLSkel.invoke",
               "weblogic.rmi.internal.BasicServerRef.invoke",
               "weblogic.rmi.internal.BasicServerRef$1.run",
               "weblogic.security.acl.internal.AuthenticatedSubject.doAs",
               "weblogic.security.service.SecurityManager.runAs",
               "weblogic.rmi.internal.BasicServerRef.handleRequest",
               "weblogic.rmi.internal.wls.WLSExecuteRequest.run",
               "weblogic.work.ExecuteThread.execute",
               "weblogic.work.ExecuteThread.run"
           ],
           "env": [],
           "command": "sh -c ls"
       }
   }
   ```

2. **构建上下文参数信息**

   然后会调用HookHandler.doCheckWithoutRequest(CheckParameter.Type.COMMAND, params)

   ```java
   public static void doCheckWithoutRequest(CheckParameter.Type type, Map params) {
           boolean enableHookCache = enableCurrThreadHook.get();
           try {
               enableCurrThreadHook.set(false);
               //当服务器的cpu使用率超过90%，禁用全部hook点
               if (Config.getConfig().getDisableHooks()) {
                   return;
               }
               //当云控注册成功之前，不进入任何hook点
               if (Config.getConfig().getCloudSwitch() && Config.getConfig().getHookWhiteAll()) {
                   return;
               }
               if (requestCache.get() != null) {
                   try {
                       StringBuffer sb = requestCache.get().getRequestURL();
                       if (sb != null) {
                           String url = sb.substring(sb.indexOf("://") + 3);
                           if (HookWhiteModel.isContainURL(type.getCode(), url)) {
                               return;
                           }
                       }
                   } catch (Exception e) {
                       LogTool.traceWarn(ErrorType.HOOK_ERROR, "white list check has failed: " + e.getMessage(), e);
                   }
               }
               doRealCheckWithoutRequest(type, params);
           } catch (Throwable t) {
               if (t instanceof SecurityException) {
                   throw (SecurityException) t;
               }
           } finally {
               enableCurrThreadHook.set(enableHookCache);
           }
   }
   ```

   跟进doRealCheckWithoutRequest(type, params)

   ```java
   public static void doRealCheckWithoutRequest(CheckParameter.Type type, Map params) {
           if (!enableHook.get()) {
               return;
           }
           long a = 0;
           if (Config.getConfig().getDebugLevel() > 0) {
               a = System.currentTimeMillis();
           }
           boolean isBlock = false;
           CheckParameter parameter = new CheckParameter(type, params);
           try {
               LOGGER.info("收集到的checkParameter: " + parameter);
               isBlock = CheckerManager.check(type, parameter);
               LOGGER.info("是否拦截isBlock: " + isBlock);
           } catch (Throwable e) {
               String msg = "plugin check error: " + e.getClass().getName() + " because: " + e.getMessage();
               AbstractRequest request = HookHandler.requestCache.get();
               if (request != null) {
                   StringBuffer url = request.getRequestURL();
                   if (!StringUtils.isEmpty(url)) {
                       msg = url + " " + msg;
                   }
               }
               LogTool.error(ErrorType.PLUGIN_ERROR, msg, e);
           }
           if (a > 0) {
               long t = System.currentTimeMillis() - a;
               String message = "type=" + type.getName() + " " + "time=" + t;
               if (requestCache.get() != null) {
                   LOGGER.info("request_id=" + requestCache.get().getRequestId() + " " + message);
               } else {
                   LOGGER.info(message);
               }
           }
           if (isBlock) {
               handleBlock(parameter);
           }
   }
   ```

   关注isBlock = CheckerManager.check(type, parameter)，这里传进去的parameter是将Type和params进行封装后的CheckParameter：

   ```json
   {
       "type": "COMMAND",
       "params": {
           "stack": [
               "java.lang.UNIXProcess.\u003cinit\u003e",
               "java.lang.ProcessImpl.start",
               "java.lang.ProcessBuilder.start",
               "java.lang.Runtime.exec",
               "java.lang.Runtime.exec",
               "superman.shells.T3OrIIOPShell.getServerLocation",
               "superman.shells.T3OrIIOPShell_WLSkel.invoke",
               "weblogic.rmi.internal.BasicServerRef.invoke",
               "weblogic.rmi.internal.BasicServerRef$1.run",
               "weblogic.security.acl.internal.AuthenticatedSubject.doAs",
               "weblogic.security.service.SecurityManager.runAs",
               "weblogic.rmi.internal.BasicServerRef.handleRequest",
               "weblogic.rmi.internal.wls.WLSExecuteRequest.run",
               "weblogic.work.ExecuteThread.execute",
               "weblogic.work.ExecuteThread.run"
           ],
           "env": [],
           "command": "sh -c ls"
       }
   }
   ```

   跟进check

   ```java
   public static boolean check(Type type, CheckParameter parameter) {
       return checkers.get(type).check(parameter);//调用检测类进行参数检测
   }
   ```

   这里会根据传入的type来调用相应的checkers，这里的checkers就是前面CheckerManager.init()的时候放进去的内容

   由于这里传入的type是command，因此会调用V8AttackChecker的check方法

   ```java
   COMMAND("command", new V8AttackChecker(), 1 << 1),
   ```

   层层追溯，最后调用的是其父类AbstractChecker的check方法

   ```java
   public boolean check(CheckParameter checkParameter) {
           List<EventInfo> eventInfos = checkParam(checkParameter);
           boolean isBlock = false;
           if (eventInfos != null) {
               for (EventInfo info : eventInfos) {
                   if (info.isBlock()) {
                       isBlock = true;
                   }
                   dispatchCheckEvent(info);
               }
           }
           isBlock = isBlock && canBlock;
           return isBlock;
   }
   ```

   跟进checkParam方法（实际会调用V8AttackChecker的checkParam方法）

   ```java
   public List<EventInfo> checkParam(CheckParameter checkParameter) {
   	return JS.Check(checkParameter);
   }
   ```

   跟进JS.Check(checkParameter)

   ```java
   public static List<EventInfo> Check(CheckParameter checkParameter) {
           Type type = checkParameter.getType();
           ByteArrayOutputStream out = new ByteArrayOutputStream();
           JsonStream.serialize(checkParameter.getParams(), out);
           out.write(0);
   
           Object hashData = null;
           if (type == Type.DIRECTORY || type == Type.READFILE || type == Type.WRITEFILE || type == Type.SQL
                   || type == Type.SSRF) {
               byte[] paramData = out.getByteArray();
               if (!Config.getConfig().getLruCompareEnable()) {
                   hashData = ByteBuffer.wrap(paramData).hashCode();
               } else if (paramData.length <= Config.getConfig().getLruCompareLimit()) {
                   hashData = ByteBuffer.wrap(paramData);
               }
               if (Config.commonLRUCache.isContainsKey(hashData)) {
                   return null;
               }
           }
   
           byte[] results = null;
           try {
               results = V8.Check(type.getName(), out.getByteArray(), out.size(), new Context(checkParameter.getRequest()),
                       (int) Config.getConfig().getPluginTimeout());
               LOGGER.info("check的结果是：" + results);
           } catch (Exception e) {
               LogTool.error(ErrorType.PLUGIN_ERROR, e.getMessage(), e);
               return null;
           }
   
           if (results == null) {
               if (hashData != null && Config.commonLRUCache.maxSize() != 0) {
                   Config.commonLRUCache.put(hashData, null);
               }
               return null;
           }
   
           try {
               JsonArray j = new JsonParser().parse(new String(results, "UTF-8")).getAsJsonArray();
               ArrayList<EventInfo> attackInfos = new ArrayList<EventInfo>();
               for (JsonElement e : j) {
                   JsonObject obj = e.getAsJsonObject();
                   String action = obj.get("action").getAsString();
                   LOGGER.info("action is " + action);
                   String message = obj.get("message").getAsString();
                   String name = obj.get("name").getAsString();
                   int confidence = obj.get("confidence").getAsInt();
                   String algorithm = "";
                   if (obj.get("algorithm") != null) {
                       algorithm = obj.get("algorithm").getAsString();
                   }
                   Map<String, Object> params = null;
                   if (obj.get("params") != null) {
                       params = new Gson().fromJson(obj.get("params"), new TypeToken<HashMap<String, Object>>() {
                       }.getType());
                   }
                   obj.remove("action");
                   obj.remove("message");
                   obj.remove("name");
                   obj.remove("algorithm");
                   obj.remove("confidence");
                   obj.remove("params");
                   if (action.equals("exception")) {
                       pluginLog(message);
                   } else {
                       attackInfos
                               .add(new AttackInfo(checkParameter, action, message, name, confidence, algorithm, params, obj));
                   }
               }
               return attackInfos;
           } catch (Exception e) {
               LOGGER.warn(e);
               return null;
           }
   }
   ```

   关注

   ```java
   results = V8.Check(type.getName(), out.getByteArray(), out.size(), new Context(checkParameter.getRequest()),
           (int) Config.getConfig().getPluginTimeout());
   ```

3. **检测插件**

   检测插件分两类：本地插件和 JS 插件。

   * JS 插件由V8引擎执行。大部分的检测都在js端进行
   * 本地插件以XssChecker为例

   JS中通过pulgin.register注册回调函数，而JAVA代码中通过调用native方法来调用该注册函数，获取最后执行结果，决定是拦截请求、放行还是仅打印日志

### 绕过方式

在复现CVE-2020-2551漏洞，远程执行命令时，发现results返回结果为空，没有拦截

```
results = V8.Check(type.getName(), out.getByteArray(), out.size(), new Context(checkParameter.getRequest()),
        (int) Config.getConfig().getPluginTimeout());
```

调试发现，js文件中会通过判断请求url是否为空来判断是否进行校验

```js
// 从 v0.31 开始，当命令执行来自非HTTP请求的，我们也会检测反序列化攻击
// 但是不应该拦截正常的命令执行，所以这里加一个 context.url 检查
if (! context.url) {
	return clean
}
```

而当前拿到的context内容为：

```js
{ 
    body: undefined,
    nic: [
        { 
            ip: '192.168.122.1', name: 'virbr0'
        },
        { 
            ip: '192.168.137.130', name: 'ens33'
        }
    ],
  	header: {},
  	parameter: undefined,
  	server: {
         server: 'weblogic',
         language: 'java',
         os: 'Linux',
         version: '10.3.6.0',
         StandardStart: 'false',
         extra: ''
    },
  	json: undefined,
  	clientIp: '',
  	target: '',
  	source: '',
  	hostname: 'localhost.localdomain',
  	raspId: '',
  	appId: '',
  	requestId: '',
  	appBasePath: '',
  	remoteAddr: '',
  	protocol: '',
  	querystring: '',
  	url: '',
  	method: '',
  	path: ''
}
```

可以看到，这里的url为空，这里将直接return clean

注释掉后，发现可以拦截。

**这里建议，即使没有url，也要校验命令执行的内容，匹配危险命令则拦截或者记录**





rasp这类工具是基于java、php运行期的堆栈信息进行分析，可以尝试使用jni技术进行绕过。java技术栈中的jni的原理是使用java调用c、c++函数，具体实现的思路是jsp编译为class文件，该class通过jni技术调用另外一处dll里的函数绕过黑名单执行命令获取回显，即可实现rasp和安全防护软件的绕过

2. 我们直接使用反射的方式。修改rasp的HookHandler类的变量enableHook设置为false。而这个变量是全局的开关。所以我们只需重新关闭这个开关就可以使rasp失效。实现全局绕过。反射Hook的时候开发者没有考虑到应用程序也能访问rasp的方法和变量。应该把com.baidu.* 开头的也要加入反射hook的黑名单中，只开放一些自己自己需要用的反射方法。
3. 规则缺陷

### 小结

#### 创新点

OpenRASP利用js来编写规则，通过V8来执行js。这样可以更加方便热部署，以及规则的通用性。同时减少了为不同语言重复制定相同规则的问题。

#### 优势

* **上下文感知。**当RASP识别到一个潜在的威胁时，可以获取关于应用程序的当前状态以及哪些数据和代码受到影响的上下文信息。
* **零日保护。**RASP能够洞察应用程序内部的情况，检测到由新攻击引起的行为变化，使它能够根据零日攻击、应用自身未知漏洞对目标应用程序的影响作出反应。
* **误报率低。**无需依靠庞大的威胁情报数据库进行特征码对比，能够获取到当前函数上下文的堆栈信息、异常信息、用户输入信息等，精确分析用户输入在应用程序里的行为，进而轻易地分辨出正常业务请求与攻击请求。
* **漏报率低。**对于被二次加密、混淆后的流量数据，在应用内部，接触到的数据对象仍然是解密后的

#### 缺陷

##### 关于通用性

1. 语言环境的通配适用性

   web应用程序使用不同的语言编写，那么需要用不同的方式来构建RASP，而不仅仅是构建一个java RASP就行了。这会影响到RASP的推广。

2. 部署的通配适用性

   企业内部存在各种各样框架实现的代码，部署环境也存在各种各样的情况，同时这些应用部署在不同的中间件中。不同的框架、不同的中间件部署方式或多或少有所不同，想要实现通配，很难。

##### 关于自身稳定性

1. 执行逻辑稳定性

   如果在RASP所指定的逻辑中出现了严重错误，将直接将错误抛出在业务逻辑中。轻则当前业务中断，重则整个服务中断。例如在RASP的检测逻辑中存在exit()这样的利用，将直接导致程序退出。

2. 自身安全稳定性

   即使原来的应用没有明显的安全危险，但是在RASP处理过程中存在漏洞，而恰巧攻击者传入一个利用这样漏洞的payload，将直接在RASP处理流中完成触发。例如RASP中使用过了受漏洞影响的FastJson库来处理相应的json数据，那么当攻击者在发送FastJson反序列化攻击payload的时候就会造成目标系统被RCE。也就是说，如果RASP自己的代码不规范不安全，最终将导致直接给业务写了个漏洞。

3. 规则的稳定性

   RASP的规则需要经过专业的安全研究人员反复打磨，根据业务来定制化，需要将所有的可能性都考虑进去，同时尽量减少误报。但是由于攻击贡献者水平的参差不齐，很容易导致规则遗漏，无法拦截相关攻击，或产生大量的攻击误报。

##### 关于部署复杂性

理想中最佳的Java RASP实践方式是使用agent main模式进行无侵入部署，但是受限于JVM进程保护机制没有办法对目标类添加新的方法，所以无法进行多次重复字节码插入。目前主流的Java RASP推荐的部署方式都是利用premain模式进行部署，这就造成了必须停止相关业务，加入相应的启动参数，再开启服务。而对甲方来说，重启一次业务完成部署RASP的代价是比较高的。


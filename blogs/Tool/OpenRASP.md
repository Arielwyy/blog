---
title: OpenRASP源码学习
date: 2021-7-18
tags:
 - Tool
 - 笔记
categories:
 - Tool
---

## OpenRASP源码学习

* 入口是`public static void premain(String agentArg, Instrumentation inst)`函数，主要代码如下：

  ```java
  //........省略部分代码........
  JarFileHelper.addJarToBootstrap(inst);
  //........省略部分代码........
  PluginManager.init();
  initTransformer(inst);
  //........省略部分代码........
  ```

* `JarFileHelper.addJarToBootstrap(inst)`的关键是JarFileHelper中`inst.appendToBootstrapClassLoaderSearch(new JarFile(localJarPath))`这行代码，它的作用是将rasp.jar加入到bootstrap classpath里，优先其他jar被加载

* `PluginManager.init()`，初始化插件系统。具体代码如下：

  ```java
  JSContextFactory.init();
  updatePlugin();
  initFileWatcher();
  ```

  * `JSContextFactory.init()`的主要作用是初始化js引擎，执行一堆js文件（一些js环境上的准备）
  * `updatePlugin()`方法读取plugins目录下的js文件，过滤掉大于10MB的js文件，然后全部读入，最后加载到V8引擎中
  * `initFileWatcher()`初始化一个js plugin监视器，一旦插件目录下的js文件发生变化，则调用`updatePluginAsync()`重新去加载所有插件

* `initTransformer(inst)`方法，核心代码，通过加载class，在加载前使用javassist对其进行hook插桩，以实现rasp的攻击检测功能

  ```java
  /**
   * 初始化类字节码的转换器
   *
   * @param inst 用于管理字节码转换器
   */
  private void initTransformer(Instrumentation inst) throws UnmodifiableClassException {
      transformer = new CustomClassTransformer(inst);
      transformer.retransform();
  }
  
  public CustomClassTransformer(Instrumentation inst) {
      this.inst = inst;
      inst.addTransformer(this, true);
      addAnnotationHook();
  }
  
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

* 调用`inst.addTransformer(new CustomClassTransformer(), true)`方法

  * 使用CustomClassTransformer是一个Class转换器，这样，每一个类的字节码在加载之前都会调用`CustomClassTransformer.transform(..)`方法

  * 对字节码进行更改之后，字节码被载入JVM中，接下来继续类加载过程：加载->验证->准备->解析->初始化。

  * `CustomClassTransformer`类在初始化的时候创建了很多个ClassHook对象，代码如下：

    ```java
    public CustomClassTransformer() {
            hooks = new HashSet<AbstractClassHook>();
    
            addHook(new WebDAVCopyResourceHook());
            addHook(new CoyoteInputStreamHook());
            addHook(new DeserializationHook());
            addHook(new DiskFileItemHook());
            addHook(new FileHook());
            //.....省略......
    }
    ```

  * `CustomClassTransformer.transform(..)`方法，如果当前加载的类是需要转换的，即`hook.isClassMatched(className)`返回true，就会调用`hook.transformClass(className, classfileBuffer)`对字节码进行转化

    ```java
    public byte[] transform(ClassLoader loader, String className, Class<?> classBeingRedefined, ProtectionDomain domain, byte[] classfileBuffer) throws IllegalClassFormatException {
        if (loader != null && jspClassLoaderNames.contains(loader.getClass().getName())) {
            jspClassLoaderCache.put(className.replace("/", "."), new WeakReference<ClassLoader>(loader));
        }
        for (final AbstractClassHook hook : hooks) {
            if (hook.isClassMatched(className)) { //////
                CtClass ctClass = null;
                try {
                    ClassPool classPool = new ClassPool();
                    addLoader(classPool, loader);
                    ctClass = classPool.makeClass(new ByteArrayInputStream(classfileBuffer));
                    if (loader == null) {
                        hook.setLoadedByBootstrapLoader(true);
                    }
                    classfileBuffer = hook.transformClass(ctClass); //////
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

  * `hook.transformClass`的代码在AbstractClassHook中实现，如下所示：

    ```java
    public byte[] transformClass(String className, byte[] classfileBuffer) {
            try {
                ClassReader reader = new ClassReader(classfileBuffer);
                ClassWriter writer = new ClassWriter(reader, computeFrames() ? ClassWriter.COMPUTE_FRAMES : ClassWriter.COMPUTE_MAXS);
                LOGGER.debug("transform class: " + className);
                ClassVisitor visitor = new RaspHookClassVisitor(this, writer);
                reader.accept(visitor, ClassReader.EXPAND_FRAMES);
                return writer.toByteArray();
            } catch (RuntimeException e) {
                LOGGER.error("exception", e);
            }
            return null;
        }
    ```

  * 这段代码调用了ASM库，ASM的核心，采用的是visitor的模式，提供了ClassReader和 ClassWriter这两个非常重要的类以及ClassVisitor这个核心的接口。ClassVisitor这个接口，定义了一系列的visit方法，而这些visit方法，我们通过实现ClassVisitor接口中的visit方法(其实就是一堆的回调函数)就能够得到相应的信息。比如上面代码中，`reader.accept()`接受一个ClassVisitor实例作为参数，在操作类、方法、注释时，只需要重写`classVisitor.visitMethod()`、`ClassVisitor.visitAnnotation()`等方法

  * 重写visitMethod方法

    ```java
    @Override
    public MethodVisitor visitMethod(int access, String methodName, String argTypeDesc, String signature, String[] exceptions) {
    	MethodVisitor mv = super.visitMethod(access, methoname, argTypeDesc, signature, exceptions);
    	return mv;
    }
    ```

  * 也就是说对于一个方法，它会返回一个mv对象，如果要修改其中的逻辑，就只需要对mv进行操作，例如下面这段代码就实现了在方法中插入一些代码

    ```java
    //判断方法名，为了保证唯一性，真正使用时还需要判断方法描述符是否一致
    if ("main".equals(methodName)) {
    	System.out.printIn("methodName is:" + methodName);
    	//返回一个新的MethodVisitor
    	return new MethodVisitor(api, mv) {
    	/**
    	* 增加要插入的asm代码
    	*/
    	@0verride
    	public void visitCode( ) {
    		mv.visitFieldInsn(GETSTATIC, "java/lang/System", "out", "Ljava/io/Printstrean;");
    		mv.visitIntInsn(BIPUSH，8);
    		mv.visitMethodInsn(INVOKESTATIC, "cn/org/javaweb/test/TestInsert", "hello", "(I)I", false); //插入一个调用TestInsert类中的hello方法
    		Mv.visitMethodInsn(INVOKEVIRTUAL, "java/io/PrintStream", "println", "(I)V", false);
    		super.visitCode();
    		}
    	};
    }；
    ```

  * 在visitMethod方法中，ClassHook的hookMethod方法被调用，进行了字节码的修改（hook），然后返回修改后的字节码并加载，最终实现了对class进行插桩。

  * 以FileHook为例，hookMethod方法如下：

    ```java
    public MethodVisitor hookMethod(int access, String name, String desc, String signature, String[] exceptions, MethodVisitor mv) {
            if (name.equals("listFiles")) {
                return new AdviceAdapter(Opcodes.ASM5, mv, access, name, desc) {
                    @Override
                    protected void onMethodEnter() {
                        loadThis();
                        invokeStatic(Type.getType(HookHandler.class),
                                new Method("checkListFiles", "(Ljava/io/File;)V"));
                    }
                };
            }
            return mv;
        }
    ```

  * `invokeStatic(Type.getType(HookHandler.class),new Method("checkListFiles", "(Ljava/io/File;)V")`这行代码调用了静态方法`HookHandler.checkListFiles`来实现对`java.io.File.listFiles`方法的检测

  * 各关键函数的检测有些区别，但都是最后调用`com.fuxi.javaagent.plugin.check`进行检测，而`com.fuxi.javaagent.plugin.check`最后调用了各js函数来检测。代码如下：

    ```java
    checkProcess = processList.get(i);
    function = checkProcess.getFunction();
    try {
        tmp = function.call(this, scope, function, functionArgs);
    } 
    //......省略......
    ```

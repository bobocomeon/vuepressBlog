# webpack相关
# 打包工具
### npm安装的背后思想
- 执行npm install命令后，会先检查并获取npm配置，这里的优先级为，
> 项目的.npmrc文件>用户的.npmrc文件>全局的.cnpmrc文件>npm内置的.npmrc文件
- 然后检查项目中是否有package-lock.json文件
  - 如果有，检查package-lock.json和package.json中声明的依赖是否一致，不一致，按照package.json安装，并更新package-lock.json
  - 如果没有就根据package.json递归构建依赖树，然后按照构建好的依赖树下载完整的依赖资源，在下载时会检查是否存在相关资源缓存
    - 存在就将缓存内容解压到node_modules中，
    - 否则就先从npm远程仓库下载包，校验包的完整性，并添加到缓存，同时解压node——modules，最后生成package-lock.json

  
### npx的作用
> 解决痛点是，npm的一些快速开发，调试，以及项目内使用全局模块的痛点
- 实现的原理是，它可以直接执行node_modules/.bin文件夹下的文件，在运行命令时，npx可自动去node_modules/.bin路径和环境变量 $PATH 里检查命令是否存在，而不需去package.json中定义相关script
- 还有一个更实用的好处是，npx执行模块时会优先安装依赖，但是安装执行后便删除依赖，这就避免全局安装模块带来的问题。
比如运行如下命令，npx会将 create-react-app 下载到一个临时目录，使用以后再删除
```js
npx create-react-app cra-project
```

### yarn解决的问题
- 通过yarn.lock等机制，保证了确定性，相同的依赖环境在任何机器和容器下都可以以相同的方式被安装
- 采用模块扁平安装模式，将依赖包的不同版本，按照一定策略归结为单个版本，已避免创建多个副本造成冗余
- 网络性能更好，yarn采用请求排队理念，类似并发连接池，能更好的利用网络资源，同时引入更好的安装失败时的重试机制
- 采用缓存机制，实现了离线模式

安装机制：
> 检测包 =》 解析包 =》 获取包 =》链接包 =》 构建包
主要流程是检测项目中是否存在一些npm相关we年，再获取package.json定义的依赖，采用遍历首层依赖的方式获取依赖包的版本信息，以及递归查找每个依赖下嵌套依赖的版本信息，并将解析过和正在解析的包用一个Set数据解决来存储。

## ci环境的npm优化及更多工程问题解析
上传package-lock.json到仓库中，以保证依赖安装的一致性，项目中使用package-loack.json还可以显著加速依赖安装时间，这是应为package-lock.json中缓存了每个包的具体版本和下载链接，不需要再去远程仓库查询。
- 使用npm的建议
  - 使用高版本的npm，保证npm的最基本的先进和稳定性
  - 可以修改package.json中版本号，并执行npm install来升级版本
  - 删除某些依赖，执行npm uninstall命令验证没问题后，提交新的package.json、package-lock.json文件。

## 一个现代化构建工具，需要重点考量/实现哪些环节
1. code splitting
  - 代码分割，在构建打包时，能导出公共模块、避免重复打包、以及页面加载运行时，实现最合理的按需加载策略。
2. hashing
  - 最大化的利用缓存机制，构建工具进行打包的前提是对各个模块依赖关系进行分析，并根据依赖关系，支持开发者自行定义hash策略
  - 就出现了chunkhash和contenthash
    - chunkhash会根据入口文件进行依赖解析，如果改动了业务项目入口文件，就不会引起公共库的hash值变化
    - contenthash会根据文件具体内容生成hash值，
3. Importing Modules，即依赖机制
兼容不能履行的modulkes importing方案
4. 对解析和导入非js资源的支持能力，比如图片，css，html等资源文件
5. 支持配置多种打包模式的输出
6. Transformations： 支持对代码压缩，无用代码删除。

# Babel
- babel-polyfill，提供代码补丁，可以在不兼容某些新特性上，实现该新特性，但是如果粗暴一次性导入，会在成项目size过大，且污染全局变量的问题
- babel-polyfill结合@babel/preset-env + useBuiltins（usage） + preset-env targets 的方案是更流程的，可根据环境自动按需加载polyfills
```js
{
  'presets': [
    ['@babel/env', {
      useBuiltIns: 'usage',
      targets: {chrome: 44}
    }]
  ]
}
```
这里的useBuiltins配置为usage，他可以真正根据代码情况，分析AST进行更细颗粒度的按需引用，但是这种基于静态编译的按需加载补丁也是相对的，应为javascript是一种弱规则动态语音，比如代码foo.includes(() => {}),无法判断这里是includes是数组原型还是字符串原型。，一版做法就是将两种同时打包

- 从工程化的角度来看，一个趋于完美的polyfill设计应该满足的核心原则是按需加载补丁，主要包括按照用户终端环境和按照业务代码使用情况。

## Babel是什么
- @babel/core 是Babel实现转换的核心
- @babel/cli 是Babel提供的命令行，可在终端通过命令行的方式运行，编译文件或目录
- @babel/standalone 可在非node.js环境下，自动编译含text/babel或text/jsx的type值得script标签，可在浏览器直接执行。
- @babel/parser Babel用来对js语言解析的解析器，返回一个针对源码编译得到的AST
- @babel/traverse 对AST遍历的能力
- @babel/types 提供对具体AST节点修改的能力
- @babel/generator 对新的AST进行聚合生成js代码
- @babel/preset-env  直接暴露给开发者在业务中运行包的能力
- @babel/runtime 含有Babel编译时所需的一些运行的helpers，供业务代码引入模块化的Babel helpers函数，对generator和async函数进行降级。
- @babel/plugin-transform-runtime 用于编译时，作为 devDependencies 使用；@babel/plugin-transform-runtime 将业务代码编译，引用 @babel/runtime 提供的 helpers，达到缩减编译产出体积的目的；@babel/runtime 用于运行时，作为 dependencies 使用
- @babel/plugin-syntax-* 是 Babel 的语法插件，作用是扩展@babel、parser的一些能力，提供给工程使用。
- @babel/plugin-proposal-* 用于编译转换在提议阶段的语言特性
- @babel/plugin-transform-* 是 Babel 的转换插件， 比如简单的 @babel/plugin-transform-react-display-name 插件，可以自动适配 React 组件 DisplayName


## 指定一个企业级公共库的设计原则
- 对于开发者共创的公共库，最大化确保开发体验，最快的搭建调试和开发环境，安全的发版维护
- 公共库文档建设完善，公共库指质量保障，接入和使用负担最小

### 实战打造一个公共库
1. 支持script标签引入，可以将公共库脚本编译为 UMD 方式，浏览器可直接引入打包后dist目录中的编译后资源，如果需要支持全局命名空间，需配置插件
```js
plugins: [
  ["@babel/plugin-transform-modules-umd", {
    exactGlobals: true,
    globals: {
      index: 'AnimalApi'
    }
  }]
]
```
还可在webpack.config.js中的output配置library将xxx作为公共库对外暴露的命名空间，libraryTarget： var。


## 代码拆分和按需加载：缩减 bundle size，性能做到极致
- 按需加载表示代码模块在交互需要时，动态引入，按需打包针对第三方依赖库，以及业务模块，只打包真正运行时可能会需要的代码。
- 目前按需打包通过两种方式进行
  - 使用ES Module支持的Tree Shaking方案，在使用构建工具时，完成按需打包
  - 使用babel-plugin-import为主的Babel插件，实现自动按需打包。
### babel-plugin-import原理
- babel插件核心依赖于对AST的解析和操作，通过对AST语法树进行转换的过程中介入，通过相应的操作，最终让生成的结果发生改变。

### 动态导入以及按需加载
- 早起import是完全静态化，现在dynamic import可以进行动态导入
```js
// 实现一个dynamicImport
const importModule = url => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const tempGlobal = "__tempModuleLoadingVariable" + Math.random().toString(32).substring(2)
    script.type = 'module'
    script.textContent = `import * as m from "${url}"; window.${tempGlobal} = m;`;
    // load回调
    script.onload = () => {
      resolve(window[tempGlobal])
      delete window[tempGlobal]
      script.remove()
    }
    // error回调
    script.onerror = () => {
      reject(new Error("Failed to load module script with URL " + url));
      delete window[tempGlobal]
      script.remove()
    }
    document.documentElement.appendChild(script)
  })
}
```
### Webpack 赋能代码拆分和按需加载
- 通过入口配置手动分割代码
- 动态导入支持： require.evsure(), 能将其参数对应的文件拆分到一个单独的bundle中，次bundle会被异步加载，目前已被dynamic import取代。调用import(), 被请求的模块和它引用的所有子模块，会分离到一个单独的chunk中。
- 通过splitChunk插件提取公共代码（公共代码分割）
#### webpack在编译构建时，是怎么处理代码中的dynamic import的呢。
在webpack构建时，可以读取到import参数，即便是参数内的注释部分，webpack也可以获取并理解，`webpackChunkName: "chunk-name", webpackMode: "lazy"`,

具体流程
1. 开始加载异步脚本
2. 存储异步脚本的promise回调
3. 发起jsonp请求，异步加载脚本，并定义成功、失败回调
4. 异步脚本执行
5. 异步脚本执行完毕后，执行全局被重写的push方法
6. 在被重写的push方法中，执行异步脚本promise回调
7. 执行加载成功的回调

#### Webpack 中 splitChunk 插件和代码分割
> 代码分割的核心意义在于避免重复打包以及提升缓存利用率，进而提升访问速度，我们将不常变化的第三方依赖库进行代码拆分，方便对第三方依赖库缓存，同时抽离公共逻辑，减少单个文件的size大小
- 可被共享（即被重复引用的）模块或者node_modules中的模块
- 在压缩前体积大于30kb的模块
- 在按需加载模块时，并行加载的模块不得超过5个
- 在页面初始化加载时，并行加载的模块不得超过3个。


## tree shaking： 移除javascript上下文中未引用的代码
> tree shaking是在编译时进行无用代码消除，因此需在编译时确定依赖关系，进而确定哪些代码可被摇掉。
- import模块名只能是字符串常量
- import一般只能在模块的最顶层出现
- import binding是immutable的

1. 这些特点使得ESM具有静态分析的能力，而CommonJS定义的模块化规范，只有在执行代码后，才能动态确定依赖模块，因此不具备Tree Shaking的先天条件
2. 副作用模块
```js
export function add(a, b) {
	return a + b
}
export const memoizedAdd = window.memoize(add)
```
- 创建一个纯函数add，如果没有其他模块引用add函数，那么add函数可以被Tree Shaking掉，接着调用window.memoize方法，并传入add函数作为其参数。
- 工程化工具比如webpack并不知道window.memoize方法会做什么事情，会触发某些副作用
- 打包工具为了安全起见，几遍没有其他模块依赖的add函数，那么也要将add函数打包到最后的bundle中
- 为了解决副作用模块，webpack给出了自己的方案，可利用package.json的sideEffects属性告诉工程化哪些模块具有副作用。哪些剩余模块没有副作用可以被Tree Shaking优化
- 设置最小化副作用范围，以及原子化和颗粒化的导出。

### Webpack 和 Tree Shaking
在webpack4.0会自动开启Tree Shakink能力，`usedExports`对模块进行分析和标记，而这些压缩插件负责根据标记结果进行代码删除。
```js
const config = {
  mode: 'production',
  optimization: {
    usedExports:true, // 收集的信息会被其他优化手段或者代码生成使用，比如未使用的导出内容不会被生成，导出内容会被处理成单个标记字符，压缩工具中的无用代码清除会受益于改选项
    minimizer: [
      new TreserPlugin({}) // 支持删除死代码的压缩器
    ]
  }
}
```
### Vue 和 Tree shaking
在vue2.0中，Vue对象会存在一些全局API，比如`Vue.nextTick(() => {})`,这种api就算没有被使用也不容易tree Shaking掉，在vue3.0中进行重构，全局API需通过原生ES Module的引用方式进行具名引用。`import { nextTick } from 'vue'`

### 如何设计一个兼顾 Tree Shaking 和易用性的公共库
> 如果我们一ESM的方式对外暴露代码，那么就很难直接兼容CommonJS规范，也就是说在Node.js环境中，使用者直接以require方式引用的话，就会报错，如果以CommonJS规范对外暴露代码，又不利于Tree Shaking

package.json 语法中，只有一个入口main,main来暴露 CommonJS 规范打包的代码dist/index.cjs.js，module并非 package.json 的标准字段，而是打包工具专用的字段，用来指定符合 ESM 标准的入口文件
```js
{
  "name": "Library",
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js"
}
```
当`require('Library')`时，webpack会找到`dist/index.cjs.js`,当`import Library from 'Library'`，webpack会找到`dist/index.esm.js`

### CSS 和 Tree Shaking
> 实现原理，css的tree shaking要在样式表中，找出没有被应用带选择器样式，进行删除，核心原理是利用PostCSS插件能力，基于AST技术，找出无用代码进行删除
- 遍历所有css文件的选择器
- 根据所有css文件的选择器，在js代码中完成选择器匹配
- 如果没有匹配到，则删除对应选择器的样式代码

遍历css选择器是利用`Babel`依靠ASt技术，完成对js代码的遍历分析。在样式世界中，PostCss起到了Babel作用，提供一个解析器，它能将CSS解析成AST抽象语法树，达到Tree Shaking目的

### 如何理解 AST 实现和编译原理
> 解析步骤： 源代码 =》 词法分析 =》 分词结果 =》 语法分析 =》 AST

### Webpack 的初心和揭秘
> 不是所有浏览器都直接支持javascript规范，前端需要管理依赖脚本，把控不同脚本加载的顺序，前端按需加载不同类型的静态资源， 并保证每个模块都处于一个隔离的函数作用域范围

- 过程： 启动项目打包器 =》 分析入口脚本 =》 递归解析AST获取依赖 =》 以入口脚本为起点递归执行模块 =》 产出bundle
- Webpack 理念：
  - 使用module map 维护项目中的依赖关系
  - 使用包裹函数，对每个模块进行包裹
  - 最终合并bundle内容
- Rollup
  - 使每个模块拍平
  - 不使用包裹函数，不需对每个模块进行包裹

#### 手动实现打包器
- 读取入口文件，基于AST分析入口文件，并产出依赖列表
- 使用Babel将相关模块编译成ES5
- 将每个依赖模块产出一个唯一的ID，方便后续读取模块相关内容
- 将每个模块以及经过Babel编译后的内容，存储到一个对象中进行维护
- 遍历上一步中的对象，构建出一个依赖图，将模块内容产出

## 从编译到运行，跨端解析小程序多端方案
单纯的编译时方案或运行时方案都不能完全满足跨端需求，因此两者结合而成的第三种，编译时和运行时的结合方案，是目前的主流技术
### 小程序多端——编译时方案
> 主要工作量是集中在编译转化环节上，这类多段框架基于AST技术进行各平台小程序适配，主要流程如下
开发者代码 类vue/react =》 AST解析成AST树 =》 经过修改优化生成新AST树 =》 生成小程序代码

- 已类vue实现的mpvue为例
  - 内置Vue runtime能力，同时添加小程序平台支持，实例化一个vue实例，运行时将vue实例和小程序实例进行关联，做到数据变动时，小程序调用setData() 渲染层更新，也生成一份虚拟节点VNode，diff新旧两份虚拟节点patch。
  - 这样就做到了数据部分让vue运行版接手，渲染部分让小程序架构接手。
- 类 React 风格的编译时和运行时结合方案（tora）
  - 强行静态编译
  - 运行时处理型
- 在VNodeData数据中包含了节点信息，比如type通过递归VNodeData这个数据结构，根据不同的type渲染出不同的小程序模板，比如 `type="view"`
- 在初始化阶段第一次mount，通过`setData()`初始化小程序，具体通过递归数据结构，渲染小程序页面，在数据计算阶段，通过react计算信息，更新数据，通过setData方法触发小程序的渲染更新。




## 升级webpack4踩的坑
- 原本压缩js的插件被废弃，需要安装新的插件
- 提取第三方库和公共模块的CommonChunkPlugin被废弃，使用optimization.splitChunks，对模块进行拆包，css提取也变了mini-css-extract-plugin
- 更新vue-loader以及在配置的plugin中new该插件，vue和vue-loader匹配问题
- 添加mode我，默认为production
- babel插件，webpack不支持import动态加载，需要使用babel-plugin-dynamic-import-webpack插件
- 引入了tree shaking 不打包无用代码，通过import和export的静态结果特性


## 组件实现按需加载
### 单独打包样式和组件
1. 打包单独的css文件
2. 打包单独的组件内容
通过`babel-plugin-import`来实现按需加载
```js
{
  "plugins": [
    [
      "import", {
        "libraryName": "react-ui-components-library",
        "libraryDirectory": "lib/components",
        "camel2DashComponentName": false
      }
    ]
  ]
}
```
分析模块依赖关系，impoer的包是不是antd，也就是libraryName，是的话就收集起来，在判断这些是否，得到这些依赖关系之后，在生成引入代码。

## webpack优化
### production模块打包自带优化
- tree-shaking
- 打包时移除js中未使用的代码，它依赖于ES6模块的import和export的静态结构特性，开发时引入一个模块，如果只引用了其中一个功能，上线打包时只会把用到的功能打包进bundle中，其他没用到的不会打包进来。实现一个最简单的优化
- es6是采用静态模块，在编译时就能确定模块之间的依赖关系，每个模块的输入输出都是确定的，es6import进去是值得引用，内部改变了值会影响到值得输出，但是可以通过静态文件分析，在编译时候确定模块之间的依赖关系，通过tree-shrking的方式删除无用代码，减少文件体积，从而提高运行性能。

- scope hoisting
分析模块之间的依赖关系，尽可能的将打散的模块合并到一个函数中，但是前提是不造成代码冗余，因此只有那些被引用了一次的模块可能被合并，scope hoisting必须知道模块之间的依赖关系，就必须使用es6模块语句。

### css优化
- 将css提取到独立文件中，对每个包含css的js文件都创建一个css文件，支持按需加载css和sourceMap，可用于异步加载，不重复编译，性能更好。
- 使用`optimize-css-assets-webpack-plugin`插件来完成css压缩

## js优化
code splitting，把代码分离到不同的bundle中，可以按需加载或者并行加载这些文件，代码分离用于获取更小的bundle，以及控制资源加载优先级
### 通过splitChunksPlugin配置参数
- 公用代码或者node_modules文件组成的组件模块
- 打包的代码大小超过30kb，最小化压缩之前
- 按需加载代码时，同时发送请求最大数量不超过5
- 页面初始化同时发送请求最大数量不超过3

### noparse
在引用第三方模块时，比如jq、bootstrap这些，内部不会依赖其他模块，就不需要webpack再去解析他们内部依赖关系

### ddlplugin
在应用第三方模块时，例如vue、react，这些框架文件一版是不会修改，而每次打包都需要去解析他们，会影响打包速度。通过dllPlugin插件实现一个个动态链接库，只构建一次，从而节省打包时间
只要用来DllPlugin和DllReferencePlugin插件
## 开启多线程压缩和happPack


## ES6 模块与 CommonJS 模块的差异
- commonjs输出的是一个值得拷贝，es模块输出是值得引用
  - commonjs模块输出是值得拷贝，一旦输出这个值，模块内部的变化就影响到这个值
  - js引擎对脚本静态分析时，遇到模块加载命令import，就只生成一个只读引用，等到脚本真正执行时吗，在根据这个只读引用，到被加载的模块中读取值
- CommonJS 模块是运行时加载，ES6 模块是编译时输出接口
  - 运行时加载，commonks模块就是对象，输出时先加载整个模块，生成一个对象，然后再从对象上读取方法，被称为运行时加载
  - 编译时加载，import可以执行加载某个输出值，而不是加载整个模块
  - import命令会被js引擎静态分析，在编译时就引入模块代码，而不是代码运行时加载，无法实现条件加载，而且必须运行在顶层，只能是字符串常亮。

## CSS Modules 和 scoped
- css Modules 通过样式名给hash字符串后缀方式，在特定作用域语境中的样式编译后样式全局唯一，直接替换了类名，只适用于某个组件，其他组件不适用
- scoped 在dom结构以及css样式上加上唯一不重复的标记，保证唯一，形成模块私有化的目的，不会被其他组件污染
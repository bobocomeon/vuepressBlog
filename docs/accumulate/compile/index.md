## vue原理常见问题
### 响应式系统
通过`Object.defineproperty`来实现对对象的「响应式」化，入参是一个 `obj`（需要绑定的对象）、`key`（`obj`的某一个属性），`val`（具体的值）。经过 `defineReactive` 处理以后，我们的 `obj` 的 `key` 属性在「读」的时候会触发 `reactiveGetter` 方法，而在该属性被「写」的时候则会触发 `reactiveSetter` 方法。
```js
function defineReactive (obj, key, val) {
    Object.defineProperty(obj, key, {
        enumerable: true,       /* 属性可枚举 */
        configurable: true,     /* 属性可被修改或删除 */
        get: function reactiveGetter () {
            return val;         /* 实际上会依赖收集，下一小节会讲 */
        },
        set: function reactiveSetter (newVal) {
            if (newVal === val) return;
            cb(newVal);
        }
    });
}
```
### 初始化前，beforeCreate做了写啥
- 合并options配置
  - 初始化`new Vue`
  - 子组件初始化，确认组件的父子关系和初始化某些实例属性
  - 将父组件的自定义事件传递给子组件
  - 提供将render函数转为vnode的方法
  - 执行组件的beforeCreate钩子函数
  - 并且在当前生命周期，是不能访问this中data定义的变量，这个时候data中的变量，还没挂载到this上
  - 但是插件内部的install方法是通过Vue.use方法，一般选择在beforeCreate这个钩子内执行
### 为什么要依赖收集
1. 首先在Observer的过程中会注册get方法，该方法是用来进行依赖收集，在它的闭包中有一个`Dep`对象，这个对象用来存放`Watcher`对象的实例，其实依赖收集就是把`Watcher` 存放对应的`Dep`对象中去。
2. get方法可以让当前的`Watcher`对象（Dep.target）存放到它的`sub`中`addSub`方法，在数据变化时，`set`方法会调用`Dep`对象的`notify`方法通知它内部所有的`Watcher`对象进行视图更新。

这是 Object.defineProperty 的 set/get 方法处理的事情，那么「依赖收集」的前提条件还有两个：
1. 触发 get 方法；
2. 新建一个 Watcher 对象。

这个我们在 Vue 的构造类中处理，新建一个 Watcher 对象只需要 new 出来，这时候 Dep.target 已经指向了这个 new 出来的 Watcher 对象来
```js
class Watcher {
    constructor () {
        /* 在new一个Watcher对象时将该对象赋值给Dep.target，在get中会用到 */
        Dep.target = this;
    }
    /* 更新视图的方法 */
    update () {
        console.log("视图更新啦～");
    }
}
Dep.target = null;
```
而触发 get 方法也很简单，实际上只要把`render function`进行渲染，那么其中依赖的对象就会被读取，
![alt text](/images/image.png)
### 什么是VNode
`render function` 会被转化成 `VNode` 节点，`Virtual DOM` 其实就是一棵以 `JavaScript` 对象（`VNode` 节点）作为基础的树，用对象属性来描述节点，实际上它只是一层对真实 `DOM` 的抽象。最终可以通过一系列操作使这棵树映射到真实环境上。

### 编译Compiler阶段做了些啥事
`compiler`阶段可以分为 `parse`、`optimize`、`generate`，最终需要得到 `render function`。

`parse`会通过正则等方式将`template`模版中进行字符串解析，得到指令、`class`、`style`，形成`AST`。

### 数据更新视图
> 对`model`进行操作的时候，会触发对应`Dep`中的Watcher对象，`Watcher`对象会调用对应的`update`来修改视图，最终是将新产生的 `VNode` 节点与老 `VNode` 进行一个 `patch` 的过程，比对得出「差异」，最终将这些「差异」更新到视图上。
其中会进行dom 的diff操作，在patch的时候，主要是通过同层结点对比，而非对树进行逐层搜索遍历的方式，所以时间复杂度只有 O(n)，是一种相当高效的算法

因为patch的主要功能是对比两个VNode结点，将差异更新到视图上，

### 异步更新

### computed被收集的过程
- 响应式数据被读取到了会触发getter，收集当前的watcher到依赖中，如果模板中用到了，就会读取渲染watcher，在计算属性里用到了就会读取渲染wathcer，只要值发生变化了就会通知计算属性重新计算并进行值返回，最后渲染。
- computed 属性为什么能够在依赖改变的时候，自己发生变化？

(我说 computed 和 watch 公用一个 Watcher 类，在 computed 的情况下有一个 dep 收集依赖，从而达到更新computed属性的效果，顺便跟他讲了computed Watcher如何跟渲染Watcher关联，以及 Vue 在二次收集依赖时用 cleanupDeps 卸载一些无用的 dep)
### 为什么计算属性有缓存功能
在计算属性经过计算后，内部的标志位dirty已经表明计算过了，再次访问会直接访问读取的值，计算属性如果依赖了响应式属性，内部响应式会收集`computed-watcher`，当响应式值变化后会通知计算属性重新计算，也会通知页面重新渲染，渲染时会重新读取计算后的值。
### computed属性和watch属性分别什么场景使用
当模板中的某个值需要通过一个或多个数据计算得到时，或者对值进行大量处理，就使用计算属性，还有计算属性不接受参数必须要有值返回，当监听属性主要是监听某个值变化，对新值进行逻辑处理。

### 自定义事件的机制
子组件使用this.$emit触发事件时，会在当前实例的事件中心去查找对应的事件，然后执行，不过这个事件是在父组件的作用域中定义。$emit的参数会传递给父组件的回调函数，完成组件通信。

### 组件库中命令式弹窗组件的原理
使用extend将组件转为构造函数，在实例化这个构造函数后，就会得到$el属性，也就是组件真实的dom，这个时候可以操作得到真实的dom去挂载，使用命令式也能调用

## vuex常见问题
### vuex为什么把异步操作分装在action中
其实是为了代码隔离，mutation同步是必须的，只做纯函数的变化，不受控的代码集中到action，异步竞态是用户自己的事，处理好了给mutation，去改变state的值。

### vuex直接修改state 与 用dispatch／commit来修改state的差异
使用commit提交到mutation修改state的优点，记录每一次state变化的快照，保存状态快照，做到数据可溯源，单向操作，也便于调试，严格模式下，并且每次都要commit来修改state

### 什么时候该用vuex
1. 无法很好进行数据管理的时候，当一个组件需要多次派发数据同步
2. 跨组件共享数据，以及跨页面共享数据

### vuex碰上v-model
```js
// 可以把v-model拆成
<input :value="message" @input="updateMessage">
computed: {
  ...mapState({
    message: state => state.obj.message
  })
},
methods:{
  updateMessage(e) {
    this.$store.commit('updateMessage', e.target.value)
  }
}
```

### render-watcher、conputed-watcher、user-watcher区别和原理
#### render-watcher
- render-watcher是vue开发中最重要的实例了，data中属性的更新就会触发视图的更新，在初始化过程中，object.defineproperty会进行依赖收集,收集到的就是render-watcher，添加到这个属性的依赖列表（Dep）实例中。
- Setter派发更新时，那就是执行render-watcher的回调，Dep实例就会就会通知，然后就会执行这个属性的Watcher实例上的update方法，这个run方法会重新生成执行render-function，如果patch diff更新视图。

#### user-watcher
- 是通过watch或者&watch显示创建的Watcher，这类watch允许开发者自定义响应式数据的变化，开发者可以指定某个响应式数据作为监听目标，并提供一个回调函数，当监听数据变化时，回调函数也会执行。
- 常用于通过监听数据变化执行异步操作，或者根据数据变化进行逻辑判断等任务
#### conputed-watcher
- 依赖追踪
  - 当定义一个computed属性时，会创建一个Computed Watcher，这个Watcher会在初次访问计算属性时，执行其定义的函数，同时自动追踪函数中所依赖的所有响应式属性。
  - 依赖收集： 在computed对象初始化期间，任何被访问的响应式数据都会将computed watcher收集他们各自的依赖列表（Dep实例），一旦依赖数据发生变更，Computed Watcher就会被通知;
- 缓存
  - computed具有缓存机制，当计算属性经过计算后，内部的标志位会表明已经计算过了，Computed-watcher会缓存计算结果，只有依赖的数据发生变化会重新计算，因为内部的响应式数据会收集computed-watcher，变更后通知计算属性基性计算，也会通知页面重新渲染，渲染时会重新读取重新计算后的值

#### 举例
```js
data() {
  return {
    a: 1,
    b: 2
  };
},
computed: {
  sum() {
    return this.a + this.b;
  }
}
```
- 初始化: 当组件被创建时，vue在进行响应式收集的时候，会分别为a和b创建一个Dep实例，同时对于计算属性sum，vue会创建一个特殊的Watcvher（computed watcher）
- 依赖收集：
  -  当 sum 第一次被访问时，它的 Computed Watcher 被激活。
  -  Computed Watcher 开始执行 sum 的定义函数（return this.a + this.b;）。
  -  当访问 a 和 b 时，它们各自的 getter 函数被调用。在 getter 中，Vue 检测到当前有一个活跃的 Watcher（sum 的 Computed Watcher）。
  -  a 和 b 的 Dep 将这个 Watcher 添加到它们的依赖列表中。
  -  同时，Watcher 记录它依赖于 a 和 b 的 Dep。（这个是避免重复收集，管理和优化依赖关系，当某个数据项不再使用，watcher可据此清除掉这个数据的依赖关系，减少不必要的计算和监听，精确的更新机制，只有真正依赖的这些数据的Watcher会被通知更新）
-  响应更新：
   -  假设 a 的值从 1 变为 3。a 的 setter 被调用，它通知 a 的 Dep。
   -  a 的 Dep 遍历它的依赖列表（包含 sum 的 Watcher），并通知这些 Watcher 数据已变化。
   -  sum 的 Watcher 收到通知后，标记自己为 "dirty"，表示计算属性的结果可能已经变化，需要重新计算。
   -  下次 sum 被访问时，它的 Watcher 会重新计算 sum 的值。
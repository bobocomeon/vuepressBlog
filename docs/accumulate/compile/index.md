# vue相关
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

## vuex
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
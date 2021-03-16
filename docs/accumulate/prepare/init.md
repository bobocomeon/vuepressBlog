# Vue 原理解析
- 参考
```
https://blog.csdn.net/qq_46299172/article/details/107609251
https://juejin.cn/post/6844903894980509703
http://caibaojian.com/vue-design/art/9vue-state-init.html
```
## 初始化时beforeCreate之前做了什么
在执行`new Vue()`时，内部会执行一个`this._init()`，是在`initMixin(Vue)`内定义的
### 合并options配置
合并完options并在实例上挂载一个`$options`属性
1. 初始化new Vue()
在执行`new Vue`构造函数时，参数是一个对象，也就是用户自定义配置，会将它和`vue`之前定义的原型方法，全局`API`属性，还有全局的`Vue.mixin`内的参数进行合并,合并成一个新的`options`，最后赋值给一个新属性`$options`

2. 子组件初始化
如果是子组件初始化，除了合并以上那些外，还会将父组件的参数进行合并，比如父组件在子组件上顶一个`event、props`等

经过合并之后就可以通过`this.$options.data`访问到用户定义的data函数,`this.$options.name`访问到用户定义的组件名称

会按照顺序初始化方法
```js
initLifecycle(vm)
initEvents(vm)
initRender(vm)
```
- `initLifecycle(vm)` 主要是确定组件的父子关系和初始化某些实例属性
  - 判断parent结单是否存在，并且判断是否存在抽象节点，如父实例parent是抽象组件，则继续找parent上的parent，直到找到非抽象组件为止。然后将当前实例push到找到父级的`$children`实例属性内，建立父子关系

- `initEvents(vm)`主要作用是将父组件在使用v-on或@注册的自定义事件添加到子组件的事件中心
  - 原生事件
    - 在执行`initEvents`之前的模板编译阶段，会判断遇到的是`html标签`还是组件名，如果是`html标签`会转为`真实dom`之后使用`addEventListener`注册浏览器原生事件。绑定事件是`挂载dom`的最后阶段，这只是初始阶段
  - 自定义事件
    - 经历`options`阶段后，子组件就可从`vm.$options._parentListeners`读取到父组件的自定义事件
  ```js
    <child-components @select="handleSelect" />
  ```
  传过来的时间数据格式是`{select: function(){}}`在`initEvents`方法内定义`vm._events`用来存储传过来的时间集合
- `initRender(vm)`主要作用是挂载可以将`render函数`转为`vnode方法`
  ```js
  export function initRender(vm) {
    vm._vnode = null
    ...
    vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)  //转化编译器的
    vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)  // 转化手写的
    ...`
    }
  ```
  - vm._c转换的是通过编译器将tempate转换而来的render函数
  - vm.$createElement转换的是用户自定义的render函数，将内部自定义的树形结构数据转为vnode实例

- `callHook(vm, 'beforeCreate')`
  - 实例的第一个生命周期钩子阶段的初始化, 确认组件`(Vue实例)`父子关系，将父组件的自定义事件传递给子组件，提供将render函数转化为vnode方法，执行组件beforeCreate钩子函数
  - 插件内部的`install`方法是通过`Vue.use`方法安装一般选择在`beforeCreated`，是由于这个时候可以访问到vue实例，可以进行必要的初始化

- `initInjections(vm)` 主要作用是初始化inject，可以访问到对应的依赖
`provide和inject`主要是为高阶组件/组件库提供实例

## 初始化时created之前做了什么
### initState

- `initProps`
  - 在定义`props`数据时，不将prop值转为响应式数据，值得注意的是，由于`props`本身通过`defineReactive`定义的，所以`props`本身是响应式的，但没有对值进行深度定义，是由于`props`本身是来自父组件的数据，这个数据可能本身就是响应式的了，就不需要重复定义了。

使用了 `toggleObserving(false)`

- `initMethods`
  - key的处理以及是否和属性定义重名，最后将`methods`内的方法挂载到`this`下

- `initData(vm)`
  - 通过`vm.$options.data`得到用户定义的`data`,如果是`function`就执行返回，否则直接返回`data || {}`,检查不能和`props、methods 的 key`重名，然后使用proxy做一层代理，直接可以使用实例this可访问，最后通过observe将每一项数据递归遍历成响应式。
- `initProvide(vm)` 主要作用是初始化`provide`为子组件提供依赖
  - provide和inject绑定并不是可相应的，这是刻意为之，只要父组件提供的这个数据本身响应式的，及时defineReactive，那么这个数据最终也是响应式的。
  - 通过`vm.$options.provide`取得用户定义的`provide`选项,如果是`function`类型就执行得到返回结果，将其赋值给`vm._provided`私有属性，子组件在初始化inject时就可访问到父组件提供依赖

- `callHook(vm, 'created')`，执行用户定义的created钩子函数，有mixin混入也一并执行。

> 在methods内可以使用箭头函数吗
是不可使用，箭头函数在`this`定义时就绑定吗，在`vue`内部，`methods`内的每个方法的上下文就是当前`vm`组件实例，`methods[key].bind(vm)`,而如果使用箭头函数，函数的上下文就变成了父级的上下文。

## 虚拟Dom是怎么生成的

### 谈谈对虚拟dom的理解
- 随着现代应用功能的复杂庞大，管理的状态越多，如果还是使用以前的`javascript`线程去操作dom，对性能会有很大的损耗，而且状态难以管理，逻辑混乱。
- 引入虚拟`dom`，在框架内部就将虚拟dom属性结构与真实dom进行映射，不需命令式操作`dom`，只需将重心转移到维护树形结构，状态改变就会驱动`dom`发生改变,具体`dom`操作框架都帮我们完成，这大部分可在`javascript`线程完成。
- 虚拟`dom`只是一种数据结构，提供了一个抽象层，使得可以跨平台渲染的场景。


## 揭开数据响应式系统的面纱
从initData开始，initData函数最后会执行observe(data, true)
observe会判断是否拥有__ob__属性，因为是第一次初始化，所以肯定是没有的，因此会执行new Observer
new Observer一个实例时会在内部也new一个dep实例，并且添加__ob__属性，再对数组的元素和对象的属性添加数据劫持(defineReactive)
当挂载时，也就是执行vue.$mount这个函数时，会执行mountComponet
mountComponet会声明updateComponet并将updateComponet作为第二个参数去执行new Watcher
new Wathcer构造函数内部会声明一系列属性，最后会执行watcher.get方法
执行watcher.get方法,会触发pustTarget
pustTarget给Dep.target赋值为当前Wathcer实例然后调用watcher.getter
watcher.getter(updateComponent内部有_update和_render函数)，_render函数会对属性求值，也就触发了属性的get操作
属性的get操作会判断Dep.target是否存在
此时Dep.target是存在的，然后执行dep.depend
dep.depend执行Wathcer.addDep
Wathcer.addDep内部进行了避免重复收集依赖的操作，并且收集依赖
执行完addDep后，此次依赖收集就完成了
数据发生更改，触发setter
set会执行dep.notify
dep.notify会去遍历dep.subs观察者数组，遍历执行watcher.update方法
watcher.update执行了queueWatcher
queueWatcher执行了nextTick(flushSchedulerQueue)
nextTick(flushSchedulerQueue)先把flushSchedulerQueue添加进callbacks回调函数数组
其次nextTick执行timerFunc
timerFunc是异步的(通过Promise,MutationObserver,setImmediate,setTimeout这四种异步方法)执行flushCallbacks
flushCallbacks是异步执行callbacks中所有回调函数，也就是异步执行添加进去的flushSchedulerQueue
flushSchedulerQueue会获取时间戳，对id进行排序，最主要是遍历执行watcher.run方法
atcher.run执行watcher.getter
watcher.getter也就是执行updateComponent
updateComponent将虚拟DOM转换成真实DOM，这里就完成了数据更改后的重新渲染
之后返回flushSchedulerQueue中，继续执行后续函数
先resetSchedulerState重置状态
callActivatedHooks调用组件更新并激活钩子函数
callUpdatedHooks触发updated生命周期钩子函数
至此！一个响应式从头到尾正式完成！



## 编译器生成ast到render函数到vnode再到真实dom
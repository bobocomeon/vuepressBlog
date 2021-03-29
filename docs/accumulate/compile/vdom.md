# 虚拟dom
 大部分情况下可以降低使用js去操作跨线程庞大dom所需的昂贵的性能，让dom操作性能高，以及虚拟dom可以使用服务端渲染跨平台使用，使用js对象对真实dom进行描述，有属性，标签名，子节点。
## 谈谈对虚拟dom的理解
1. 随着现在应用功能越来越复杂，管理的状态越多，如果还是使用之前的js去跨线程操作GUI线程的dom，对性能会有很大的损耗，而且状态难以维护，逻辑也变的混乱，引入虚拟dom之后，框架内部将虚拟dom和真实dom做了映射，不需要命令式的去操作dom，开发者之后专心维护这颗树状结构即可，状态的变化回去驱动dom发生改变，具体的dom操作vue帮我们完成，而且是在js线程内完成的。
2. 虚拟dom只是一种数据结果，不仅可以再浏览器环境内使用，还可以再服务端以及跨平台渲染，提供了更多的场景开发。

## 首次渲染和更新页面
### 首次渲染
当执行new Vue，到执行钩子函数beforeMount，执行完`渲染函数_render`，可以拿到VNode，在通过`vm_update方法`转为`真实Dom`，
### 更新
数据驱动页面，在数据改变之前会生成两份VNode进行比较，怎么在旧的VNode上面做最小的改动渲染页面。petch之后去更新节点渲染到页面。

## 生成dom
### 元素节点生成dom
1. 会依次判断元素节点（1）、文本节点（3）、注释节点（8）、属性节点（2），分别创建然后依次插入父节点
2. 元素节点，开始创建子节点，遍历VNode每一项，如果某一项是数据，继续递归调用，如果不是就创建文本节点。
### 组件VNode生成Dom
1. 先判断是否是组件，i = VNode.data，将子组件的构造函数实例化，建立父子关系，在init方法内手动进行挂载，在执行组件的`_render()`得到组件内元素节点VNODE，然后执行`vm._update()`,最后在插入Dom。
```js
new Vue ==> vm._init() ==> vm.$mount(el) ==> vm._render()  ==> vm.update(vnode) 
```
### 父子两个组件同时定义了beforeCreate、created、beforeMounte、mounted四个钩子执行顺序
1. 渲染阶段
父beforeCreate => 父created => 父beforeMounte => 子beforeCreate => 子created => 子beforeMounte => 子mounted => 父mounted
2. 子渲染阶段
父beforeupdate => 子beforeupdate => 子updated => 父updated
3. 父渲染阶段
父beforeupdate => 父updated
4. 销毁阶段
父beforeDestroy->子beforeDestroy->子destroyed->父destroyed

### 写 React / Vue 项目时为什么要在列表组件中写 key，其作用是什么？
key是给每一个vnode的唯一key，依靠key更准确更快的拿到oldVnode中对应的vnode节点,而且在比对的时候能更快的找到对应节点进行对比，是复用还是增加，对用一个列表来说，没有改变的节点会原地复用

### diff算法时候设置key和不设置key的区别
不设置key，newCh和oldCh只会进行头尾两端的相互比较，设置key只会，除了头尾两端比较外，还会从用key生成的对象map中查找匹配节点，更高效的利用节点。
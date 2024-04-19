# 原生小程序
## 一次setData做了哪些事
首先在 Component 或者 Page 实例上合并 data；
然后把第一个参数 callback 放到回调函数队列 queue；
接下来发起数据通信，把数据通过桥的方式，由逻辑层 -> Native -> 渲染层，完成视图层更新；
最后执行对应的 callback 函数，完成整个 setData 流程。
## 何为跨端开发？主要应用场景是那些？
1. 跨端"是指能够在多种不同的平台（如iOS、Android、Web等）上运行的应用程序
2. H5:和传统的web应用没什么不同，都是打开URL地址，请求资源、加载数据、绘制页面
## 小程序基础库负责渲染、通信、底层基建等工作，包括怎么把代码渲染到页面上，怎么和逻辑层做通信。
1. 视图层的 JS 就很好理解了，可以理解成我们写的模版结构，比如微信的 WXML。在 WebView 环境下，只能识别 HTML、CSS 和 JS，不能够直接识别 WXML，需要先将 WXML 转成语法树结构，不过这些工作在小程序编译上传阶段就已经完成了。

## setDate优化
- 控制 setData 的数据量
  - 数据清理，不需要渲染的，放在this上，需要在渲染层用到，this.data
- 控制渲染优先级
  - 当需要更新大量的元素时，给更新任务设置优先级，比如`删除列表，关闭弹窗要刷新列表,可以优先关闭弹窗再setData列表数据`
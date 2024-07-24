<!-- 如何实现一个上中下三行布局，顶部和底部最小高度是 100px，中间自适应 -->
```
1. flex布局
2. 传统css calc(100vh - 200px)
``` 

<!-- 如何判断一个元素 CSS 样式溢出，从而可以选择性的加 title 或者 Tooltip -->
```css
.text-box {
  width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 1px solid #ccc;
  padding: 10px;
}
```
```html
<div class="text-box" id="example">
  This is a long text that might overflow the container depending on how wide the container is.
</div>
```
```js
function checkOverflow() {
  let element = document.getElementById('example');
  if (element.scrollWidth > element.clientWidth) {
    element.title = element.textContent.trim()
  }
}
window.onload = checkOverflow;
```
<!-- 什么是沙箱？浏览器的沙箱有什么作用 -->
1. 用于隔离运行程序，特别是不受信任的代码,防止程序错误或恶意软件对更广泛的系统造成损害，沙箱为程序提供了一个严格控制的环境，

2. 可以以小程序为例，不能操作dom，bom，只能用小程序提供的API，不会受外界环境干扰，组织了恶意脚本窃取数据和跨站脚本攻击。

3. 提供更稳定的用户体验，不会应为一个页面崩溃或错误影响整个浏览器稳定性。

实现方式

- 进程隔离

- 严格API控制： 限制网页可以调用的API和资源，确保只能访问有限的、安全的功能。

<!-- Hash 和 History 路由的区别和优缺点 -->
Hash是通过window.onhashChange事件来监听url中哈希部分的变化，从而触发相应路由逻辑，也可通过修改location.hash来改变当前hash值来实现页面跳转，但是在vue中，需要通过特定方法，应

History通过history.pushState和history.replaceState方法来添加或修改历史记录条目，在不重新加载页面情况下，改变浏览器url，但是在服务器配置所有路由指向同一个index.html
```js
location / {
  try_files $uri $uri/ /index.html;
}
// location /: / 表示匹配所有请求
// try_files: 检查文件是否存在服务器上，并基于这些检查来返回相应的文件
// $uri 是一个变量，代表请求的Uri
// $uri/ 尝试将请求作为目录处理
// /index.html 备选文件，当两者都找不到，Nginx会返回index.html 文件， 这一步是确保当前端路由请求的路径在服务器上直接访问时不存在
```

<!-- JavaScript 中对象的属性描述符有哪些？分别有什么作用 -->

属性描述符可通过Object.getOwnPropertyDescriptor()获取，或通过Object.defineProperty();

- value: 属性的值，一个object 他所对应的value
- weitable：通常预设是true，也就是可以被写入
- enumerable：通常预设是true，也就是可以被枚举
- configurable: 通常预设是true，也就是可以被删除


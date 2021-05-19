# js基础

## 0.1+0.2为什么不等于0.3
[参考链接](https://juejin.cn/post/6844903680362151950)
- 计算机用位来存储及处理数据，遵循 `IEEE754标准` 通过64位来表示一个数字， 第0位符号位表示正负，第1至第11位存储指数部分，后面12至63存储小数部分。
- 所以js最大安全数 Number.MAX_SAFE_INTEGER == Math.pow(2, 53) -1
- 计算机无法直接处理十进制的数，会按照IEEE754转为响应二进制，然后对阶运算。0.1和0.2转为二进制之后会无线循环，规范有尾数限制，就把后面多余的位截掉了。然而会取16位做进度运算。超过精度自动凑整处理。

## BigInt
在js中所有数字采用双精度64位浮点格式表示，最大值是Math.pow(2, 53) - 1,要创建bigInt只需在末尾增加n即可，但是BigInt不支持一元运算符，也不能和Number进行混合操作。 


## ES6中的Set WeakSet Map WeakMap
###  Set 
### WeakSet

### Map
- 本质上是键值对的集合，hash结构，传统意义上对象只能用字符串当键，传入的值会被转化为字符串,而map各种类型的值包括对象都可以当做键。
传统obj
```js
var data = {}
var element = document.getElementById('myDiv')
data[element] = 'meteData'
data['[object HTMLDivElement]'] // 'meteData'
```
map应用
```js
var map = new Map([
  ['name': '张三'],
  ['title': 'Author']
])
map.size // 2
map.get('name') // '张三'
map.hash('title') // true

var m = new Map([
  [true, 'foo'],
  ['true', 'bar']
]);

m.get(true) // 'foo'
m.get('true') // 'bar'

// 如果读取一个未知的键，则返回undefined。
new Map().get('asfddfsasadf')
// undefined
```
### WeakMap
只接受对象作为键名，而且键名所指的对象不计入垃圾回收机制，weakMap设计的目的，键名是对象的弱引用（垃圾回收机制不将其考虑在内），所以其对应的对象可能会被自动回收，当对象回收后，WeakMap自动移除对应的键值对。
比如我们常见的dom元素的WeakMap结构，当某个DOM元素被清楚后，其所对应的WeakMap记录就会被自动移除。只要其对象没有被引用，就会被回收，防止内存泄漏。

可以用作创建私有属性
```js
let _counter = new WeakMap()
let _action = new WeakMap()
class Countdown {
  constructor(counter, action) {
    _counter.set(this, counter) // 实例的弱引用
    _action.set(this, action)
  }
}
let c = new Countdown(2, () => console.log('DONE'));
```
### 为什么通常在发送数据埋点请求的时候使用的是 1x1 像素的透明 gif 图片
[参考](https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/87)
1. 跨域友好，天然支持
2. gif体积最小
3. 能完成整个http请求加响应
4. 执行过程无阻塞，不会影响页面，只需要new Image，还可以通onload和onerror来检测状态
5. 图片请求不占用ajax请求限额

### 移动端1px解决方案
- 使用伪元素
``` css
.setOnePx {
  position: relative;
  &:after {
    position: absolute;
    content: '';
    background-color: #e5e5e5;
    display: block;
    width: 100%;
    height: 1px;
    transform: scale(1, 0.5);
    top: 0;
    left: 0;
  }
}
```
- 使用viewport 更具设备像素比dpr改变mete标签，页面缩放比例
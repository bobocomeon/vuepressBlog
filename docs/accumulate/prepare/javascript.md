参考链接
https://github.com/pwstrick/daily/blob/master/article/optimization.md
# javascript基础

## 判断对象的数据类型
- typeof/instanceof
- Object.prototype.toString

## 执行上下文/作用域/闭包
### 作用域
1. 作用域在编译阶段确定，但作用域链在执行上下文的创建阶段完全生成，在函数调用阶段才会完全生成执行上下文，执行上下文包括了变量对象、作用域链、以及this的指向。
2. 规定了如何查找对象，也就是确定了当前执行代码对变量对象的访问权限。
3. js采用的是词法作用域，也就是静态作用域，在定义时就定下了访问规则，分为全局作用域、函数作用域、块级作用域。
### 块级作用域
1. 变量不会提升
2. 会形成暂时性死区，声明之前不能调用，const必须在声明的时候进行赋值，如果是基本数据类型则不允许修改
3. 不允许在相同作用域内重复声明
4. 关于函数的提升，只有函数声明才会提升，优先级最高，同名情况下，函数声明会覆盖掉变量声明，但是不会覆盖值
```js
console.log(a) // function a()
function a() {}
var a = 1
console.log(a) // 1
// 全局作用域确定时，声明了a函数和a变量，这个阶段声明的变量是undefined，函数是函数名的引用，优先级： 函数 > 变量
```
## js的工作原理
### 解析
解析是js引擎的第一个阶段，将源代码转换为抽象语法树，解析器负责整个过程，主要任务包括：
- 词法分析: 将源代码分割成一个个的标记，如关键字、变量名、操作符等
- 语法分析: 根据语法规则将标记转换成AST节点
### 编译
编译阶段将抽象语法转换为可执行的字节码或机器码，编辑器负责整个编译过程，主要任务包括：
- 优化：对抽象语法树进行优化，如消除冗余代码，提取常量等
- 生成字节码或机器码
### 执行
执行编译生成的字节码或机器码，并产生对应的输出，执行引擎负责整个过，会更具字节码或机器码逐行执行，将结果输出到控制台或更新浏览器界面.
- 解释执行：逐行执行字节码或机器码，并根据操作符执行相应的操作
- 处理数据: 执行过程中处理对象、变量、函数的修改、创建等操作
- 处理控制流: 根据条件执行、循环执行等控制操作语句



### 介绍一下javascript的执行上下文

  
### 介绍一下javascript的作用域链
1. 在查找变量的时候，会从当前执行上下文进行查找，如果没找到就从父级作用域进行查找，一层层往上，最后到全局作用域，这种由多个执行上下文构成的链表叫作用域链

- 介绍一下javascript的闭包是什么已经应用的场景
- 垃圾回收
### 闭包面试真题集中解析
1. “循环体与闭包” 系列
```js
for (var i = 0; i < 5; i++) {
    setTimeout(function() {
        console.log(i);
    }, 1000);
}

console.log(i);
// 由于是var，在打印i的时候，只有全局变量i = 5，这个时候当前作用域没有，只能取全局作用域的值，所有会输出6个5
```
2. 想要依次输出0 ～ 4
```js
// 利用setTimeout的第三个参数
for (var i = 0; i < 5; i++) {
    setTimeout(function(j) {
        console.log(j);
    }, 1000, i);
}
// 在setTimeout 外面再套一层函数，利用这个外部函数的入参来缓存每一个循环中的 i 值
var output = function (i) {
    setTimeout(function() {
        console.log(i);
    }, 1000);
};

for (var i = 0; i < 5; i++) {
    // 这里的 i 被赋值给了 output 作用域内的变量 i
    output(i);  
}
// 利用立即执行函数的入参来缓存每一个循环中的 i 值
for (var i = 0; i < 5; i++) {
  (function(j){
    setTimeout(function() {
    console.log(j)
  }, 1000)})(i)
}

```
## this/call/appy/bind/new
### 介绍一下javascript里的this
> 箭头函数体内的this对象，就是定义该函数时所在的作用域指向的对象，而不是使用时所在的作用域指向的对象

说人话： 就是看当前this，最近的函数包裹的js环境，如果没有包裹，就是window或者定义的类似vue实例

箭头函数this指向可以看这篇
[箭头函数this](https://www.zhihu.com/tardis/zm/art/57204184?source_id=1003)
```js
// 普通函数的列子：
var name = 'window'; // 其实是window.name = 'window'
var A = {
   name: 'A',
   sayHello: function(){
      console.log(this.name)
   }
}
A.sayHello();// 输出A
var B = {
  name: 'B'
}
A.sayHello.call(B);//输出B
A.sayHello.call();//不传参数指向全局window对象，输出window.name也就是window

// 箭头函数
var name = 'window'; 
var A = {
   name: 'A',
   sayHello: () => {
      console.log(this.name)
   }
}
A.sayHello();// 还是以为输出A ? 错啦，其实输出的是window

// 那如何改造成永远绑定A呢：
var name = 'window'; 
var A = {
   name: 'A',
   sayHello: function(){
      var s = () => console.log(this.name)
      return s//返回箭头函数s
   }
}
var sayHello = A.sayHello();
sayHello();// 输出A 
var B = {
   name: 'B';
}
sayHello.call(B); //还是A
sayHello.call(); //还是A

// 再根据“该函数所在的作用域指向的对象”来分析一下
// 1. 该函数所在的作用域：箭头函数s 所在的作用域是sayHello,因为sayHello是一个函数。
// 2. 作用域指向的对象：A.sayHello指向的对象是A。

// 但是如果这样改造一下
var name = 'window'; 
var A = {
   name: 'A',
   sayHello: function(){
      var s = () => console.log(this.name)
      return s//返回箭头函数s
   }
}
var x = A.sayHello;
console.log(x) 
// ƒ (){
//   var s = () => console.log(this.name)
//   return s//返回箭头函数s
// }
var sayHello = x();
sayHello();// 输出window 
var B = {
   name: 'B'
}
sayHello.call(B); //window
sayHello.call(); //window
// 这个时候A.sayHello已经复制给了一个变量x，x执行的时候是全局window调用执行的，所以在外层是window包着

// 但是这样改造一下
var name = 'window'; 
var A = {
   name: 'A',
   sayHello: function(){
      var s = () => console.log(this.name)
      return s//返回箭头函数s
   }
}
var x = A.sayHello(); // 已经通过A调用sayHello执行完了，箭头函数以及绑定成功
console.log(x) // () => console.log(this.name)
var sayHello = x;
sayHello();// 输出A 
var B = {
   name: 'B'
}
sayHello.call(B); //还是A
sayHello.call(); //还是A
```
需要注意的点

1. 不可以当作构造函数，也就是不能使用new命令
2. 不能使用arguments对象，如果要用，需要用rest代替
3. 不能使用yield代替，因此不能用作不能用作 Generator函数

- 如何改变js的指向
- call和apply有什么区别，如何实现
- 如何实现一个bind
### new操作符的原理，实现一个new
1. 内部会创建一个对象(obj),开辟了一块内存空间
2. 将obj的原型指向构造函数，这样obj就能访问构造函数原型中的属性
3. 将新对象的__proto__这个属性指向对应构造函数的prototype属性，把实例和原型对象关联起来.
4. 使用apply，改变构造函数this的指向到新建的对象，这样obj就能访问到构造函数中的属性，让实例可以访问构造函数原型(contructor.prototype)所有的原型链上的属性
5. 构造函数返回的最后结果是引用数据类型,即使没有手动return，构造函数也会帮你把创建的这个新对象关联起来。

## 原型/继承
<!-- https://zhuanlan.zhihu.com/p/213022502 -->
### 原型链继承
```js
Child1.prototype = new Parent1();
这样就相当于，把Child1.prototype的原型指向Parent实例对象，这样就可以让Child对象访问到Parent对象的属性和方法
// 子类可以访问父类的方法和属性，子类new出来的实例使用的是同一个原型对象，内存空间是共享的.
```
### 介绍一下javascript的原型
1. 所有的引用类型（对象、数组、函数）都具有对象特性，即可自由扩展
2. 所有的引用类型都有一个隐式原型(__proto__)，属性是个普通的对象
3. 所有的函数都有一个prototype属性，属性值是一个普通的对象，这个属性是用来创建新对象实例，而所有创建的对象都会共享对象实例，因此这个对象可以访问原型对象的属性
4. 所有的引用类型，__proto__属性值指向它的构造函数的prototype属性.
### 原形链是什么
每个对象都有一个隐式原型__proto__该属性指向它的构造函数的显式原型，原型对象可以通过__proto__和构造函数的显示原型对象连接起来，而上边的原型对象也有一个隐式原型指向它的构造函数的原型，这样一层一层连接起来叫做原型链
```
f.__proto__ = Foo.prototype
如果没找到f上的toString()，会继续往上找
f.__proto__.__proto__ = Foo.prototype.__proto__
Foo.prototype是一个普通对象，因此Foo.prototype.__proto__ 就是Object.prototype，在这里可以找到toString方法
如果找到最后一层也没找到，就返回undefined，Object.prototype.__proto__ === null
```
- 如何利用原型实现继承

## js中的类型转换
- 隐式和显式类型转换
- == 和 ===

## promise
- 介绍一下promise、以及优缺点
- 如何实现一个promise(promise A+标准)
### async await
有async前缀的函数，返回的是一个promise
```js
async function fn() {
   return 100;
}
(async function() {
   const a = fn()
   const b = await fn();
})()
```
- 基本用法
```js
async function fn1() {
   return Promise.resolve(200)
}
!(async functon() {
   const p1 = Promise.resolve(300)
   const data = await p1 // await 相当于 Promise.then
})()
!(async functon() {
   const data1 = await 400 // await Promise.resolve(400)
   console.log('data1', data1) // 400
})()
!(async function () {
   const data2 = await fn1()
   console.log('data2', data2); // 200
})
!(async function() {
   const p4 = Promise.reject('err1) // reject状态
   try {
      const res = await p4;
      console.log(res)
   } catch(err) {
      console.log(err) // try catch 相当于promise .catch
   }
})()
!(async function () {
   const p4 = Promise.reject('err')
   const res = await p4 // await => then
   console.log('res', res)
})()
```
- 异步进阶

```js
async function () {
   console.log('async start') // 2 重要
   await async2() // undefined
   // await的后面，都可以看做是callback里的内容，即异步
   // 类似event loop Promise.resolve().then(() => console.log('async end'))
   console.log('async1 end') // 5
}
async function async2() {
   console.log('async2') // 3
}
console.log('script start')
async1()
console.log('script end') // 4 
```
多个async await执行
```js
async function async1() {
   console.log('async1 start') // 2
   await async()
   // 下面三行都是异步回调 callback的内容
   console.log('async end') // 5
   await async3()
   console.log('async1 end 2') //7
}
async function async2() {
   console.log('async2') //3 
}
async function async3() {
   console.log('async3') // 6
}
conols.log('script start') // 1
async1();
console.log('script end') //4
// 执行到这里，同步代码就执行完了，就会执行await async() 下面的三行代码
// 这里想突出的重点是，await 那行，后面的代码，都会被类似Promise.resolve().then(() => { ... }) 包裹
```
看下await 报错的reject
```js
(async function () {
   console.log('start')
   const a = await 100 // await 后面不是promise，直接把值赋给a变量
   console.log('a', a) // 这里可以正常答应，输出
   const b = await Promise.resolve(200)
   console.log('b', b) // 这里可以正常答应，输出200,await后面是一个promise，awit相当于.then
   const c = await Promise.reject(300) // await后面是一个reject promise，报错，后面代码都不会执行，需要try catch包裹
   console.log('c', c)
   console.log('end')
})
```
promise执行顺序
```js
Promise.resolve().then(() => {
   console.log(0);
   return Promise.resolve(4)
}).then(res => {
   console.log(res);
})
Promise.resolve().then(() => {
   console.log(1)
}).then(() => {
   console.log(2)
}).then(() => {
   console.log(3)
}).then(() => {
   console.log(4)
}).then(() => {
   console.log(5)
}).then(() => {
   console.log(6)
})
// 打印顺序结果 0 1 2 3 4 5 6
// then中返回promise实例，相当于多出一个promise，会遵循交替执行，但和直接声明一个promise实例，结果有些差异
// 第一拍，promise需要由pending变为fulfilled
// 第二拍，then函数挂载到微任务队列  
```
### promise扩展函数的实现

## 实现一个ajax
- 手写ajax并用promise进行封装

## WeakMap和WeakSet概述
### WeakMap
WeakMap是一种键值对集合,类似于Map，试用于需要存储对象键，并且不需要对这些键进行强引用的场景.
- 在WeakMap中，只有对象可以作为键，不能使用基本类型
- WeakMap是弱引用，如果一个对象只被WeakMap引用，那么这个对象可以对垃圾回收,被垃圾回收后，它对应的键值对也会从WeakMap中自动移除
- WeakMap不可遍历，也就是说不能使用`for...of`这样的循环遍历，也没有提供类似于size属性或forEach来获取长度和遍历
- 没有内置清空方法，无法直接一次性删除所有键值对
由于这些特性，WeakMap在处理内存泄漏问题和管理对象私有数据等场景有着明显的优势
- 特性和用法
```js
let weakMap = new WeakMap()
let obj1 = {};
let obj2 = {};
// set
weakMap.set(obj1, 'hello')
weakMap.set(obj2, 'world')
// get
console.log(weakMap.get(obj1)) // 'hello'
console.log(weakMap.get(obj2)) // 'world'
// has
console.log(weakMap.has(obj1)) // true
console.log(weakMap.has(obj2)) // true
// delete
weakMap.delete(obj1);
console.log(weakMap.has(obj1)) // false
```
### WeakSet
WeakSet是一种集合,类似于Set，适用于存储一组对象，并且不需要对这些对象进行弱引用的场景
- 在WeakSet中，只有对象可以作为键，不能使用基本类型
- WeakSet是弱引用，如果一个对象只被WeakSet引用，那么这个对象可以被垃圾回收，当这个对象被垃圾回收后，它会自动从WeakSet中自动移除
- WeakSet不可遍历，不能想for...of这样来遍历WeakSet，也没有提供size属性或forEach这种方法来获取大小或跌代
- WeakSet可以用来检查一个对象是否存在，应为WeakMap中每个对象都是唯一的
- WeakSet没有内置清空方法，无法直接一次性删除所有元素
- 特性和用法
```js
let weakSet = new WeakSet()
let obj1 = {};
let obj2 = {};
// add
weakSet.add(obj1)
weakSet.add(obj2)
// get
weakSet.get(obj1) 
// has
console.log(weakSet.has(obj1)) // true
console.log(weakSet.has(obj2)) // true
// delete
weakSet.delete(obj1)
console.log(weakSet.has(obj1)) // false

// 唯一性
let processedObjects = new WeakSet();
function processObject(obj) {
   if (!processedObjects.has(obj)) {

      processedObjects.add(obj)
   }
}
```
 

## 深拷贝/浅拷贝
### 介绍一下javascript的深浅拷贝、如何实现
#### JSON.stringify实现拷贝的问题
1. 拷贝对象的值中如果有 函数、undefined、symbol这几种类型，经过JSON.stringify序列化之后会消失
2. 拷贝Date引用类型会变成字符串
3. 无法拷贝不可枚举的属性
4. 无法拷贝对象的原型链
5. 拷贝regexp引用类型会变成空对象
6. 对象中含有NaN、Infinity以及-Infinify,JSON序列化之后都会变成null;
7. 无法拷贝对象的循环饮用，即对象成环(obj[key] = obj);
  
#### 实现深拷贝需要注意哪些问题
1. 针对便利对象的不可枚举属性以及Symbol类型，我们可以使用Reflect.ownKeys方法
2. 当参数为Date、RegExp，直接生成一个实例返回
- 怎么解决循环引用
利用WeakMap类型作为Hash表，WeakMap是只能用对象作为key，并且是弱引用，这就意味着，如果没有其他引用指向键对象的时候，会被系统进行垃圾回收，可以有效的防止内泄漏

## 内存管理
## 事件机制/EventLoop
- 如何实现一个事件的发布订阅
- 介绍一下事件循环
- 宏任务和微任务有什么区别

## 常用方法
- 数组方法的实现
- 字符串方法的实现

## ES6
- let、const、var的区别
- 箭头函数和普通函数的区别
- 对象和数组的解构的理解
- ES6中模板语法与字符串处理
- Set/Map的理解
- ES Module和Common JS 的区别
- 回调函数和异步编程
## 函数式编程
- 柯里化
- 
## service Worker / web Worker
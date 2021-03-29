# 写给自己看的js基础灵魂拷问

### 介绍一下js原型
[参考链接](https://segmentfault.com/a/1190000018511025?utm_source=sf-similar-article)
- js分为普通对象和函数对象，普通对象只有隐式原型，函数对象才有显式原型，所有的引用类型(对象、函数、数组)`__proto__属性`都指向他的构造函数的`prototype`
- 当试图得到某个对象的某个属性时，如果这个对象本身没有这个属性，那么会去他的__proto__中寻找。
- 原型对象的`constructor`指向构造函数本身
```js
Person.prototype.constructor === Person  // 准则1原型对象（即Person.prototype）的constructor指向构造函数本身
// 这也是我们在原型继承的时候 `Child.prototype = new Person()` 需要把Child的constructor指向回自己，Child.prototype.constructor = Child;
person1.__proto__ == Person.prototype // **准则2：实例对象（即person1）的__proto__和原型对象指向同一个地方**
// （prototype本质也是一个对象）
```

### 原型链是什么
当试图得到一个对象的某个属性时，如果当前属性没有就在其原型prototype上查找，如果没有找到就往构造函数的原型prototype上查找，知道找到最后原型链的终点null

### 6大继承包括es6用的什么继承
1. 原型链继承： 可以访问到构造函数的属性和原型方法还是由于是一个原型对象，会共享内存空间
2. 构造函数继承：  通过call继承，把父类的this指向子类，但是不能继承父类的原型方法，能继承其属性
3. 组合继承： 比较常用的，但是会把父类函数构造执行两次，浪费性能
4. 原型式继承： 还是引用数据共享的问题
5. 寄生式继承： 通过原型式方式继承，只是在其进一步增加，添加了一些方法之后进行返回，缺点和原型式继承一样
6. 寄生组合继承： 所有继承里面最有的解决方案，es6的继承就是通过这种方式实现。


### promise
是一种异步解决方案，对异步操作的一种封装，可通过独立的接口在异步操作成功，失败执行时的方案，比通常的回调，事件在处理异步时候更有显著的优势。
### 实现promiseA+
### async await
是一种异步的终级解决方案，是在Generator(生成器的一种封装)，用同步代替异步书写。
```js
function newAsync (gen) {
  return new Promise((resolve, reject) => {
    let g = gen()
    function _next(val) {
      try {
        var item = g.next(val)
      }catch (error) {
        return reject(error)
      }
      if (item.done) {
        return resolve(item.value)
      }
      Promise.resolve(item.value).then(value => {
        _next(value)
      }, error => {
        g.throw(error)
      })
    }
    _next()
  })
}
```

### 实现一个深拷贝并以及注意哪些问题和解决循环引用
- typeof 判断类型，最开始js为了性能采用32位进行存储，typeof在判断的时候判断其前三位，而刚好object前三位是000，null是全0，boolean是110，string是101，number是011
#### 深拷贝终极版
```js
function isObject(obj) {
  return obj !== null && typeof obj === 'object'
}
// 深拷贝
function deepCopy (obj, hash = new WeakMap) {
  if (obj.constructor === Date) {
    return new Date(obj)
  }
  if (obj.constructor === RegExp) {
    return new RegExp(obj)
  }
  if (hash.has(obj)) {
    return hash.get(obj)
  }
  let allProto = Object.getOwnPropertyDescriptors(obj)
  let cloneObj = Object.create(Object.getPrototypeOf(obj), allProto)
  hash.set(obj, cloneObj)
  for (let key of Reflect.ownKeys(obj)) {
    cloneObj[key] = isObject(obj[key]) ? deepCopy(obj[key], hash) : obj[key];
  }
  return cloneObj
}
```
- 使用Json.String也能进行深拷贝
  - 不能解决循环引用，当有循环引用会报错
  - Date 不是格林事件类型
  - 不能拷贝undefined、函数、 symbool、 正则
  - symbol类型不能拷贝

### 实现一个发布订阅

# 实现js方法
## 判断对象的数据类型

## 循环实现数组 map 方法

## 使用 reduce 实现数组 map 方法

## 实现数组 filter 方法

## 使用 reduce 实现数组 filter 方法

## 实现数组 some 方法

## 实现数组的 reduce 方法

## 使用 reduce 实现数组的 flat 方法

## 实现 ES6 的 class 语法

## 函数柯里化

## 函数柯里化（支持占位符）

## 偏函数

## 斐波那契数列及其优化

## 实现函数 bind 方法

## 实现函数 call 方法

## 简易的 CO 模块

## 函数防抖

## 函数节流

## 图片懒加载

## new 关键字

## 实现 Object.assign

## instanceof

## 私有变量的实现

## 洗牌算法

## 单例模式

## promisify

## 优雅的处理 async/await

## 发布订阅 EventEmitter

## 实现 JSON.stringify（附加）

## 异步并发相关题目
### JS实现一个带并发限制的异步调度器Scheduler，保证同时运行的任务最多有两个。完善下面代码的Scheduler类，使以下程序能够正常输出：
解法在`base-project/src/project2/index.js`
```js
class Scheduler {
  add(promiseCreator) { ... }
  // ...
}
   
const timeout = time => new Promise(resolve => {
  setTimeout(resolve, time);
})
  
const scheduler = new Scheduler();
  
const addTask = (time,order) => {
  scheduler.add(() => timeout(time).then(()=>console.log(order)))
}

addTask(1000, '1');
addTask(500, '2');
addTask(300, '3');
addTask(400, '4');

// output: 2 3 1 4
```
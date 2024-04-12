# 小程序
## JSBridge 特点和前端实现方式
### JSBridge 本质
1. 由 Native 约定好 API 的实现方式，JS 端根据约定好的规则去实现，比如 WebView 映射 Native 的方法叫做 JSOriginBridge，那么在 JS 端就需要调用 window 属性上的 JSOriginBridge 来实现通信
2. 在 WebView 调用 Native 的几种方式的时候，有说到回调函数的方式，本质上与 Native 通信只能够传简单的数据类型，比如 string 和 number，所以不能被 JSON.stringify 或其他序列化方法转换的数据结构就会丢失，那我们就需要对回调函数处理
### JSBridge 前端实现
```js
const isAndroid = window.navigator.userAgent.indexOf('Android') !== -1
​
 function possNativeMessage(message){
    if(isAndroid){
        window.JSOriginBridge.postMessage(message);
    }else {
        window.webkit.messageHandlers.JSOriginBridge.postMessage(message);
    }
}
​
/* 向 Native 发布事件 */
function publishNativeMessage(params){
    const message = {
        eventType:'publish',
        data:params
    }
    possNativeMessage(message)
}
​
/* 触发 Native 方法, 触发回调函数 */
function invokeNativeEvent(name,params,callbackId){
    const message = {
        eventType:'invoke',
        type:name,
        data:params,
        callbackId
    }
    possNativeMessage(message)
}
​
class JSBridge {
    /* 保存 */
    eventHandlers = new Map()
    responseCallbacks = new Map()
    callbackID = 0
    constructor() {
        window._handleNativeCallback = this.handleNativeCallback.bind(this)
        window._handleNativeEvent = this.handleNativeEvent.bind(this)
    }
    /* 向 native 发送消息 */
    postMessage(params){
        const data = JSON.stringify(params)
        publishNativeMessage(data)
    }
     /* 向 native 发送消息,等待回调函数 */
    invoke(name,payload,callback){
        this.callbackID++
        /* 将回调函数保存起来 */
        this.responseCallbacks.set(this.callbackID,callback)
        invokeNativeEvent(name,payload,this.callbackID)
    }
    /* 
    处理 native 调用 window 上的 _handleNativeCallback 方法。
    当执行 invoke 回调的时候，执行该方法
    */
    handleNativeCallback(jsonResponse){
        const res = JSON.parse(jsonResponse)
        const { callbackID,...params } = res
        const callback = this.responseCallbacks.get(callbackID)
        /* 取出回调函数并且执行 */
        callback && callback(params)
        /* 删除对应的回调函数 */
        this.responseCallbacks.delete(callbackID)
    }
    /* 
     处理 native 调用 window 上的 _handleNativeEvent 方法。
     处理绑定在 native 的事件
     */
    handleNativeEvent(jsonResponse){
        const res = JSON.parse(jsonResponse)
        const { eventName,...params } = res
        const callback = this.eventHandlers.get(eventName)
        callback(params)
    }
    /* 绑定注册事件 */
    registerEvent(name,callback){
        this.eventHandlers.set(name,callback)
    }
    /* 解绑事件 */
    unRegisterEvent(name){
        this.eventHandlers.delete(name)
    }
}
​
export default new JSBridge()
```
- 发布事件 `(publishNativeMessage)`
  - 当网页想要通知原生应用某件事情发生时，它会"发布"一个事件。这不需要原生应用立即给出响应。发布事件类似于广播一个消息，原生应用可以根据自己的需要来处理这个消息。
  - 例如，如果你有一个按钮在网页上，当用户点击这个按钮时，你可能想告诉原生应用用户已经开始一个特定的动作，比如开始播放视频。这时，你就会发布一个事件，原生应用接收到这个事件后，可能会执行一些相关的逻辑，比如记录用户行为、调整应用状态等。
- 调用原生事件 `(invokeNativeEvent)`
  - 当网页需要原生应用执行某个操作并且对这个操作的结果感兴趣时，它会"调用"一个原生事件。这通常涉及到一个回调函数，网页端在调用原生事件时提供一个回调函数的 `ID (callbackID)`，原生应用执行完相应的操作后，会调用这个回调函数并传递结果回网页端。
  - 例如，如果网页需要获取用户的地理位置信息，它可以调用一个原生事件来请求这些信息。因为获取位置信息可能需要一些时间，原生应用会在操作完成后通过回调函数将位置信息发送回网页。
- 关于`handleNativeEvent`
  - 接收原生事件: 原生应用通过调用网页上的全局函数 _handleNativeEvent 来触发一个事件。这个函数实际上是 `JSBridge` 类中 `handleNativeEvent`` 方法的引用。
  - 客户端和js两边，约定协议，开发者需要在网页端和原生应用端定义一个共同的事件列表
  - 假设原生应用在用户完成某项操作时想通知网页（比如用户完成了一个支付流程），原生应用会调用 `_handleNativeEvent` 函数并传递相关事件信息。网页端可能已经注册了一个处理支付完成的事件处理函数，handleNativeEvent 方法会找到这个函数并执行它，同时传递支付详情作为参数。
  - 网页端注册事件处理函数
  ```js
  JSBridge.registerEvent('paymentCompleted', function(data) {
    // 处理支付完成的逻辑
  });
  ```
  - 触发事件： 原生应用在用户完成支付后需要通知网页端时，它会根据约定的协议构造一个事件对象，并调用网页上的 `_handleNativeEvent` 方法。事件对象会包含事件名称     `paymentCompleted` 和相关的支付详情。
  - 网页端处理事件: 网页端的 `handleNativeEvent` 方法会被调用，它解析传递过来的事件对象，找到事件名称对应的处理函数，并执行它，传递支付详情作为参数。

## 小程序通信方式及通信细节
> 通信方案就是数据从逻辑层的 JS 传递给 Native 层，再由 Native 层传递到 WebView 的 JS 层，然后再渲染视图，这期间数据需要经过序列化和反序列化，并且需要两次桥通信。
 
## 小程序启动流程及性能分析


## 小程序原理

## 小程序优化
## 小程序开发技巧

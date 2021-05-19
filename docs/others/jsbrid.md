# hybrid
[参考链接](https://github.com/xd-tayde/blog/blob/master/hybrid-1.md)
[参考链接-小白必看，JSBridge 初探](https://www.zoo.team/article/jsbridge)
> `hybrid App的本质是，在原生的app中，使用webview作为容器直接承载web页面，最核心的点就是Native端与h5端之间的双向通讯。`
- 常见的有api注入和webview url 跳转链接，在webview发出的网络请求，客户端都能进行监听和捕获，通过我们可以定义一套协议，`aaa://xxx?params`带上参数，根据约定的参数进行数据传输，客户端解析参数进行相关功能或者方法的调用，完成协议功能映射，但是缺点是webview对url长度有限制，传递大量数据时
- `注入api`，基于webview提供的能力，可以想window上注入对象和方法，js通过这个对象或方法进行回调，执行响应的逻辑，可以直接调用native的方法，使用该方法适，js需等待native执行完对象的逻辑才能进行回调的操作，安卓是`addJavascriptInterface`以及ios的`WKWebViewConfiguration`，native调用js比较简单，只需要h5将方法表露在window上给native调用即可。
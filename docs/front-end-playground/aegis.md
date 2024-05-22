# Web 监控实现原理

参考链接 https://juejin.cn/post/7108660942686126093

实现无侵入式监控，主要有 3 种思路
- 全局事件监听
- 浏览器 API 劫持
- 浏览器 API 调用

需要关注的点，拆分如下

- 页面的性能情况：包括各阶段加载耗时，一些关键性的用户体验指标等
- 用户的行为情况：包括PV、UV、访问来路，路由跳转等
- 接口的调用情况：通过http访问的外部接口的成功率、耗时情况等
- 页面的稳定情况：各种前端异常等
- 数据上报及优化：如何将监控捕获到的数据优雅的上报

## 错误监控
错误监控包括`JS执行错误`，`Promise执行错误`，`资源加载失败`和`接口请求异常`4个部分。

### `JS` 执行错误
要捕获 JS 的运行时错误，只需要监听 `onerror` 事件。
```js
window.onerror = (...args) => {
  msg: `${stringify(args[0]) || ''} @ (${stringify(args[1]) || ''}:${args[2] || 0
  }:${args[3] || 0})
  \n${stringify(args[4] || '')}`,
  level: LogType.ERROR,
  orgError?.call(window, ...args);
}
// 详细参数
window.onerror = function(message, source, lineno, colno, error) {
  console.log('捕获到错误:', message);
  return true; // 阻止默认处理
}
```
我们会将错误的文件和行号列号一起上报，后续查日志的时候，就能结合 sourcemap 定位错误在源码的位置了，背后会用到 source-map 这个工具

### `promise` 执行错误
要捕获没有被用户 `catch` 的 `promise` 错误，可以通过监听 `unhandledrejection` 事件实现。
```js
window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  const reason = event && stringify(event.reason);
  msg: `PROMISE_ERROR: ${reason}`,
  level: LogType.PROMISE_ERROR,
};);
```

### 资源加载失败
> 通过`addEventListener`添加的`error`事件监听器和`window.error`的主要区别是，window.onerror 能捕获更广泛的错误类型，包括语法错误、运行时错误等，而通过addEventListener监听的error事件主要用于捕获资源加载相关的错误。

- 更具体的错误处理: 通过`addEventListener`添加的`error`事件监听器主要是用来捕获特定于文档的错误,尤其是资源加载错误，（如图像、视频、脚本文件等无法加载时），这不会捕获`JavaScript`的运行时错误。
- 事件对象: 监听器接收一个事件对象，该对象可以提供关于错误的一些上下文，例如错误发生的具体元素等。
- 冒泡与捕获: 这种方式支持事件的冒泡和捕获机制，允许你在错误到达一个元素之前或之后进行处理。

```js
window.document.addEventListener('error', (event: Event) => {
  const target = event?.target || event?.srcElement;
  const url = target.src || target.href;
  const { tagName } = target;

  if (typeof url === 'string' && tagName) {
    const log = {
      msg: `${tagName} load fail: ${url}`,
      level: LogType.INFO,
    };
    // 先根据文件后缀简单判断
    if (/\.js$/.test(url)) {
      log.level = LogType.SCRIPT_ERROR;
    } else if (/\.css$/.test(url)) {
      log.level = LogType.CSS_ERROR;
    } else {
      // 再根据文件类型判断
      switch (tagName.toLowerCase()) {
        case 'script':
          log.level = LogType.SCRIPT_ERROR;
          break;
        case 'link':
          log.level = LogType.CSS_ERROR;
          break;
        case 'img':
          log.level = LogType.IMAGE_ERROR;
          break;
        case 'audio':
        case 'video':
          log.level = LogType.MEDIA_ERROR;
          break;
        default:
          return;
      }
    }
    console.log(log)
  }
}, true);
```

### 接口请求异常
要获取接口请求的异常，需要劫持 `XMLHttpRequest` 和 `fetch` 这 2 个浏览器 API，在请求返回的时候判断是否有错误
```js
/**
 * XMLHttpRequest 劫持
 */
xhr.addEventListener('timeout', () => {
  xhr.failType = 'timeout';
});
xhr.addEventListener('error', () => {
  xhr.failType = 'error';
});
xhr.addEventListener('abort', () => {
  xhr.failType = 'abort';
});

xhr.addEventListener('loadend', function () {
  let type = '';
  if (this.failType) {
    type = this.failType;
  } else if (!this.status) { // status 为 0 或者 undefined
    type = 'failed';
  } else if (this.status >= 400) {
    type = 'error';
  }

  if (type) {
    console.log(msg: `AJAX_ERROR: request ${type}`)
  }
});

/**
 * fetch 劫持
 */
```

## 性能监控
性能监控包含页面测速、接口测速、资源测速、Web Vitals
### 页面测速
九大指标
- dns查询
- tcp链接
- ssl建连
- 请求响应
- 内容传输
- DOM解析
- 资源加载
- 首屏耗时
- 页面完成加载时间

其中前面 `7` 个指标都是可以直接调用 `Performance API` 算出来的，会涉及到下面这些指标的计算
```ts
const t: PerformanceTiming = performance.timing
const result = {
  dnsLookup: t.domainLookUpEnd - t.domainLookUpStart,
  tcp: t.contentEnd - t.contentStart,
  ssl: t.secureConnectionStart === 0 ? 0 : t.requestStart - secureConnectionStart,
  ttfb: t.responseStart - t.requestStart, // 请求响应耗时
  contentDownload: t.responseEnd - t.responseStart // 内容传输
  domParse: t.domInteractive - t.domLoading // dom解析
  resourceDownload: t.loadEventStart - t.domInteractive // 资源加载
}
```
#### 首屏耗时
默认的算法是在 3 秒内监听首屏区域内元素的变化，记录元素的变化时间和包含的子节点数量，取子节点数最多的元素的变化时间为首屏时间。假设发生了 2 次变化，并且变化的元素都在首屏区域内：
```js
const change1 = {
  roots: [e1, e2],
  rootsDomNum: [8, 5],
  time: 2860 // 通过 performance.now() 获取
};

const change2 = {
  roots: [e3, e4],
  rootsDomNum: [2, 5,],
  time: 3998 // 通过 performance.now() 获取
};
```
子节点数量最多的是 e1，对应的时间是 2.86 秒，我们就以这个时间来作为首屏时间。 监听元素的变化使用了 MutationObserver：
```js
const observeDom = new MutationObserver(mutations => {
  const change = {
    roots: [],
    rootsDomNum: [],
    time: performance.now(),
  };
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach((ele) => {
      // 标识了首屏关键元素，只记录关键元素的变化时间
      if (ele.nodeType === 1 && ele.hasAttribute('FIRST-SCREEN-TIMING')) {
        if (!Object.prototype.hasOwnProperty.apply(markDoms, [change.time])) {
          markDoms[change.time] = [];
        }
        markDoms[change.time].push(ele);
      }
      // 默认首屏算法
      else if (ele.nodeType === 1 && !ele.hasAttribute('IGNORE-FIRST-SCREEN-TIMING')) {
        change.roots.push(ele);
        change.rootsDomNum.push(self.walkAndCount(ele) || 0);
      }
    })
  })
  change.roots.length && changeList.push(change);
});
observeDom.observe(document, { children: true, subtree: true })
```
当用户给元素添加 `first-screen-timing` 属性的时候,我们会记录这个元素的变化时间，3 秒后取变化时间的最大值作为首屏时间。 在使用默认算法的时候，可以为元素添加属性 `ignore-first-screen-timing` 来忽略节点的变化统计。

### 接口测速
#### 劫持 `XMLHttpRequest` 的 `send` 方法
```js
send: (xhr, body) => {
  const sendTime = Date.now()
  xhr.addEventListener('loadend', () => {
    const url = xhr.Url;
    const duration = Date.now() - sendTime;
    const speedLog = {
      url,
      isHttps: urlIsHttps(url),
      status: xhr.status || 0,
      method: xhr.Method || 'get',
      type: 'fetch',
      duration,
      payload: new PayloadXHR(xhr),
    }\console.log(speedLog)
  })
}
```
#### `fetch` 劫持
```js
const originFetch = window.fetch;
window.fetch = function FakeFetch(url: RequestInfo, fetchOption = {}) {
  const sendTime = Date.now();
  return originFetch(url, fetchOption)
    .then((res) => {
      const duration = Date.now() - sendTime;
      const speedLog = {
        url: res.url,
        isHttps: urlIsHttps(res.url),
        method: option?.method || 'get',
        duration,
        type: 'fetch',
        status: res.status || 0,
      };
      console.log(speedLog)
    })
}
```

### 资源测速
资源测速是通过`PerformanceObserver`来实现的
```js
const observer = new window.PerformanceObserver((list) => {
  const entries = list.getEntries();
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const duration = entry.duration.toFixed(2);
  }
})
observer.observe({ entryTypes: ['resource'] });
```
### Web Vitals
`Web Vitals` 的获取方式比较简单，直接使用 `google` 提供的 `npm` 包就能获取到，我们就简单归类为浏览器 `API` 的直接调用。
```js
import {getFCP, getLCP, getFID, getCLS} from 'web-vitals/base'
```
- LCP
  - 衡量用户在打开页面后，最大的内容元素（图片、视频、大的文本块），加载完成所需的时间
- FID
  - `FID`量度的是用户首次与页面交互（如点击链接、按钮等）到浏览器实际能够响应该交互的时间。一个好的`FID`度量应该在`100`毫秒或更短。
- CLS
  - `CLS`是衡量视觉稳定性的指标，它记录了视觉页面内容在加载期间发生意外布局偏移的程度。理想的`CLS`得分应该是`0.1`或更低。

## SDK 架构设计
为支持多平台、可拓展、可插拔的特点，整体SDK的架构设计是 内核+插件 的插件式设计；每个 SDK 首先继承于平台无关的 Core 层代码。然后在自身SDK中，初始化内核实例和插件；
![](/images/sdk.png)
- 我们用 Core 来管理 SDK 内与平台无关的一些代码，比如一些公共方法(生成mid方法、格式化)；
- 然后每个平台单独一个 SDK；去继承 core 的类；SDK 内自己管理SDK特有的核心方法逻辑，比如上报、参数初始化；
- 最后就是 Plugins 插件，每个SDK都是由 内核+插件 组成的，我们将所有的插件功能，比如性能监控、错误监控都抽离成插件；

这样子进行 SDK 的设计有很多好处：

- 每个平台分开打包，每个包的体积会大大缩小；
- 代码的逻辑更加清晰自恰

最后打包上线时，我们通过修改 build 的脚本，对 packages 文件夹下的每个平台都单独打一个包，并且分开上传到 npm 平台；

### SDK 如何方便的进行业务拓展和定制？

### 微内核架构
1. 为了提高代码的可维护性和扩展性，借鉴微内核架构来组织我们的代码，实现了控制逻辑与业务逻辑的解耦。
2. 控制逻辑主要由内核来实现，功能包括生命周期管理、插件管理、上报策略管理和配置管理。
3. 而具体的业务逻辑是由各个插件来实现，例如错误监控、资源测速和接口测速等，每一个都是独立的插件。
4. 当需要添加一个新功能的时候，只需要新增一个插件就可以了，其它代码都不会受影响。
![](/images/plugin.png)

#### 业务扩展
- 内核里是SDK内的公共逻辑或者基础逻辑；比如数据格式化和数据上报是底下插件都要用到的公共逻辑；而配置初始化是SDK运行的一个基础逻辑；
- 插件里是SDK的上层拓展业务，比如说监听js错误、监听promise错误，每一个小功能都是一个插件；
- 内核和插件一起组成了 SDK实例 Instance，最后暴露给客户端使用；

### 定制化
插件里的功能，都是使用与否不影响整个SDK运行的，所以我们可以自由的让用户对插件里的功能进行定制化，决定哪个监控功能启用、哪个监控功能不启用等等

### SDK 如何实现异常隔离以及上报
而如果因为监控SDK报错，导致整个应用主业务流程被中断，这是我们不能够接收的；我们无法保证我们的 SDK 不出现错误，那么假如万一SDK本身报错了，我们就需要它不会去影响主业务流程的运行；

最简单粗暴的方法就是把整个 SDK 都用 try catch 包裹起来，那么这样子即使出现了错误，也会被拦截在我们的 catch 里面；

- 我们只能获取到一个报错的信息，但是我们无法得知报错的位置、插件；
- 我们没有将其上报，我们无法感知到 SDK 产生了错误
- 我们没法获取 SDK 出错的一个环境数据

我们就需要一个相对优雅的一个异常隔离+上报机制，回想我们上文的架构：内核+插件的形式；我们对每一个插件模块，都单独的用trycatch包裹起来，然后当抛出错误的时候，进行数据的封装、上报；

### SDK 如何实现服务端时间的校对
http响应头 上有一个字段 Date；它的值是服务端发送资源时的服务器时间，我们可以在初始化SDK的时候，发送一个简单的请求给上报服务器，获取返回的 Date 值后计算 Diff差值 存在本地；

提供一个 公共API，来提供一个时间校对的服务，让本地的时间 比较趋近于 服务端的真实时间；（只是比较趋近的原因是：还会有一个单程传输耗时的误差）
```js
let diff = 0;
export const diffTime = (date: string) => {
  const serverDate = new Date(date);
  const inDiff = Date.now() - serverDate.getTime();
  if (diff === 0 || diff > inDiff) {
    diff = inDiff;
  }
};

export const getTime = () => {
  return new Date(Date.now() - diff);
};
```

### SDK 如何实现会话级别的错误上报去重
我们需要理清一个概念，我们可以认为
- 在用户的一次会话中，如果产生了同一个错误，那么将这同一个错误上报多次是没有意义的；
- 在用户的不同会话中，如果产生了同一个错误，那么将不同会话中产生的错误进行上报是有意义的；

为什么有上面的结论呢？理由很简单:

- 在用户的同一次会话中，如果点击一个按钮出现了错误，那么再次点击同一个按钮，必定会出现同一个错误，而这出现的多次错误，影响的是同一个用户、同一次访问；所以将其全部上报是没有意义的；
- 而在同一个用户的不同会话中，如果出现了同一个错误，那么这不同会话里的错误进行上报就显得有意义了；

生成 错误mid
```js
// 对每一个错误详情，生成一串编码
export const getErrorUid = (input: string) => {
  return window.btoa(unescape(encodeURIComponent(input)));
};
```
所以说我们传入的参数，是 错误信息、错误行号、错误列号、错误文件等可能的关键信息的一个集合，这样保证了产生在同一个地方的错误，生成的 错误mid 都是相等的；这样子，我们才能在错误上报的入口函数里，做上报去重；

# 前端性能优化

## 首屏时间
> 白屏时间+渲染时间
- 浏览器输入网址并回车后，到首屏内容渲染完毕的时间。
- 首屏时间可以拆分为`白屏时间`、`数据接口响应时间`、`图片加载资源等`
### 指标采集具体办法
#### 手动采集
- 通过埋点方式进行，在页面开始位置打上FMP.Start(),在首屏结束位置打上FMP.End(),利用两个相减得到首屏时间
- 优点是兼容性强
- 缺点是和业务代码严重耦合，如果首屏采集逻辑调整，业务代码也要修改，迭代麻烦
#### 自动化采集
采用`MutationObserver api`，来监视DOM树所做的变化
## 白屏时间
- 概念： 输入浏览器回车(包括刷新跳转)，到页面开始出现第一个字符的时间，这个过程包括dns查询，建立tcp链接，发送首个http请求，如果是https还要加上tls验证时间，返回html文档，返回html文档，head解析完毕。一版是300ms。
- 影响因素： dns查询时间长，tcp请求连接慢，服务器处理请求速度太慢，客户端下载、解析、渲染时间过长，没有这事`Content-Encoding: Gzip`,本地缓存处理等。


## 性能瓶颈点：从 URL 输入到页面加载整过程分析
- 客户端发起请求阶段
  - 本地缓存
  - DNS查询耗时时长
    - `<link rel="dns-prefetch" href="https://s.google.com">` 在静态资源请求之前对域名进行解析，减少用户等待时间,`dns-prefetch` 表示强制对 `s.google.com` 的域名做预解析。这样在 `s.google.com` 的资源请求开始前，DNS 解析完成，后续请求就不需要重复做解析了
    - `<meta http-equiv="x-dns-prefetch-control" content="on">`表示开启 DNS 预解析功能
  - HTTP请求阻塞
- 服务器数据处理请求阶段
  - 是否做了数据缓存处理
  - 是否做了GZIP压缩
  - 是否有重定向
- 客户端页面渲染阶段
  - 构建DOM树瓶颈点
  - 布局中的瓶颈点


## 首屏秒开的 4 重保障
- 懒加载
- 缓存
- 静态资源缓存
- 并行化
  - 在请求通道上下功夫，解决请求阻塞问题，进而减少首屏时间，可借助http2.0来多路复用
- 骨架屏减少用户焦虑等待

## CSS3 硬件加速简介
[参考链接](https://www.zhangxinxu.com/wordpress/2015/11/css3-will-change-improve-paint/)
> 流程render tree -> 渲染元素 -> GPU渲染 -> 浏览器复合图层 -> 生成最终的屏幕画像
每个图层会被加载到gpu中渲染，gpu渲染中不会触发重绘，这些transform的图层会有独立的合成器进行进行处理。
- 哪些规则可以让浏览器主动创建图层呢
- transform不为none
- 透明属性opacity不为1
- position不为ralative，且有z-index
- 用于css过滤器元素filter
- will-change: transform; // 创建新的渲染层，使用gpu加速渲染，可以使用元素的伪类hover，移入的时候触发，移除就remove

## 性能优化
### 页面是否能快速加载
- 网络优化
  - http2
  - cdn
- 代码大小
  - 代码分隔
  - 代码压缩
  - tree-shaking
- 首屏优化

- 缓存
  - 善用http缓存比如静态资源增加缓存public max-age
### 图片优化
- 图片压缩
- 图片懒加载
### 合理的交互loading

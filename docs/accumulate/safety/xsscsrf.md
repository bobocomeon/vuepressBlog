# 谈谈XSS与CSRF

## xss 跨站脚本攻击
- 攻击者通过在目标网站上注入恶意脚本，使之在用户的浏览器上运行，利用这些恶意脚本，攻击者可获取用户的敏感信息如`cookie、sessionId`，是利用了用户相信服务器为基础
- xss本质是恶意代码未经过过滤，与网站正常代码混淆在一起，直接在用户终端执行，以此获取用户信息，或利用这些信息冒充用户向网站发起恶意请求。
### 输入处理
1. 来此用户输入的信息做转码处理
2. 来自第三方的链接
3. URL参数
4. POST参数
5. Referer
6. Cookie

## XSS分类
### 存储型XSS
攻击步骤
1. 攻击者将恶意代码提交到目标网站的数据库中
2. 用户打开目标网站时，服务器将恶意代码从数据中取出，拼接在HTML返回给浏览器
3. 浏览器接受到响应后解析执行，混入其中的恶意代码也被执行
4. 恶意代码窃取用户数据发送到攻击这网站，或冒充用户行为

> 常见操作于保存数据的网站功能，如论坛发帖、商品评论、用户私信等

### 反射型XSS
攻击步骤
1. 攻击者构造出特殊的URL，其中包含恶意代码
2. 用户打开带有恶意代码的URL时，网站服务端将恶意代码从URL中取出，拼接在HTML中返回给浏览器
3. 用户浏览器接受响应解析，恶意代码执行
4. 恶意代码窃取用户数据并发送到攻击者网站

> 反射型和存储型的区别是，存储型XSS的恶意代码存在数据库中，反射型存在URL中。反射型XSS漏洞常见于通过URL传递参数的功能，如网站搜索、跳转等。
```js
<input type=text value="keyword"/>
<button>搜索</button>
<div>
  您搜索的关键词是：{{keyword}}
</div>
// 点击搜索发送的请求
`http://xxx/search?keyword="><script>alert('XSS');</script>`
// 服务端解析出请求参数得到 "><script>alert('XSS');</script> 返回给用户端
<input type="text" value=""><script>alert('XSS');</script>">
<button>搜索</button>
<div>
  您搜索的关键词是："><script>alert('XSS');</script>
</div>
// 还执行了两遍
```

### DOM型XSS
攻击步骤
1. 攻击者构造出特殊的URL，其中包含恶意代码
2. 用户打开带有恶意代码的URL
3. 用户浏览器接受响应解析执行，前端js取出URL中的恶意代码执行
4. 恶意代码窃取用户数据并发送到攻击者的网站，或者冒充用户的行为，调用目标网站接口执行攻击者指定的操作。

> DOM 型 XSS 跟前两种 XSS 的区别：DOM 型 XSS 攻击中，取出和执行恶意代码由浏览器端完成，属于前端 JavaScript 自身的安全漏洞，而其他两种 XSS 都属于服务端的安全漏洞
比如在网页中有个输入框，在输入完成之后就会创建一个a标签，并且将输入值作为a标签的属性
```js
// html
<div class="link"></div>
<input type="text" class="user-input">
<Button class="submit">提交</Button>
// js
var $ = (selector) => document.querySelector(selector);
$('.submit').addEventListener('click', function () {
    $('.link').innerHTML = "<a href='" + $('.user-input').value + "'>点我呀</a>"
});
```
当我输入'onclick=alert('hhh')',就完成了一次简单的xss攻击，a标签就会变成，在使用.innerHTML v-html时候要小心。
	
<a href="" onclick="alert(123)" ''="">点我呀</a>

### 预防XSS攻击
- 转义HTML， 将& < > " ' / 进行转义 跳转链接
```
'&lt;': '<',
'&gt;': '>',
'&quot;': '"',
'&amp;': '&',
'&#10;': '\n'
```
- HttpOnly 防止劫取Cookie
- Content Security Policy
  - 禁止加载外域代码
  - 禁止外域提交
  - 禁止内联脚本执行
  - 禁止未授权脚本执行
- 验证码
- 避免使用内联事件，避免拼接HTML，限制输入长度
> 设置方式，1. 通过HTTP response header设置 Content-Security-policy 2. 通过meta标签<meta http-equiv="Content-security-policy" content="script-src self">
## csrf 跨站请求伪造
攻击者诱导受害者进入第三方网站，在第三方网站中，想被攻击者网站发送跨域请求，利用受害者在被攻击网站的凭证，绕过后台的验证，达到冒充用户对攻击网站操作

### 典型的操作流程
1. 用户登录a.com,并保留了登录凭证
2. 攻击者引诱受害者访问了b.com
3. b.com向a.com发送了一个请求，a.com/act=xx，浏览器会默认带上a.com的Cookie
4. a.com收到请求之后，对请求进行验证，并确认是受害者的凭证，误认为是用户发送给自己的请求
5. a.com已正常用户的名义执行了act=xxx
6. 攻击完成。攻击者在用户不知情的情况下冒充正常用户执行了自定义操作

### 常见的攻击类型
#### GET类型的CSRF
在受害者访问这个含有img的页面后，浏览器会发出一次请求，这样就收到了一次跨域请求
#### POST类型CSRF
攻击者自动构造出一个表单进行自动提交
```js
 <form action="http://bank.example/withdraw" method=POST>
    <input type="hidden" name="account" value="xiaoming" />
    <input type="hidden" name="amount" value="10000" />
    <input type="hidden" name="for" value="hacker" />
</form>
<script> document.forms[0].submit(); </script> 
```
#### 链接类型的CSRF
这种类型通常是在论坛中发布的图片中嵌入恶意链接，或者以广告的形式诱导用户中招
```js
<a href="http://test.com/csrf/withdraw.php?amount=1000&for=hacker" taget="_blank">
  重磅消息！！
<a/>
```
### CSRF的特点
1. 攻击一版发生在第三方网站，而不是目标网站
2. 攻击利用受害者的登录凭证，冒充受害者提交请求，而不是直接窃取数据
3. 整个过程攻击者并不能获取到受害者的登录凭证，仅仅是“冒用”
4. 跨站请求可以用各种方式：图片URL、超链接、CORS、Form提交等等。部分请求方式可以直接嵌入在第三方论坛、文章中，难以进行追踪
5. CSRF通常是跨域的，因为外域通常更容易被攻击者掌控

### 防护策略
- 阻止不明外域的访问
  - 同源检测
    - Origin Header
    - Referer Header
  - Samesite Cookie
    - 在Set-Cooloe响应头增加Samesite属性， strict 表示这个cookie不能作为任何第三方cookie， 
    - Lax表示 打开了新页面并且是GET请求，则可以作为第三方cookie, 那么其他网站通过页面跳转过来的时候可以使用Cookie，可以保障外域连接打开页面时用户的登录状态
    - 缺点： 不支持子域
    ```js
    Set-Cookie: foo=1; Samesite=Strict
    Set-Cookie: bar=2; Samesite=Lax
    Set-Cookie: baz=3
    ```
  - Referrer Policy
    - 头部mete 设置`heep-equiv="Content-Security-policy"`
    - rep header 进行设置
- 提交时要求附加本域才能获取的信息
  - CSRF Token
  - 双重Cookie验证

### 总结
- CSRF自动防御策略：同源检测（Origin 和 Referer 验证）。
- CSRF主动防御措施：Token验证 或者 双重Cookie验证 以及配合Samesite Cookie。
- 保证页面的幂等性，后端接口不要在GET页面中做用户操作。

[参考链接](https://tech.meituan.com/2018/10/11/fe-security-csrf.html)
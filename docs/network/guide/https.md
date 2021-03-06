# https
## https的工作模式
0. 尽量tcp的三次握手
1. 客户端会发送一个消息到服务端，已明文传输TLS版本信息，加密套件、压缩算法候选列表等信息，以及一个随机数`random1`
2. 服务端收到之后，告诉客户端服务器选择使用的协议版本、加密套件、压缩算法等，还有一个随机数`random2`，用于后面协商密钥，还有一个证书
3. 客户端收到证书，验证证书的有效性，得到证书的信息以及服务器的公钥，(这里很关键的一点，密钥不明文传输的了，通过证书获得)
4. 用`random1`和`random2`生成`pre-master`通过服务器公钥加密传输到服务器
5. 双发用`random1`+`random2`+随机数`pre-master`一起根据约定的加密算法算出对称密钥，然后双发用原来商量过的参数进行加密传输校验
6. 双方握手结束之后，就可以通过对称密钥进行加密传输了

## 关于如何生成和校验数字证书
1. 服务器提交自己的公钥和站点资料提交给CA，CA审核真实性之后，用hash算法对明文资料加密得出信息摘要，CA用自己的私钥对用到的`HASH`算法等信息加密进行加密得出数字签名。
2. 最后服务器得到的CA前面的数字证书是包含公钥，基础信息，以及数字签名
3. 服务器得到数字证书后，会先验证证书的有效期，是否被CA吊销，以及CA是否是合法的。（会有数字证书链）
4. 验证通过后通过CA的公钥对数字前面进行解密得到信息摘要，在用解密得到的hash算法对公钥、证书信息进行hash散列算法得到信息摘要，判断是否相等。

## https加密了为什么抓包还是明文
https抓包的原理其实是抓包程序将服务器的证书截获的，先在本地安装自己的证书，然后把自己的证书发送给客户端，客户端发送数据之后，在用自己的证书将客户端发送的数据进行解密，将服务器的证书对其进行加密，再发送给服务器，使用能看到明文。
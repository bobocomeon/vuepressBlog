# TCP
[参考](https://juejin.cn/post/6844903958624878606#heading-7)
## 三次握手
c: syn = 1 seq = x  syn_send
s: syn = 1 ack = 1 seq = y ackNum = x + 1  syn_rev
c: ack = 1 ackNum = y + 1 ESTABLISHED
## 四次挥手
c: fin = 1 seq = u fin_wait
s: ack = 1 sqq = v ackNum = u + 1 s: close_wait c: fin_wait2
s: fin = 1 ack = 1 seq = x, ackNum = u + 1 last_ack
c: ack = 1 ackNum = x + 1 last_wait 等待2MSL
### 为什么需要四次挥手
服务器收到关闭请求，会进行ack确定，告知c端，我收到你请求了，但是还是可以进行数据传递，可能还没传输完，等没有数据传输了，发送fin和seq告知c端，我这没有数据要传了，可以关闭了，就到了等待c端应答确认，不能一起发送确认，就需要四次

### 2MSL等待状态
- 最长报文段寿命
- 最后一个ACK可能丢失，导致处理最后last_ack状态的服务器收到步到ack确认报文，超时会重传这个fin——ack，然后继续重新启动等待计时器。
- 如果不等待，而是在发送完ACK之后直接释放关闭，一但这个ACK丢失的话，服务器就无法正常的进入关闭连接状态。

### 流量控制
- tcp需要把发送的数据放到发送缓存区，将接受的数据到接收缓存区，而流量控制要做的事情就是通过接收缓存区的大小，控制发送端的发送。
- 双方会有一个滑动窗口，发送窗口和接收窗口，已发送和未发送的都会进行都会进行标记
### 拥塞控制
- 慢启动： 三次捂手，双方宣告自己的接收窗口大小，然后各自初始化自己的拥塞窗口大小，发送端没发一个ack，拥塞窗口加1，一直试探，加倍，一直到达阀值。
- 拥塞避免： 达到阀值就会控制翻倍的值
- 快速重传： 如果在传输过程中丢包，即接收端发现数据段不是按序到达的时候，接收端会重复发送之前的ack，比如第四个包丢了，第6、7的包到达了接收端，也会按第四个包进行重传
- 快速恢复： 发送端接收到三次重复的ACK之后，发现丢包，觉得网络有点拥塞，自己会进入快速回复阶段，比如将阀值降低

### 半状态
客户端发送SYN到服务端，服务器回复ACk和SYN，状态由listen变为SYN_ECVD

### 全连接状态
三次握手完成，在被具体应用取走之前，被推入另外一个tcp维护的队列

### SYN Flood 攻击原理
- SYN Flood 属于典型的 DoS/DDoS 攻击。其攻击的原理很简单，就是用客户端在短时间内伪造大量不存在的 IP 地址，并向服务端疯狂发送SYN。对于服务端而言，会产生两个危险的后果
  - 处理大量的SYN包并返回对应ACK, 势必有大量连接处于SYN_RCVD状态，从而占满整个半连接队列，无法处理正常的请求
  - 由于是不存在的 IP，服务端长时间收不到客户端的ACK，会导致服务端不断重发数据，直到耗尽服务端的资源。


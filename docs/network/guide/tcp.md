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
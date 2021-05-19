# Typescript

## type和interface区别
### 相同点
- 都可以描述一个对象或者函数
- 都允许扩展 互相extends， 交叉类型
### 不同点
- type可以声明类型别名、联合类型、元祖等
- type语句中可以使用typeof获得实例的类型进行赋值

- interface可以合并声明
可以使用class类去implements一个interface
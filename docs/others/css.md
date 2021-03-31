# CSS相关
## flex总结
[参考链接张鑫旭](https://www.zhangxinxu.com/wordpress/2018/10/display-flex-css3-css/)

> `默认是水平轴`
### 作用在flex容器上的CSS属性
- flex-direction
  - row 水平 从左往右
  - row-reverse 反向水平
  - column  竖
  - column-reverse 反向竖

- flex-wrap
  - nowrap 默认值，单行显示
  - wrap 宽度不足换行
  - wrap-reverse 宽度不足换行但是从下往上

- flex-flow
flex-flow: flex-direction | flex-wrap

- justify-content
> `决定水平方向子项的对齐和分布`
  - flex-start 向左对齐
  - flex-end 向右对齐
  - center 居中对齐
  - space-between 两端对齐 两边的靠右无间距 中间等分
  - space-around 两端对齐 两边靠右有间距 两边是中间的二分之一
  - space-evenly 每个间距都均匀分布

- align-item
> `决定flex子项们相对于flex容器在垂直方向上的对齐方式`
  - stretch 默认值 子项拉伸
  - flex-start 容器顶部对齐
  - flex-end 容器底部对齐
  - center 垂直居中
  - baseline  所有flex子选项相对于flex容器基线对齐

- align-content
> `指明垂直方向每一行flex元素的对齐和分布方式,如果所有flex子项只有一行，align-content是没有任何效果的`
stretch 默认值，每一行flex子元素都等比例拉伸
flex-start 逻辑css属性值，从顶部堆砌
flex-end 底部堆放
center 整体垂直居中
space-around 每一行都上下享有独立不重叠空间
space-evenly 每一行元素等分

### 作用在flex子项上的CSS属性
- order 可通过设置order改变某一个flex子项的排序位置 默认是0，如果想要某一个flex子项排在前面，可设置比0小的整数就可以了，比如-1
- flex-grow
  - 不支持负值，默认是0，表示不占用剩余空间扩展增加的宽度
  - 只有一个flex子项设置了flex-grow属性值
    - flex-grow大于1， 扩展空间就总剩余空间和这个比例的计算值
    - flow-grow小于1，则独享所有剩余空间
  - 多个flex设置
    - 总和小于1，则每个子项扩展的空间就总剩余空间和当前元素设置的flow-grow比例的计算值
    - 总和大于1，则表示剩余空白间隙大家等分，如果设置flex-grow比例： 1:2:1，则中间flex子项占据一半项目的空白间隙，剩下前后两个元素等分
- flex-shrink (收缩)
> `不支持负值，默认值是1，也就是默认所有flex子项都会收缩，如果设置为0，就是不收缩;已知flex子项不换行，且容器空间不足，不足的空间就是“完全收缩的尺寸”：`
- 如果只有一个flex子项设置了flex-shrink
  flex-shrink值小于1，则收缩的尺寸不完全，会有一部分内容溢出flex容器
  flex-shrink值大于等于1，则收缩完全，正好填满flex容器
- 多个flex子项设置了flex-shrink
  - flex-shrink值的总和小于1，则收缩的尺寸不完全，每个元素收缩尺寸占“完全收缩的尺寸”的比例就是设置的flex-shrink的值。
  - flex-shrink值的总和大于1，则收缩完全，每个元素收缩尺寸的比例和flex-shrink值的比例一样
- flex-basis
> `定义了在分配剩余空间之前元素的默认大小 flex-basis: <length> | auto;/* 默认值是 auto */`
  - 默认值是auto，就是自动。有设置width则占据空间就是width，没有设置就按内容宽度来
  - 如果同时设置width和flex-basis，就渲染表现来看，会忽略width
  - 当剩余空间不足的时候，flex子项的实际宽度并通常不是设置的flex-basis尺寸，因为flex布局剩余空间不足的时候默认会收缩

- flex
flex属性是flex-grow，flex-shrink和flex-basis的缩写
> `语法： flex： none | auto | [<'flex-grow'><'flex-shrink'>? || <'flex-basis'>] `
  - 其中第2和第3个参数（flex-shrink和flex-basis）是可选的。`默认值: 0 1 auto`
  - flex默认值等同于 flex： 0 1 auto
  - flex：none等同于 0 0 auto
  - flex:auto等同于flex:1 1 auto；

- align-self
  - 指控制单独某一个flex子项的垂直对齐方式， 写在flex容器上的这个align-items属性，后面是items，有个s，表示子项们，是全体；这里是self，单独一个个体
  - 唯一区别就是align-self多了个auto（默认值），表示继承自flex容器的align-items属性值

### 常见flex语法
- 单值语法
  - 一个无单位数<number>：会被当做flex: <number> 1 0; flex-shrink值假定为1，然后flex-basis值假定为0
  - 一个有效的宽度width值，它会被当多flex-basis的值
  - 关键字
    - none 元素会根据自身宽高来设置尺寸。它是完全非弹性的：既不会缩短，也不会伸长来适应 flex 容器，相当于设置了`flex; 0 0 auto`
    - auto 元素会根据自身的宽高来确定尺寸，但是会伸长并吸收容器中额外的自由空间，也会缩短自身来适应flex容器，这相当于将属性设置为`flex：1 1 auto`
    - initial 元素会根据自身的宽高来确定自身尺寸，但是会收缩自身已适应flex容器，但并不会伸长并吸收flex容器额外的空间，相当于设置了`flex： 0 1 auto`
- `flex: 1` 就相当于设置了`flex: 1 1 auto`, 由于flex-shrink是1，默认不收缩， auto是按照内容宽度， flex-grow默认为0,不伸长，但是设置1就会根据剩余的对比，进行等比放大。
# typescript
阶段总结

## 函数
### 函数声明
```ts
type LongHand = {
  (a: number): number
}
type ShortHand = (a: number) => number;

// 使用函数重载时，只能用第一种方式:
type LongHandAllowsOverloadDeclarations = {
  (a: number): number;
  (b: number): string;
}
```
### 函数重载
```ts
function fun(a1: string, type: "app"): string
function fun(a1: number, type: "system"): number
function fun(a1: number | string, type: "app" | "system") : string | number {
// ...
  if (typeof a1 === 'number' && type === 'system') {
    return a1
  }
  return '123'
}

fun(12, 'system'); // ok
fun(12, 'app'); // error 参数类型对不上
```
### 函数调用
可使用类型别名或接口来表示一个可被调用的类型注解
```ts
interface ReturnString {
  (): string
}
declare const foo: ReturnString
const bar = foo(); // bar 被推断为一个字符串。
```
也可以根据实际来传递任何参数、可选参数以及 rest 参数，
```ts
interface Complex {
  (foo: string, bar?: number, ...others: boolean[]): string
}
const complecFunc: Complex = (foo, bar, ...others) => {
  let result = `Received foo: ${foo}`;
  if (bar !== undefined) {
    result += `, bar: ${bar}`;
  }
  if (others.length > 0) {
    result += `, others: ${others.join(", ")}`;
  }
  return result;
}

```
### 箭头函数
箭头函数不能使用，重载必须使用完整的 { (someArgs): someReturn } 的语法
```ts
const simple: (foo: number) => string = foo => foo.toString();
// 1.  (foo: number) => string是类型注解
// 2. 它接收一个参数 foo，并且直接返回 foo.toString() 的结果
// 调用
console.log(simple(123));  // 输出: '123'
console.log(simple(456.789));  // 输出: '456.789'
```
### 实例化
```ts
interface CallMeWithNewToGetString {
  new (): string;
}
// 使用
declare const Foo: CallMeWithNewToGetString;
const bar = new Foo(); // bar 被推断为 string 类型
```
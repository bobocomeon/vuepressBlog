# Typescript

## type和interface区别
### 相同点
- 都可以描述一个对象或者函数
- 都允许扩展 互相extends， 交叉类型
### 不同点
- type可以声明类型别名、联合类型、元祖等
- type语句中可以使用typeof获得实例的类型进行赋值
- interface可以合并声明，可以使用class类去implements一个interface

# 类型基本知识
## 知识点：keyof / in / extends。
### keyof
> `keyof` 用于获取某个对象类型的所有键的联合类型。
```ts
interface Student {
  name: string;
  age: number;
}
type StudentKeys = keyof Student;
// StudentKeys: 'name' | 'age'
```
通过 `keyof` 获取到的 `'name' | 'age'` 这样通过 `|` 分割的类型集合，称之为联合类型`（union type）`，表示取值可以为多种类型中的一种。

```ts
type Potion = {
  color: string;
  effect: string;
  duration: number;
};

type PotionKeys = keyof Potion; // 'color' | 'effect' | 'duration'
type anyKeys = keyof any; // string | number | symbol
```
`keyof` 法术的力量并不局限于简单的对象类型。它还可以用于索引签名的对象类型，从而捕获动态键的类型。
```ts
type TreasureMap = {
  [location: string]: string;
};
type Locations = keyof TreasureMap; // string
```

### in
> `in` 用于遍历联合类型中的每个成员，并且通常与映射类型（Mapped Types）一起使用。
```ts
type SpellBook = {
  [Spell in PotionKeys]: boolean;
};
// 等价于
type SpellBook = {
  color: boolean;
  effect: boolean;
  duration: boolean;
};

type nameKeys = 'firstname' | 'lastname'

type FullName = {
  [key in nameKeys]: string;
}
// FullName: { firstname: string, lastname: string }
```
`SpellBook` 是一个映射类型，它将 `PotionKeys` 中的每个键映射为 `boolean` 类型。这意味着 `SpellBook` 的每个属性`（'color'、'effect'、'duration'）`都是 `boolean` 类型的。

### extends
> `extends` 用于表示类型的继承或兼容性，它可以出现在类型约束或条件类型的上下文中。
1. 类型约束的应用：
```ts
function castSpell<T extends Potion>(spell: T) {
  // ...
}
```
`castSpell`要求传入的 `spell` 必须是 `Potion` 类型或其子类型,这里的 `T extends Potion` 确保了 `T` 是 `Potion` 的一个扩展类型。


2. 条件类型的应用：
```ts
type ExtractColor<T> = T extends { color: infer C } ? C : never;
```

3. 分布式条件类型

允许你对联合类型中的每个成员类型单独应用条件类型
```ts
type WarmOrCold<T> = T extends 'fire' | 'ice' ? 'warm' : 'cold';
type ElementWarmth = WarmOrCold<'fire' | 'ice' | 'lightning'>; // 'warm' | 'cold' | 'cold'
```
4. 结合使用
```ts
type ItemEnchantment<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
// [keyof T]：这个部分和之前一样，把我们构造的类型映射转换成联合类型，以包含所有保留下来的键。
// 组成一个新的联合类型。在这个联合类型中，所有映射到 never 的键都会被排除，因为 never 类型在联合类型中不占任何位置

interface MagicalItem {
  enchat: () => void;
  name: string;
}
type EnchantableProperties = ItemEnchantment<MagicalItem> // 'enchat'
```
5. 例子
```ts
interface IPerson {
  name: string;
  age: number;
}
type PersonType = 'name' | 'age'
type PersonType2 = {
  name: string
  number: number
}
type First<T extends any[]> = T[0]

type head = First<[]> // 为 undefined
type head1 = First<number[]> // 为 number
type head2 = First<string[]> // 为 string
type head3 = First<IPerson[]> // 为 IPerson
type head4 = First<PersonType[]> // 为 "name" | "age"
type head5 = First<PersonType2[]> // 为 type head5 = { name: string; number: number;}
```
### infer
> `infer` 用于在条件类型表达式中声明一个类型变量,用在 extends 条件子句中时，它可以捕获并推断出类型。

要理解`infer`,必须首先理解条件类型`（conditional Type）`这个概念
```ts
T extends U ? X : Y
// 解释： 如果类型可以被赋值给类型U（在类型学中，我们可以说T可以扩展到U），那么结果类型就是X，否则类型就是Y。
```
`infer`可以让你不必预先知道某个类型的确切形式，可以在条件类型检查中声明一个变量`C`，通过`infer C`捕获`T`中的相应部分
```ts
T extends { color: infer C } ? C : never
// 解释： 类型 T 是否有一个 color 属性，如果是肯定的，那么infer就会捕获该属性的类型，并将其存放在变量C中，C 此时代表被捕获的类型

type ArrayElementType<T>
  = T extends (infer E)[] ? E : never;

// item1 为 number
type item1 = ArrayElementType<number[]>

// item2 为 never
type item2 = ArrayElementType<number>
```
#### 实现数组方式push
```ts
type Push<T extends any[], U> = [...T, U]
type NumberArray = [number, number];
type NewType = string;
type ExtendedArray = Push<NumberArray, NewType>;
// ExtendedArray 的类型是 [number, number, string]

// 实际函数应用
function push<T extends any[], U>(array: T, item: U): Push<T, U> {
  return [...array, item];
}

const numbers = [1, 2, 3];
const moreNumbers = push(numbers, 4); // [1, 2, 3, 4]
```

### 结合`infer`和`extends`的真实案例
1. 获取对象类型中的类型值
```ts
type PotionEffect = { color: 'blue', effect: 'nana'};
type ExtractColor<T> = T extends { color: inter C} ? C : never;
type BlueColor = ExtractColor<PotionEffect>; // 'blue'
// PotionEffect 类型有一个 color 属性，它的值是 'blue'。
// ExtractColor 检查 PotionEffect 是否有 color 属性。
// 由于 PotionEffect 匹配 { color: infer C } 这个模式，infer C 将捕获 'blue' 类型。
// 最终，ExtractColor<PotionEffect> 被解析为 BlueColor 类型，也就是 'blue'。
```
2. 数组第一个元素
```ts
type First<T extends any[]>
  = T extends [infer Head, ...any[]] 
    ? Head : never
type PotionIngredients = ['mandrake root', 'unicorn hair', 'moonstone'];
type FirstIngredient = First<PotionIngredients>; // 结果将是 'mandrake root'
// 如果数组为空，我们将得到 never
type EmptyCauldron = First<[]>; // 结果将是 never

// 定义一个由数字和字符串组成的数组类型
type MixedArray = [42, 'elixir', true];

// 使用 First 提取数组的第一个元素类型
type FirstElement = First<MixedArray>; // 结果将是 42 的类型，即 类型为number值为42

// 定义一个由组成的数组类型
type MagicalCreatures = ['dragon', 'griffin', 'phoenix'];

// 使用 First 提取数组的第一个元素类型
type FirstCreature = First<MagicalCreatures>; // 结果将是 'dragon'
```
### 联合类型和extends
#### Exclude
实现内置的 `Exclude <T, U>` 类型，从联合类型 `T` 中排除 `U` 的类型成员，来构造一个新的类型
```ts
// TODO: 实现 MyExclude
type MyExclude<T, U> = any
type Result = MyExclude<
  'a' | 'b' | 'c' | 'd', 
  'a' | 'd'
> // 结果为 'b' | 'c'
```
对于 T 这样的联合类型而言，作用于 extends 时，有一条独特的规则：
> 在 `X extends Y` 的条件类型语句中，若 `X` 是联合类型的范型，则会将联合类型的每一个可能的值代入进行独立计算，再将结果通过 `|` 组合起来。
```ts
type ToArray<Type> = Type extends any ? Type[] : never;
// StrArrOrNumArr 为 string[] | number[]
type StrArrOrNumArr = ToArray<string | number>
```
> 当且仅当 联合类型的范型 时才会有这种效果，如果单单是联合类型而不涉及泛型时，则是直接拿字面量进行判断
```ts
type IsString<T>
  = T extends string ? true : false
// isA 为 true | false
type isA = IsString<string | number>
// isB 为 false，此时不涉及泛型
type isB = (string | number) extends string ? true : false
```
由于 `T` 是联合类型，所以可以将 `T` 中的每一个类型取出，判断其是否在 `U` 中，如果在的话则通过 `never` 排除，不在的话则保留
```ts
type MyExclude<T, U> = T extends U ? never : T;
type words = 'a' | 'b' | 'c' | 'd'
type maxB = MyExclude<words, 'a' | 'b'> // 'c' | 'd'
```
### `infer` / 递归调用
假如我们有一个 `Promise` 对象，这个 `Promise` 对象会返回一个类型。在 `TS` 中，我们用 `Promise` 中的 `T` 来描述这个 `Promise` 返回的类型。请你实现一个类型工具，可以获取这个类型。

例如：`Promise<Type>`，请你返回 `Type` 类型。
```ts
// TODO: 实现 MyAwaited
type MyAwaited = any;

// Result1 为 string
type Type1 = Promise<string>
type Result1 = MyAwaited<Type1>

// 支持 Promise 嵌套，Result2 为 string
type Type2 = Promise<Promise<string>>
type Result2 = MyAwaited<Type2>

// 传入非 Promise 对象，抛出错误
type Result3 = MyAwaited<string>
```
对于 `Promise` 嵌套的情况，要能够取出最里层的数据类型，例如对于 `Promise<Promise<string>>` 类型，应该拿到 `string`。

当传入非 `Promise` 类型的时候，应该报错方便提前发现问题。

为了取出 `Promise` 包裹的类型,就需要用到`infer`
```ts
// 简单版本
type MyAwaited<T> = T extends Promise<infer K> ? K : never;
```
平时我们写普通代码的时候，是用循环和递归来实现来处理嵌套，但是`ts`不支持循环，对于 `infer K` 推断出来的类型 `K`，判断是否为 `Promise`,若是的话则将它带入 `MyAwaited<K>` 再计算一遍。
```ts
type MyAwaited<T> = T extends Promise<infer K> ? 
  K extends Promise<any> 
  ? MyAwaited<K> : never;
```
最后来处理当传入的类型不是 `Promise` 时应该抛出错误的问题，换个思路，声明 `T` 是 `Promise` 类型后，`TypeScript` 编译器会自动检查类型并报错
```ts
type MyAwaited<T extends Promise<any>> = 
  T extends Promise<infer K> 
    ? K extends Promise<any> 
    ? MyAwaited<K> : never
```
> 将答案中的两个 `any` 替换成 `unknown` 也是正确的,`unknown`类型表示未知的类型，可以被赋予任何值，但与`any`不同的是，对于`unknown`类型的值，你不能直接执行任何操作，除非你使用类型断言或类型守卫来缩小类型到一个更具体的类型。
```ts
// 理解unknown
let mystery: unknown = "This is a string";

// 错误！对象的类型为 'unknown'。
console.log(mystery.length); // 这会导致一个编译时错误。

// 正确！使用类型守卫来缩小类型。
if (typeof mystery === "string") {
  console.log(mystery.length); // 现在这是安全的。
}

// 运用于泛型编程
function wrapInArray<T>(value: T): T[] {
  return [value];
}

const unknownBox = wrapInArray<unknown>("a mysterious string");
```
### `If` 类型
>它接收一个条件类型 `C` ，一个判断为真时的返回类型 `T` ，以及一个判断为假时的返回类型 `F`。 `C` 只能是 `true` 或者 `false`， `T` 和 `F` 可以是任意类型。
```ts
// TODO: 实现 If
type If<C, T, F> = any

// A 为 'a'
type A = If<true, 'a', 'b'>

// B 为 'b'
type B = If<false, 'a', 'b'>

// 传入的不是 true / false，抛出错误
type error = If<null, 'a', 'b'>
```
关键点在于如何判断C为 `true` 还是 `false`

对于 `true / false，甚至 1 / 2 / null / undefined / 'hello'` 这些基本类型的变量，可以直接使用 `extends` 判断
```ts
type If<c extends boolean, T, F> = C extends true ? T : F;
```
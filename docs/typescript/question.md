# 知识点
## any、never、unknown 和 void 区别
1. any： 用于描述任意类型，不会被约束，相当于逃生门
2. never： 永不存在值类型，常用于永不执行到终点的函数返回值，比如如函数内部抛出了异常或者函数内有无限循环。 
   
    - 还能过滤联合类型中的某些成员. never在联合类型中不会显示
      ```ts
      type FilterOut<T, U> = T extends U ? never : T;
      type Result = FilterOut<'a' | 'b' | 'c', 'a'>  // "b" | "c"
      ```

    - never 常常用来过滤掉不符合某些条件的类型。
      ```ts
      type Check<T> = T extends string ? string : never;
      type Test = Check<number>; // never // 表示这是一个不应该发生的情况。
      ```
    - 表示不可达的代码或条件分支。
x
3. unknown： 和any类似，在定义的时候可使用，但是使用的时候要做类型断言或联系判断，不然会保持，更安全
4. void： 表示无任何联系，例如没有返回值的函数的返回值类型

## TypeScript 中 const 和 readonly 的区别？枚举和常量枚举的区别？接口和类型别名的区别？

  - const 
    - 用于声明一个常量，用户变量声明
    - 当用做断言的时候，`as const`。
    ```ts
    const text = 'hello world' as const; // 类型为'hello world'，而为string
    const array = [10, 20] as const; // 类型为 readonly [10, 20] 而非 number[]
    // 对象和数组会被隐式地标记为 readonly
    const config = {
        name: "Application",
        version: 1.0
    } as const;
    // 不仅适用于简单的数组和对象，它也可以用于更复杂的嵌套数据结构，保证整个结构的不可变性和类型的准确性。
    ```
- readonly: 用于声名一个属性为只读，这意味着该属性在初次赋值后就不能被外部修改。readonly主要用在类属性或接口中，但只是浅标记只读，深层次的也要标记才能只读。

- 普通枚举（Enum）
  - 枚举在编译后生成包含反向映射的代码（即从枚举值到枚举名和从枚举名到枚举值的映射）。
  - 可以包含计算的和常量成员。
  - 在运行时存在，可以被传递和修改。
  ```ts
  enum Color {
    Red, // 0
    Green, // 1
    Blue, // 2
  }
  conosle.log(Color.Red) // 0
  conosle.log(Color[0]) // Red
  ```
- 常量枚举（Const Enum）:
    常量枚举在编译时会被完全移除，它们的值会在编译时计算出来，不生成运行时的代码.
    所有的枚举成员都必须是常量（不可以是计算成员）。
    常量枚举在编译阶段会被完全删除，成员的值会在使用的地方被直接替换为具体的值。
    
    ```ts
    const enum Color {
        Red,
        Green,
        Blue
    }
    console.log(Color.Red); // 在编译后的代码中直接被替换为 0
    ```

- 接口（Interface）
  - 需要扩展性或继承，可通过extends关键字来实现继承以及多重继承，维护一个层次结构的类型系统变得简单和直观
  - 类实现：类可直接通过`implements`来实现接口
  - 能能好的用来定义对象接口，在定义公共Api或类库的APi非常有用。

- 类型别名（type）
  - 类型别名特别适合组合已存在的类型，如联合类型、交叉类型、元祖等
  - 类型别名可以和映射类型、条件类型一起使用，类型别名是唯一的选择，可创建动态和条件组合成新的类型。
      ```ts
      type ReadOnly<T> = {readonly [P in keyof T]: T[P]}
      type Partial<T> = {[P in keyof T]?: T[P]}
      type IsNumber<T> = { T extends number : true : false}
      ``` 

## TypeScript 中的 this 和 JavaScript 中的 this 有什么差异

1. this都用与引用函数和函数执行执行时的上下文对象
2. 和js中的this基本保持一致，但是ts中的this增加了类型检查，更加安全和可预测

## TypeScript 中可以使用 String、Number、Boolean、Symbol、Object 等给类型做声明吗？

-  string、 number、boolean、symbol表示基础类型
- object表示非原始类型，即表示非第一条，null、undefined、的类型

- `String、Number、Boolean、Symbol、Object`都属于构造器类型，生成相应的对象，在表示类型中，可表示成通过该构造函数创建的对象，而不是原始类型
  
  使用构造函数作为类型
  ```ts
  let primitiveString: string = "hello";   // 正确，使用原始类型
  let objectString: String = new String("hello");  // 创建了一个 String 对象 
  console.log(typeof primitiveString); // "string"
  console.log(typeof objectString);    // "object"
  ```


## TypeScript 中使用 Unions 时有哪些注意事项？
1. 类型保护: 要区分类型进行操作
2. 避免过于宽泛的联合，
3. 联合类型和接口用在一起时，但最好有共有的属性来区分，编译器可以通过检查 type 属性的值来保证类型的正确性。
    ```ts
    interface Bird {
      type: 'bird';
      speed: number;  // 飞行速度
    }

    interface Horse {
      type: 'horse';
      speed: number;  // 跑步速度
    }

    type Animal = Bird | Horse;

    function moveAnimal(animal: Animal) {
      if (animal.type === 'bird') {
        console.log('Flying at speed:', animal.speed);
      } else {
        console.log('Running at speed:', animal.speed);
      }
    }
    ```

## TypeScript 中如何联合枚举类型的 Key?

1. keyof typeof获取枚举键的集合，给我枚举中所有成员的名称，作为一个联合类型
2. 直接使用`keyof typeof enum ｜ keyof typeof enum`联合


## TypeScript 中 ?.、??、!.、_、** 等符号的含义？

-  可选链操作符（?.）
   -  允许你在读取对象属性时，安全地处理 null 或 undefined 的情况，如果是null和undefined就返回undefined
-  空值合并操作符（??）
   -  空值合并操作符 ?? 允许你为可能为 null 或 undefined 的表达式提供一个默认值。只有当左侧的操作数为 null 或 undefined 时，才会返回右侧的操作数
-  非空断言操作符（!.）
   -  断言表达式的结果，告诉 TypeScript 编译器，你已经确保了表达式在运行时不会为 null 或 undefined
-  下划线（_）
   -  命名私有属性或忽略函数参数
-  幂运算符（**）
   -  计算基数的指数次幂，等同于数学中的指数运算
  

## TypeScript 中预定义的有条件类型有哪些？

- `Partial<T>` 可选
- `ReadOnly<T>` 只读
- `Required<T>` 必选
- `Pick<T, K>`  从T中挑选一组属性K的对象
  - `type Pick<T, K extends keyof T> = { P in K: T[P]}`
- `Record<T, K>` 属性值为K，值为T
- `Exclude<T, U>` 从T中排出可以赋值给为U的类型
  - `type Exclude<T, U> = T extends U ? never : T`;
- `Extract<T, U>` 从T中抽取可赋值给U的类型
- `Omit<T, K>` 从T中排除属性K
  - type `Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>`
  - 先使用`Exclude`排出掉T中的类型`K`，在使用`Pick`提取`T`剩下的`key`;

## TypeScript 中同名的 interface 或者同名的 interface 和 class 可以合并吗

- 声明两个同名的接口时，它们会被自动合并成一个单独的接口
- 如果两个接口相同的属性在不同的接口声明中具有不兼容的类型，会编译报错
- 也可合并接口和具有相同名称的类，接口声明可以作为类的一部分，允许你在类中定义额外的类型信息（如实现的属性和方法的类型）
  ```ts
  class User {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
  }

  interface User {
      age: number;
  }

  let user = new User("Bob");
  user.age = 30;

  console.log(user); // 输出: User { name: "Bob", age: 30 }
  ```

## TypeScript 中 interface、type、enum 声明有作用域的功能吗？

- 模块作用域： 每个文件被视为一个模块，如果在文件顶层进行 interface、type 或 enum 的声明，那么这些声明默认具有模块作用域，除非明确导出
- 全局作用域： 通过声明文件（.d.ts 文件）来实现
- 命名空间作用域： 命名空间内的成员默认为私有，只有通过 export 关键字显式导出后才可以从命名空间外部访问
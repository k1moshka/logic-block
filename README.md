# DATA BLOCK

Data block is a JavaScript library for bundling bussiness logic of your data to common containers called blocks.

Features:
* **Declarative** - defining your logic (or block) as simple as defining object in JS
* **Modular** - every defined block is a simple bunch of logic, that is self-sufficient, and after it was defined you can use it in any kind of JS code
* **Automatic** - when create instance of block, it grabs all logic and runs logic automatically, and provide simple result as object
* **Flexible** - you allow to build complex block from little block or you can extend block with new rules
* **Independent** - every block is independent on the environment where it uses, the namespace of block is local, but it allow complex blocks to get values inside nested

And of course, it is very simple in usage.

## Installation
Just add it to project dependencies
```
yarn add data-block
// or
npm install --save data-block
```

## Usage
**IMPORTANT:**
The data-block lib is not an app state handler lib (like redux). Every block is just a runner of data logic.

1. Define a block with couple of rules (field reducers)

```javascript
import Block, { value, fields } from 'data-block'

const emailBlock = Block({
  email:
    value(),
  isCompanyEmail:
    fields(email => email.endsWith('@comp.com')) }, ['email'])
})
```

2. Create an instance of it
```javascript
const initialValues = { email: 'default@comp.com' }
const instance = emailBlock(initialValues)
```

3. Run instance to get the output results
```javascript
const initialState = instance()
// now initialState is
// { email: 'default@comp.com', isCompanyEmail: true }
```

4. Update value when you need
```javascript
// here you put only data which were changed
const newState = instance({ email: 'non-company@mail.com' })

// now newState is
// { email: 'non-company@mail.com', isCompanyEmail: false }
```

That's it. For more real-world example check the code in **example folder**.

## API
### **Block**
Block is just a builder function that provides factory of instances of defined block-scheme.

| Argument | Type                                                                     | Description                                                                                                                                                                                               |
| -------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| scheme   | `Object`                                                                 | The scheme what will use for reduce block instance state                                                                                                                                                  |
| handler  | `(value: Object, update: Function, oldValue: Object) => void` (optional) | The handler is a function what runs every time when block instance is updating. It runs once after new state was calculated, and gets as parameters new state value, update function and old state value. |

**Result**

BlockFactory

### **BlockFactory**
BlockFactory is a function which process data from input to the output calculated with scheme.

You get BlockFactory from block factory (you get block factory as result of call Block function).

| Argument              | Type                                           | Description                                                                                                                                                                          |
| --------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| initialValue          | `Object` (optional)                            | Initial value wich will use as old and new value in first render                                                                                                                     |
| options               | `InstanceOptions` (optional)                   | Options for creating instance, you can provide instance level update handler and changes detector                                                                                    |
| options.handleUpdate  | `(newValue: Object) => void` (optional)        | This function like handler calls once after new value calculated, but only for that instance. This is good place for reacting on updates of data in your app (update UI for example) |
| options.handleChanges | `({ has, hasAny, hasAll }) => void` (optional) | Function that like handler calls once after new value calculated, detects and runs callbacks for relative changes                                                                    |

**Result**

BlockInstance

### **BlockInstance**
BlockInstance is a function that takes changes in data and provide as a result calculated value based on a scheme

You get BlockInstance on every call of BlockFactory.

| Argument      | Type                | Description                                                                                                                                                       |
| ------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| changedValues | `Object` (optional) | Object that is slice of data, but it usually contains only changed values. If you don't provide this argument, BlockInstance will process data with current value |



## Motivation
I have created this lib for my one project, where the same business-logic should be using on different clients.
They had different UI, API, servers, code, platforms, but all them uses the pretty same logic for data.
And I thought about implementing business logic as separate library with minimal dependecies (the only dependency is data-block).
So the data-block solved my problem excellently.

Data blocks in combination with handlers gives simple and powerful solution for writing code that should be shared between projects.

So I wanted to share it with the community.


## Author
[Ilya Melishnikov](https://www.linkedin.com/in/ilya-melishnikov/)

## LICENSE
[MIT](./LICENSE.md)

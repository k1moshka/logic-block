# LOGIC BLOCK

**v1.3.0**


Logic block is a JavaScript library for bundling bussiness logic of your data to common containers called blocks.

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
yarn add logic-block
// or
npm install --save logic-block
```

## Usage
**IMPORTANT:**
The logic-block lib is not an app state handler lib (like redux). Every block is just a runner of data logic.

1. Define a block with couple of rules (field reducers)

```javascript
import Block, { value, fields } from 'logic-block'

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

| Argument | Type                                                                | Optional? | Description                                                                                                                                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| scheme   | `Object`                                                            | Mandatory | The scheme what will use for reduce block instance state                                                                                                                                                                                                                                           |
| handler  | `() => (value: Object, update: Function, oldValue: Object) => void` | Optional  | The handler is a function what runs every time when block instance is updating. It runs once after new state was calculated, and gets as parameters new state value, update function and old state value. For proper working you should use one of creator function: wrapHandler or createHandler. |

**Result**

BlockFactory

### **BlockFactory**
BlockFactory is a function which process data from input to the output calculated with scheme.

You get BlockFactory from block factory (you get block factory as result of call Block function).

| Argument             | Type                         | Optional, | Description                                                                                                                                                                          |
| -------------------- | ---------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| initialValue         | `Object`                     | Optional  | Initial value wich will use as old and new value in first render                                                                                                                     |
| options              | `InstanceOptions`            | Optional  | Options for creating instance, you can provide instance level update handler and changes detector                                                                                    |
| options.handleUpdate | `(newValue: Object) => void` | Optional  | This function like handler calls once after new value calculated, but only for that instance. This is good place for reacting on updates of data in your app (update UI for example) |

**Result**

BlockInstance

### **BlockInstance**
BlockInstance is a function that takes changes in data and provide as a result calculated value based on a scheme

You get BlockInstance on every call of BlockFactory.

| Argument      | Type                              | Optional? | Description                                                                                                                                                                                                                                                                                                                                                                            |
| ------------- | --------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| changedValues | `Object` or `(Object?) => Object` | Optional  | `Object` or `Function` which returns object that is containing slice of data, but it usually contains only changed values. If you don't provide this argument, BlockInstance will process data with current value. In case of passing `Function`, the function will apply as argument current value of instance, and must return object or undefined otherwise it throws the `Error` |


### **wrapHandler**
wrapHandler allows you to define your handler for block
| Argument       | Type                                                                | Optional? | Description                                                                           |
| -------------- | ------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------- |
| handlerFactory | `() => (value: Object, update: Function, oldValue: Object) => void` | Mandatory | Handler factory is a function that returns handler for every instance of logic block. |

**Example:**
```javascript
import Block, { wrapHandler, value } from 'logic-block'
// define block for checking emails
const EmailBlock = Block({
  email: value(),
  done: value(false),
  isValid: value(false)
}, wrapHandler(() => {
  // that namespace you can use as constructor, here you can cache values between updates of block
  // or initialize some resources for running handler
  let initialRender = true

  return async (value, update, oldValue) => {
    // this protector make us sure that it will be run only on first render of block
    if (!initialRender) return
    initialRender = false

    const { email } = value
    if (email?.endsWith('@company.com')) {
      update({ done: false, isValid: false })

      const isValid = await api.checkEmailInternal(email)
      update({ done: true, isValid })
    }
  }
}))

// create instance with setted checking email as initial values
// add handler of updates, because our checking is async
const emailChecker = EmailBlock({
  email: 'test@company.com'
}, {
  handleUpdate: ({ isValid, done }) => { if (done) console.log('is valid email', isValid) }
})
// run the block
emailChecker()
```

### **createHandler**
createHandler is a shortcut function for wrapHandler, that gets as a parameter handler of updates.
**Example:**
```javascript
import Block, { wrapHandler, value } from 'logic-block'

const progress = Block({
  percent: value(0),
  done: value(false)
}, createHandler((value, update, oldValue) => {
  if (propChanged(value, oldValue, 'a') && value.a === 100) {
    update({ done: true })
  }
}))
```

### **createFieldReducer**
createFieldReducer creates the field reducer that applies some metadata from scheme and returns new value based on it
| Argument  | Type                                                                                    | Optional? | Description                                                                                                                                                                                                                                                                                                                |
| --------- | --------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| reducerFn | `(newValue: Object, oldValue: Object, path: string, handlerInstance: Function) => void` | Mandatory | Reducer function that calculate new value based on all metadata and value provided. If you create new block instances in the field reducer, please put in the instance constructor `handlerInstance` as last param (to connect this block instance with block instance what is using it), and also provide `path` as well. |


**Example:**
```javascript
import getPath from 'lodash/get'
import Block, { createFieldReducer } from 'logic-block'

// the reducer that applies dependencies, which we can use in actual reducer function
const isUpgraded = (depField: string) => {
  return createFieldReducer((value, oldValue, path) => {
    if (getPath(value, depField) > getPath(oldValue, depField)) {
      return 'upgraded'
    }
    return 'downgraded'
  })
}

const block = Block({
  a: createFieldReducer((value, _, path) => {
    return getPath(value, path, getPath(oldValue, path))
  }),
  b: isUpgraded('a')
})

```

### **updateArray**
updateArray creates the update value for passing to the render method for block instance, use it if you have any kind of array in your schema. You can use it anywhere for updating block instance value (initialization, rendering call, handler)
| Argument | Type     | Optional? | Description                   |
| -------- | -------- | --------- | ----------------------------- |
| atIndex  | `number` | Mandatory | Where to put new value        |
| value    | `any`    | Mandatory | New value to put in the array |

**Example:**
```javascript
import Block, { updateArray } from 'logic-block'
import SectionBlock from './SectionBlock'

const block = Block({
  sections: [
    SectionBlock('examples'),
    SectionBlock('links'),
    SectionBlock('reminders')
  ]
})
// use for update 3-rd section with new value in initial values
const instance = block({ sections: updateArray(2, { title: 'reminder tip' }) })
// or update 2-nd section with new value in the rendering call
const result = instance({ sections: updateArray(1, { title: 'scrap booking link' } ) })
```


## List of default reducers
1. `value(defaultValue: any | (currentValue) => any)` - reducer that returns new provided value as is,
      and set the default value on initial render if initial value was not provided
1. `fields(reducerFn: Function, dependencies: Array<string>)` - reducer that gets as argument reducer fn, and list of fields which it
      passes to reducerFn.
**Example:**
```javascript
Block({
  a: value(1),
  b: fields(a => a + 1, ['a'])
})
```
3. `memo(reducerFn: Function, dependencies: Array<string>)` - the same behaviour as in `fields`, except that reducerFn, will run
    only if dependecies values were changed. And also it can put the value if you update field directly.
**Example:**
```javascript
const block = Block({
  html: value(''),
  version: value(1),
  formattedMessage: memo(html => reallyHardLogicForHandlingHTML(html), ['html'])
})

// here the formatted message will handled by reducer
block({ html: DEFAULT_HTML })
// here the formatted message will set to SOME_CUSTOM_FORMATTED_MESSAGE value
block({ formattedMessage: SOME_CUSTOM_FORMATTED_MESSAGE })
// here the formatted message won't be changed
block({ version: 22 })
```
4. `reduce(reducerFn: (value: Object, fieldValue: any) => any)` - reducer simply gets new value of block and new value of field
1. `option(defaultValue: any, options: Array<any>)` - reducer that allows as result only values at options list
**Example:**
```javascript
const block = Block({
  // initial value if not provided will be 'list'
  type: option('list', ['list', 'grid'])
})

// here the type will change on 'grid'
block({ type: 'grid' })
// here the type will stay as 'grid'
block({ type: 'unreginstered_type' })
```


## List of default handlers
1. `memoHandler(handlerFn: Function, dependencies: Array<string>)` - this handler like as memo `field` reducer, runs only if
   dependecy values were changed.

**Example**
```javascript
const block = Block({
  // initial value if not provided will be 'list'
  type: option('list', ['list', 'grid']),
  classnames: value([])
}, memoHandler(async (type, update, value, oldValue) => {
  // handler will run only if type is changed
  const classnames = await api.getClassNames(type)
  update({ classnames: merge(value.classnames, classnames) })
}, ['type']))
```


2. `onCreateHandler(handlerFn: (value, update, oldValue) => void)` - this handler run the `handlerFn` only when new instance was created

**Example:**
```javascript
const block = Block({
  // initial value if not provided will be 'list'
  type: option('list', ['list', 'grid']),
  possibleConfigs: value()
}, onCreateHandler(async (value, update) => {
  // handler will run only when new instance created
  const configs = await api.getPossibleConfigs(type)
  update({ possibleConfigs: configs })
}, ['type']))
```

3. `composeHandlers(...handlers: Array<BlockHandler | HandlerFunction>)` - use this handler for attaching multiple handlers on one block.

**Important**: *it works in the next way: when block instance renders it invokes all handlers in composed func one by one, if one handler in the chain
updates value it invokes next handler with updated value. If any of handler updated value it will invoke this all handlers one more time after all handlers run.*

**Example:**
```javascript
const block = Block({
  // ...
}, composeHandlers(
  onCreateHandler(fn0),
  memoHandler(fn1, ['a']),
  memoHandler(fn2, ['b'])
))
```

## List of block changers
Block changer is a tools which provide some operations on block factory instances. For example you can extend one block with other, you can change handler, etc.

1. `extend(...blockArgs: Array<BlockFactory | Object>) => BlockFactory` - this changer function takes
list of block factories or objects (which will be used as schemes) and create new block factory by merging schemes from right to left.
That means that more righter blocks or schemes in arguments will override scheme fields in all lefter block factory.
**IMPORTANT:** it does not apply handlers from blocks to the result block

```javascript
const newBlock = extend(Block(s1), Block(s2), Block(s3), scheme4)
```

2. `copy(block: BlockFactory) => BlockFactory` - this changer function create full copy of passing block factory, also it is copying block handler
```javascript
// newBlock will be full copy of b1
const b1 = Block(scheme)
const newBlock = copy(b1)
```

3. `inherit(parentBlock: BlockFactory | Object, extendingBlock: BlockFactory | Object, extraHandler?: BlockHandler) => BlockFactory` -
this changer function extends schemes from parentBlock to extendingBlock and combines parent's block handler with extra handler if they exists
```javascript
const CarBlock = inherit(WheelsBlock, CabinBlock, carExtraHandler)
```

4. `withHandler(block: BlockFactory | Object, handler: BlockHandler) => BlockFactory` - this changer function applies block or object and returns new block with replaced handler.
**IMPORTANT**: it does not combine handlers from original block and handler which passed as argument, it sets as handler only passed block handler.
```javascript
const block = Block({}, handler1)
// blockWithOtherHandler will have only handler2 as handler
const blockWithOtherHandler = withHandler(block, handler2)
```

## Motivation
I have created this lib for one of my projects, where the same business-logic should be using on different clients.
They had different UI, API, servers, code, platforms, but all them uses the pretty same logic for data.
And I thought about implementing business logic as separate library with minimal dependecies (the only dependency is logic-block).
So the logic-block solved my problem excellently.

Logic blocks in combination with handlers gives simple and powerful solution for writing code that should be shared between projects.

Also it gives enough level of flexability and declarativeness.

So I wanted to share it with the community.


## Author
[Ilya Melishnikov](https://www.linkedin.com/in/ilya-melishnikov/)

## LICENSE
[MIT](./LICENSE.md)

# EventStack Helper

EventStack Helper is a VSCode extension that **helps to add** eventStack tracking codes to function declarations in JavaScript, TypeScript, and Vue files.  
It helps developers track function calls by injecting `window.eventStack.set("function", "functionName")` at the beginning of function scopes.  

## Features

- Automatic EventStack Insertion: Automatically adds eventStack tracking code to newly created functions when files are saved.
- Manual EventStack Insertion: Manually adds eventStack tracking code to valid functions when using the key mapping, the command palette or the context menu.

> 📷 Demo1 - Automatically Add

![demo1](https://github.com/mochang2/eventstack-helper/blob/master/videos/automatic_addition_demo.gif)

> 📷 Demo2 - Command Palette

![demo2](https://github.com/mochang2/eventstack-helper/blob/master/videos/manual_command_palette_addition_demo.gif)

> 📷 Demo3 - Context Menu

![demo3](https://github.com/mochang2/eventstack-helper/blob/master/videos/manual_context_menu_addition_demo.gif)

## Configuration

The extension provides these VSCode settings:

- `eventstack-helper.autoAddEventStack`: Enable/disable automatic addition (default: `true`)
- `eventstack-helper.allowedFilePatterns`: File glob patterns to process (default: `**/*.js`, `**/*.ts`, `**/*.vue`)
- `eventstack-helper.eventStackFunctionName`: Custom eventStack function name (default: `window.eventStack.set`)

## Requirements

- VSCode: ^1.99.0 or higher
- Node.js: v22.15.0 or higher (for development)

## Supported Languages

- JavaScript (`.js`)
- TypeScript (`.ts`) 
- Vue (`.vue` - script sections only)

## Usage Examples

### Supported

1. Named Arrow Functions (with or without parameters, except nested objects or rest parameters)

```javascript
// automatic (o)
// manual (o)

const myFunction = (param1, param2) => {
  // eventStack code
};
```

2. Named Normal Functions (with or without parameters, except nested objects or rest parameters)

```javascript
// automatic (o)
// manual (o)

function myFunction(param1, param2) {
  // eventStack code
}
```

3. Nested Functions

```javascript
// automatic (o)
// manual (o)

function outerFunction() {
  function innerFunction() {
    // eventStack code
  }
}
```

4. Function Expressions Assigned to Variables, Regardless the Existent of the Function Name(`aa` for the below case)

```javascript
// automatic (x)
// manual (o)

const variableFunction = function aa() {
  // eventStack code
};
```

5. IIFE(Immediately Invoked Function Expressions), Only in the Case That the Function has name

```javascript
// automatic (x)
// manual (o)

(function iifeFunction() {
  // eventStack code
});
```

6. Object Method Functions

```javascript
// automatic (x)
// manual (o)

const object = {
  objectMethod1() {
    // eventStack code
  },
  objectMethod2: () => {
    // eventStack code
  },
  objectMethod3: function () {
    // eventStack code
  },
  objectMethod4: function name() {
    // eventStack code
  },
};
```

7. class Method Functions

```javascript
// automatic (x)
// manual (o)

class Class {
  classMethod1() {
    // eventStack code
  }
  classMethod2 = () => {
    // eventStack code
  }
  classMethod3 = function () {
    // eventStack code
  }
  classMethod4 = function name() {
    // eventStack code
  }
}
```

8. Returned Functions, Only in the Case That the Function has name

```javascript
// automatic (x)
// manual (o)

return function returnedFunction() {
  // eventStack code
};
```

9. New Files (Functions added to newly created files get eventStack injection)

10. Function Renaming (When a function name is changed, eventStack is added if the function doesn't already have it)

### NOT Supported

1. Variables and Non-Function Declarations

```javascript
const commonVariable = "This is var1";
const commonRef = ref(0);
```

2. Functions Without Body Blocks

```javascript
const oneLineArrowFunction = () => "aa";
const multiLineArrowFunction = () => ({
  aa: "aa",
});
```

3. One-Line Functions with Body

```javascript
function oneLineFunction() { console.log("test"); }
const oneLineArrow = () => { console.log("test"); };
```

4. Functions That Already Have EventStack

```javascript
function existingFunction() {
  window.eventStack.set("function", "existingFunction");
}
```

5. Files with Parsing Errors (Injection resumes only after parsing errors are fixed)

6. File Renaming (When files are renamed, existing function information is moved but no new eventStack is added)

## License

[MIT](https://mit-license.org/)

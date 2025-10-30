# EventStack Helper

EventStack Helper is a VSCode extension that **helps to add** eventStack tracking codes to function declarations in JavaScript, TypeScript, and Vue files.  
It helps developers track function calls by injecting `window.eventStack.set("function", "functionName")` at the beginning of function scopes.  

## Features

- Automatic EventStack Injection: Automatically adds eventStack tracking code to newly created functions when files are saved

(in the future)It will also support **the key mapping and context menu**, making it easier to manually add a eventstack set function.

> 📷 Demo1 - Automatically Add

![demo1](https://github.com/mochang2/eventstack-helper/blob/master/videos/automatic_addition_demo.gif)

> 📷 Demo2 - Key Mapping

(in the future)

> 📷 Demo3 - Context Menu

(in the future)

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
const myFunction = (param1, param2) => {
  // eventStack code automatically added
};
```

2. Named Normal Functions (with or without parameters, except nested objects or rest parameters)

```javascript
function myFunction(param1, param2) {
  // eventStack code automatically added
}
```

3. Nested Functions

```javascript
function outerFunction() {
  function innerFunction() {
    // eventStack code automatically added
  }
}
```

4. New Files (Functions added to newly created files get eventStack injection)

5. Function Renaming (When a function name is changed, eventStack is added if the function doesn't already have it)

### NOT Supported

1. Variables and Non-Function Declarations

```javascript
const commonVariable = "This is var1";
const commonRef = ref(0);
```

2. Function Expressions Assigned to Variables

```javascript
const variableFunction = function aa() {
  console.log("test");
};
```

3. Functions Without Body Blocks

```javascript
const oneLineArrowFunction = () => "aa";
const multiLineArrowFunction = () => ({
  aa: "aa",
});
```

4. One-Line Functions with Body

```javascript
function oneLineFunction() { console.log("test"); }
const oneLineArrow = () => { console.log("test"); };
```

5. Functions That Already Have EventStack

```javascript
function existingFunction() {
  window.eventStack.set("function", "existingFunction");
}
```

6. IIFE (Immediately Invoked Function Expressions)

```javascript
(function iifeFunction() {
  console.log("test");
});
```

7. Object Method Functions

```javascript
const object = {
  arrowFunction: () => {
    console.log("test");
  },
  normalFunction: function() {
    console.log("test");
  }
};
```

8. Returned Functions

```javascript
return function returnedFunction() {
  console.log("test");
};
```

9. Files with Parsing Errors (Injection resumes only after parsing errors are fixed)

10. File Renaming (When files are renamed, existing function information is moved but no new eventStack is added)

## License

[MIT](https://mit-license.org/)

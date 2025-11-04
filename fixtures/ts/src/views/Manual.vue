<template>
    <div></div>
</template>

<script setup lang="ts">
// [TEST] normally execute in vue files

// [TEST] normally execute with an arrow function with parameters except nested objects or rest parameters
const externalArrowFunctionWithParameters = (
  param1: any,
  param2: any, 
  { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }: any, 
  [arrayElement, ...restArrayElement]: any,
  ...rest: any
): void => {
  console.log("externalArrowFunctionWithParameters called");

  // [TEST] normally execute with an inner arrow function
  const innerFunction = (): void => {
    console.log("innerFunction called");
  };
};

// [TEST] normally execute with an arrow function without parameters
const externalArrowFunctionWithoutParameters = (): void => {
  console.log("externalArrowFunctionWithoutParameters called");
};

// [TEST] normally execute with a function assigned to a variable
let variableLetFunction = function (): void {
  console.log("variableLetFunction called");
};
const variableConstFunction = function name() {
  console.log("variableConstFunction called");
};

// [TEST] normally execute with a normal function with parameters except nested objects or rest parameters
function externalNormalFunctionWithParameters(
  param1: any,
  param2: any, 
  { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }: any, 
  [arrayElement, ...restArrayElement]: any,
  ...rest: any
): void {
  console.log("externalNormalFunctionWithParameters called");

  // [TEST] normally execute with an inner normal function
  function innerFunction(): void {
    console.log("innerFunction called");
  }
};

// [TEST] normally execute with a normal function without parameters
function externalNormalFunctionWithoutParameters(): void {
  console.log("externalNormalFunctionWithoutParameters called");
};

// [TEST] normally execute with an IIFE
(function iifeFunction(): void {
  console.log("iifeFunction called");
})();

// [TEST] normally execute with a function returned from a function
function returnNormalNamedFunction(): () => void {
  console.log("returnNormalNamedFunction called");

  return function returnedFunction(): void {
    console.log("returnedFunction called");
  };
};

// [TEST] normally execute with an object
const objectWithFunctions = {
  method1(): void {
    console.log("method1 called");
  },
  method2: (): void => {
    console.log("method2 called");
  },
  method3: function (): void {
    console.log("method3 called");
  },
  method4: function name(): void {
    console.log("method4 called");
  },
  nested: {
    method1(): void {
      console.log("method1 called");
    },
    method2: (): void => {
      console.log("method2 called");
    },
    method3: function (): void {
      console.log("method3 called");
    },
    method4: function name(): void {
      console.log("method4 called");
    },
  },
};

// [TEST] normally execute with a class method
class MethodClass {
  method1(): void {
    console.log("method1 called");
  }
  method2 = (): void => {
    console.log("method2 called");
  }
  method3 = function (): void {
    console.log("method3 called");
  }
  method4 = function name(): void {
    console.log("method4 called");
  }
}

/* ------------------------------------------------------------ */

// [TEST] normally not execute with a function without body
const oneLineArrowFunctionWithoutBody = (): string => "aa";
const multiLineArrowFunctionWithoutBody = (): { aa: string } => ({
  aa: "aa",
});
const multiLineNestedArrowFunctionWithoutBody = (): { aa: () => { bb: string } } => ({
  aa: () => ({
    bb: "bb",
  }),
});

// [TEST] normally not execute with a one line function with body
function oneLineNormalFunctionWithBody(): void { console.log("oneLineNormalFunctionWithBody called"); }
const oneLineArrowFunctionWithBody = (): void => { console.log("oneLineArrowFunctionWithBody called"); };

// [TEST] normally not execute with a function that already has eventstack
function functionWithEventStack1(): void {
  (window as any).eventStack.set("function", "functionWithEventStack1");
}
function functionWithEventStack2(): void {
  (window as any)?.eventStack.set("function", "functionWithEventStack2");
}
function functionWithEventStack3(): void {
  (window as any)!.eventStack.set("function", "functionWithEventStack3");
}
function functionWithEventStack4(): void {
  (window as any).eventStack?.set("function", "functionWithEventStack4");
}
function functionWithEventStack5(): void {
  (window as any).eventStack!.set("function", "functionWithEventStack5");
}
function functionWithEventStack6(): void {
  (window as any)?.eventStack!.set("function", "functionWithEventStack6");
}
function functionWithEventStack7(): void {
  (window as any)!.eventStack?.set("function", "functionWithEventStack7");
}
function functionWithEventStack8(): void {
  (window as any)?.eventStack?.set("function", "functionWithEventStack8");
}
function functionWithEventStack9(): void {
  (window as any)!.eventStack!.set("function", "functionWithEventStack9");
}

// normally not execute with an IIFE without a name
(function (): void {
  console.log("iifeFunction called");
})();
((): void => {
  console.log("iifeFunction called");
})();

// normally not execute with a function returned from a function without a name, instead execute with a returnNormalNamedFunction or returnArrowNamedFunction function
function returnNormalNoNamedFunction(): () => void {
  console.log("returnNormalNoNamedFunction called");

  return function (): void {
    console.log("returnedFunction called");
  };
}
function returnArrowNoNamedFunction(): () => void {
  console.log("returnArrowNoNamedFunction called");

  return (): void => {
    console.log("returnedFunction called");
  };
}
</script>

<style scoped>
</style>
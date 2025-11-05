// [TEST] normally execute in js files

export const useBanner = () => {
  // [TEST] normally execute with an arrow function with parameters except nested objects or rest parameters
  const externalArrowFunctionWithParameters = (
    param1,
    param2, 
    { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
    [arrayElement, ...restArrayElement],
    ...rest
  ) => {
    console.log("externalArrowFunctionWithParameters called");

    // [TEST] normally execute with an inner arrow function
    const innerFunction = () => {
      console.log("innerFunction called");
    };
  };

  // [TEST] normally execute with an arrow function without parameters
  const externalArrowFunctionWithoutParameters = () => {
    console.log("externalArrowFunctionWithoutParameters called");
  };

  // [TEST] normally execute with a function assigned to a variable
  let variableLetFunction = function () {
    console.log("variableLetFunction called");
  };
  const variableConstFunction = function name() {
    console.log("variableConstFunction called");
  };

  // [TEST] normally execute with a normal function with parameters except nested objects or rest parameters
  function externalNormalFunctionWithParameters(
    param1,
    param2, 
    { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
    [arrayElement, ...restArrayElement],
    ...rest
  ) {
    console.log("externalNormalFunctionWithParameters called");

    // [TEST] normally execute with an inner normal function
    function innerFunction() {
      console.log("innerFunction called");
    }
  }

  // [TEST] normally execute with a normal function without parameters
  function externalNormalFunctionWithoutParameters() {
    console.log("externalNormalFunctionWithoutParameters called");
  }

  // [TEST] normally execute with an IIFE
  (function iifeFunction() {
    console.log("iifeFunction called");
  })();

  // [TEST] normally execute with a function returned from a function
  function returnNormalNamedFunction() {
    console.log("returnNormalNamedFunction called");

    return function returnedFunction() {
      console.log("returnedFunction called");
    };
  }

  // [TEST] normally execute with an object
  const objectWithFunctions = {
    objectMethod1() {
      console.log("objectMethod1 called");
    },
    objectMethod2: () => {
      console.log("objectMethod2 called");
    },
    objectMethod3: function () {
      console.log("objectMethod3 called");
    },
    objectMethod4: function name() {
      console.log("objectMethod4 called");
    },
  };

  // [TEST] normally execute with a class method
  class MethodClass {
    classMethod1() {
      console.log("classMethod1 called");
    }
    classMethod2 = () => {
      console.log("classMethod2 called");
    };
    classMethod3 = function () {
      console.log("classMethod3 called");
    };
    classMethod4 = function name() {
      console.log("classMethod4 called");
    };
  }

  /* ------------------------------------------------------------ */

  // [TEST] normally not execute with a function without body, instead execute with a useBanner function
  const oneLineArrowFunctionWithoutBody = () => "aa";
  const multiLineArrowFunctionWithoutBody = () => ({
    aa: "aa",
  });
  const multiLineNestedArrowFunctionWithoutBody = () => ({
    aa: () => ({
      bb: "bb",
    })
  });

  // [TEST] normally not execute with a one line function with body, instead execute with a useBanner function
  function oneLineNormalFunctionWithBody() { console.log("oneLineNormalFunctionWithBody called"); }
  const oneLineArrowFunctionWithBody = () => { console.log("oneLineArrowFunctionWithBody called"); };

  // [TEST] normally not execute with a function that already has eventstack
  function functionWithEventStack1() {
    window.eventStack.set("function", "functionWithEventStack1");
  }
  function functionWithEventStack2() {
    window?.eventStack.set("function", "functionWithEventStack2");
  }
  function functionWithEventStack3() {
    window.eventStack?.set("function", "functionWithEventStack3");
  }
  function functionWithEventStack4() {
    window?.eventStack?.set("function", "functionWithEventStack4");
  }

  // normally not execute with an IIFE without a name, instead execute with a useBanner function
  (function () {
    console.log("iifeFunction called");
  })();
  (() => {
    console.log("iifeFunction called");
  })();

  // normally not execute with a function returned from a function without a name, instead execute with a returnNormalNoNamedFunction or returnArrowNoNamedFunction function
  function returnNormalNoNamedFunction() {
    console.log("returnNormalNoNamedFunction called");

    return function () {
      console.log("returnedFunction called");
    };
  }
  function returnArrowNoNamedFunction() {
    console.log("returnArrowNoNamedFunction called");

    return () => {
      console.log("returnedFunction called");
    };
  }
};

// [TEST] normally execute in js files

import { ref, computed } from "vue";

export const useBanner = () => {
  // [TEST] normally execute with an arrow function with parameters except nested objects or rest parameters
  // const externalArrowFunctionWithParameters = (
  //   param1,
  //   param2, 
  //   { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
  //   [arrayElement, ...restArrayElement],
  //   ...rest
  // ) => {
  //   console.log("externalArrowFunction called");

  //   // [TEST] normally execute with an inner arrow function
  //   const innerFunction = () => {
  //     console.log("innerFunction called");
  //   };
  // };

  // [TEST] normally execute with an arrow function without parameters
  // const externalArrowFunctionWithoutParameters = () => {
  //   console.log("externalArrowFunctionWithoutParameters called");
  // };

  // [TEST] normally execute with a normal function with parameters except nested objects or rest parameters
  // function externalNormalFunctionWithParameters(
  //   param1,
  //   param2, 
  //   { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
  //   [arrayElement, ...restArrayElement],
  //   ...rest
  // ) {
  //   console.log("normalFunction called");

  //   // [TEST] normally execute with an inner normal function
  //   function innerFunction() {
  //     console.log("innerFunction called");
  //   }
  // };

  // [TEST] normally execute with a normal function without parameters
  // function externalNormalFunctionWithoutParameters() {
  //   console.log("normalFunction called");
  // };

  /* ------------------------------------------------------------ */
    
  // [TEST] normally not execute with a variable
  // const commonVariable = "This is var1";

  // [TEST] normally not execute with a common ref variable
  // const commonRef = ref(0);

  // [TEST] normally not execute with a function assigned to a variable
  // const variableFunction = function aa() {
  //   console.log("variableFunction called");
  // };

  // [TEST] normally not execute with a computed property
  // const computedValue = computed(() => {
  //   return 1;
  // });

  // [TEST] normally not execute with a function without body
  // const oneLineArrowFunctionWithoutBody = () => "aa";
  // const multiLineArrowFunctionWithoutBody = () => ({
  //   aa: "aa",
  // })
  // const multiLineNestedArrowFunctionWithoutBody = () => ({
  //   aa: () => ({
  //     bb: "bb",
  //   })
  // })

  // [TEST] normally not execute with a one line function with body
  // function oneLineNormalFunctionWithBody() { console.log("oneLineNormalFunctionWithBody called"); }
  // const oneLineArrowFunctionWithBody = () => { console.log("oneLineArrowFunctionWithBody called"); };

  // [TEST] normally not execute with a function that already has eventstack
  // function functionWithEventStack1() {
  //   window.eventStack.set("function", "functionWithEventStack1");
  // };
  // function functionWithEventStack2() {
  //   window?.eventStack.set("function", "functionWithEventStack2");
  // };
  // function functionWithEventStack3() {
  //   window.eventStack?.set("function", "functionWithEventStack3");
  // };
  // function functionWithEventStack4() {
  //   window?.eventStack?.set("function", "functionWithEventStack4");
  // };

  // [TEST] normally not execute with an IIFE even though it has a name and a body
  // (function iifeFunction() {
  //   console.log("iifeFunction called");
  // })();

  // [TEST] normally not execute with an object
  // const object = {
  //   arrowFunction: () => {
  //     console.log("arrowFunction called");
  //   },
  //   normalFunction: () => {
  //     console.log("normalFunction called");
  //   },
  //   nested: {
  //     arrowFunction: () => {
  //       console.log("nested.arrowFunction called");
  //     },
  //     normalFunction: () => {
  //       console.log("nested.normalFunction called");
  //     },
  //   },
  // };

  // [TEST] normally not execute with a function returned from a function
  // return function returnedFunction() {

  // };
};

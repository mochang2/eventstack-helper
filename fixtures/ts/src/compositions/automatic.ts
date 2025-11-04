// [TEST] normally execute in ts files

import { ref, computed } from "vue";

export const useBanner = () => {
  // [TEST] normally execute with an arrow function with parameters except nested objects or rest parameters
  // const externalArrowFunctionWithParameters = (
  //   param1: any,
  //   param2: any, 
  //   { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }: any, 
  //   [arrayElement, ...restArrayElement]: any,
  //   ...rest: any
  // ) => {
  //   console.log("externalArrowFunctionWithParameters called");

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
  //   param1: any,
  //   param2: any, 
  //   { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }: any, 
  //   [arrayElement, ...restArrayElement]: any,
  //   ...rest: any
  // ) {
  //   console.log("externalNormalFunctionWithParameters called");

  //   // [TEST] normally execute with an inner normal function
  //   function innerFunction() {
  //     console.log("innerFunction called");
  //   }
  // }

  // [TEST] normally execute with a normal function without parameters
  // function externalNormalFunctionWithoutParameters() {
  //   console.log("externalNormalFunctionWithoutParameters called");
  // }

  /* ------------------------------------------------------------ */

  // [TEST] normally not execute with a variable because it's not a function
  // const commonVariable: string = "This is var1";

  // [TEST] normally not execute with a common ref variable because it's not a function
  // const commonRef = ref<number>(0);

  // [TEST] normally not execute with a function assigned to a variable
  // const variableFunction = function aa(): void {
  //   console.log("variableFunction called");
  // };

  // [TEST] normally not execute with a computed property because it's not a function
  // const computedValue = computed<number>(() => {
  //   return 1;
  // });

  // [TEST] normally not execute with a function without body because it does not have a body
  // const oneLineArrowFunctionWithoutBody = () => "aa";
  // const multiLineArrowFunctionWithoutBody = () => ({
  //   aa: "aa",
  // })
  // const multiLineNestedArrowFunctionWithoutBody = () => ({
  //   aa: () => ({
  //     bb: "bb",
  //   })
  // })  

  // [TEST] normally not execute with a one line function with body because it does not need eventstack
  // function oneLineNormalFunctionWithBody() { console.log("oneLineNormalFunctionWithBody called"); }
  // const oneLineArrowFunctionWithBody = () => { console.log("oneLineArrowFunctionWithBody called"); };

  // [TEST] normally not execute with a function that already has eventstack
  // function functionWithEventStack1() {
  //   (window as any).eventStack.set("function", "functionWithEventStack1");
  // }
  // function functionWithEventStack2() {
  //   (window as any)?.eventStack.set("function", "functionWithEventStack2");
  // }
  // function functionWithEventStack3() {
  //   (window as any)!.eventStack.set("function", "functionWithEventStack3");
  // }
  // function functionWithEventStack4() {
  //   (window as any).eventStack?.set("function", "functionWithEventStack4");
  // }
  // function functionWithEventStack5() {
  //   (window as any).eventStack!.set("function", "functionWithEventStack5");
  // }
  // function functionWithEventStack6() {
  //   (window as any)?.eventStack!.set("function", "functionWithEventStack6");
  // }
  // function functionWithEventStack7() {
  //   (window as any)!.eventStack?.set("function", "functionWithEventStack7");
  // }
  // function functionWithEventStack8() {
  //   (window as any)?.eventStack?.set("function", "functionWithEventStack8");
  // }
  // function functionWithEventStack9() {
  //   (window as any)!.eventStack!.set("function", "functionWithEventStack9");
  // }

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
  //   console.log("returnedFunction called");
  // }
};

import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import {
  waitForLoadingExtension,
  sleep,
  insert,
  remove,
  createDocument,
  deleteDocument,
  renameDocument,
  mockEventStackConfig,
} from "./utils.test";

suite("js basic", () => {
  let workspaceRoot: string = "";
  let restore = (): void => {};

  suiteSetup(() => {
      workspaceRoot = path.resolve(__dirname, "../../fixtures/js");
      const { restore: restoreMock } = mockEventStackConfig({
        autoAddEventStack: true,
        allowedFilePatterns: ["**/*.js", "**/*.ts", "**/*.vue"],
        eventStackFunctionName: "window.eventStack.set"
      });
      restore = restoreMock;
  });

  suiteTeardown(() => {
      restore();
  });

    suite("Automatic.vue", () => {
        test("Adding a new named arrow function with parameters automatically inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Automatic.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(8, 0);
            const functionCode = `
const externalArrowFunctionWithParameters = (
  param1,
  param2, 
  { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
  [arrayElement, ...restArrayElement],
  ...rest
) => {
  console.log("externalArrowFunctionWithParameters called");
};
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `
const externalArrowFunctionWithParameters = (
  param1,
  param2, 
  { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
  [arrayElement, ...restArrayElement],
  ...rest
) => {
  window.eventStack.set("function", "externalArrowFunctionWithParameters(Automatic.vue)", param1, param2, object, differentNameKey, arrayElement);
  console.log("externalArrowFunctionWithParameters called");
};
`
            ;
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Adding a new named arrow function which is declared in another arrow function automatically inserts event stack", async () => {
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Automatic.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(8, 0);
            const functionCode = `
const externalArrowFunctionWithParameters = (
  param1,
  param2, 
  { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
  [arrayElement, ...restArrayElement],
  ...rest
) => {
  console.log("externalArrowFunctionWithParameters called");

  const innerFunction = () => {
    console.log("innerFunction called");
  };
};
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `
const externalArrowFunctionWithParameters = (
  param1,
  param2, 
  { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
  [arrayElement, ...restArrayElement],
  ...rest
) => {
  window.eventStack.set("function", "externalArrowFunctionWithParameters(Automatic.vue)", param1, param2, object, differentNameKey, arrayElement);
  console.log("externalArrowFunctionWithParameters called");

  const innerFunction = () => {
    window.eventStack.set("function", "innerFunction(Automatic.vue)");
    console.log("innerFunction called");
  };
};
`
            ;
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Adding a new named arrow function without parameters automatically inserts event stack", async () => {
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Automatic.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(8, 0);
            const functionCode = `
const externalArrowFunctionWithoutParameters = () => {
  console.log("externalArrowFunctionWithoutParameters called");
};
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `
const externalArrowFunctionWithoutParameters = () => {
  window.eventStack.set("function", "externalArrowFunctionWithoutParameters(Automatic.vue)");
  console.log("externalArrowFunctionWithoutParameters called");
};
`
            ;
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Adding a new named normal function with parameters automatically inserts event stack", async () => {
            await waitForLoadingExtension();
            
            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Automatic.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(8, 0);
            const functionCode = `
function externalNormalFunctionWithParameters(
  param1,
  param2, 
  { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
  [arrayElement, ...restArrayElement],
  ...rest
) {
  console.log("externalNormalFunctionWithParameters called");
};
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `
function externalNormalFunctionWithParameters(
  param1,
  param2, 
  { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
  [arrayElement, ...restArrayElement],
  ...rest
) {
  window.eventStack.set("function", "externalNormalFunctionWithParameters(Automatic.vue)", param1, param2, object, differentNameKey, arrayElement);
  console.log("externalNormalFunctionWithParameters called");
};
`
            ;
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Adding a new named normal function which is declared in another normal function automatically inserts event stack", async () => {
            await waitForLoadingExtension();
            
            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Automatic.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(8, 0);
            const functionCode = `
function externalNormalFunctionWithParameters(
  param1,
  param2, 
  { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
  [arrayElement, ...restArrayElement],
  ...rest
) {
  console.log("externalNormalFunctionWithParameters called");

  function innerFunction() {
    console.log("innerFunction called");
  };
};
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `
function externalNormalFunctionWithParameters(
  param1,
  param2, 
  { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
  [arrayElement, ...restArrayElement],
  ...rest
) {
  window.eventStack.set("function", "externalNormalFunctionWithParameters(Automatic.vue)", param1, param2, object, differentNameKey, arrayElement);
  console.log("externalNormalFunctionWithParameters called");

  function innerFunction() {
    window.eventStack.set("function", "innerFunction(Automatic.vue)");
    console.log("innerFunction called");
  };
};
`           ;
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Adding a new named normal function without parameters automatically inserts event stack", async () => {
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Automatic.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(8, 0);
            const functionCode = `
function externalNormalFunctionWithoutParameters() {
  console.log("externalNormalFunctionWithoutParameters called");
};
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `
function externalNormalFunctionWithoutParameters() {
  window.eventStack.set("function", "externalNormalFunctionWithoutParameters(Automatic.vue)");
  console.log("externalNormalFunctionWithoutParameters called");
};
`
            ;
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Adding a new variable does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Automatic.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(8, 0);
            const functionCode = `
const commonVariable = "This is var1";
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const notExpectedCode = `window.eventStack.set("function", "commonVariable(Automatic.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });

        test("Adding a new ref variable does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Automatic.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(8, 0);
            const functionCode = `
const commonRef = ref(0);
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const notExpectedCode = `window.eventStack.set("function", "commonRef(Automatic.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });

        test("Adding a new function assigned to a variable does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Automatic.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(8, 0);
            const functionCode = `
const variableFunction = function aa() {
  console.log("variableFunction called");
};
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const notExpectedCode = `window.eventStack.set("function", "variableFunction(Automatic.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });

        test("Adding a new computed property does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Automatic.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(8, 0);
            const functionCode = `
const computedValue = computed(() => {
  return 1;
});
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const notExpectedCode = `window.eventStack.set("function", "computedValue(Automatic.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });

        test("Adding a new function without body does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Automatic.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(8, 0);
            let functionCode = `
const oneLineArrowFunctionWithoutBody = () => "aa";
`
            ;
            
            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let notExpectedCode = `window.eventStack.set("function", "oneLineArrowFunctionWithoutBody(Automatic.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();

            // next test
            functionCode = `
const multiLineArrowFunctionWithoutBody = () => ({
  aa: "aa",
});
`
            ;
            
            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "multiLineArrowFunctionWithoutBody(Automatic.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();

            // next test
            functionCode = `
const multiLineNestedArrowFunctionWithoutBody = () => ({
  aa: () => ({
    bb: "bb",
  })
});
`
            ;
            
            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "multiLineNestedArrowFunctionWithoutBody(Automatic.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });

        test("Adding a new one line function with body does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Automatic.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(8, 0);
            let functionCode = `
function oneLineNormalFunctionWithBody() { console.log("oneLineNormalFunctionWithBody called"); }
`
            ;
            
            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let notExpectedCode = `window.eventStack.set("function", "oneLineNormalFunctionWithBody(Automatic.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();

            // next test
            functionCode = `
const oneLineArrowFunctionWithBody = () => { console.log("oneLineArrowFunctionWithBody called"); };
`
            ;
            
            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "oneLineArrowFunctionWithBody(Automatic.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });

        test("Adding a new function that already has event stack does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Automatic.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(8, 0);
            let functionCode = `
function functionWithEventStack1() {
  window.eventStack.set("function", "functionWithEventStack1");
};
`
            ;
            
            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let notExpectedCode = `window.eventStack.set("function", "functionWithEventStack1(Automatic.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();

            // next test
            functionCode = `
function functionWithEventStack2() {
  window?.eventStack.set("function", "functionWithEventStack2");
};
`
            ;
            
            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack2(Automatic.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();

            // next test
            functionCode = `
function functionWithEventStack3() {
  window.eventStack?.set("function", "functionWithEventStack3");
};
`
            ;
            
            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack3(Automatic.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();

            // next test
            functionCode = `
function functionWithEventStack4() {
  window?.eventStack?.set("function", "functionWithEventStack4");
};
`
            ;
            
            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack4(Automatic.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });

        test("Adding a new IIFE does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Automatic.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(8, 0);
            const functionCode = `
(function iifeFunction() {
  console.log("iifeFunction called");
});
`;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const notExpectedCode = `window.eventStack.set("function", "iifeFunction(Automatic.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });

        test("Adding a new object does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Automatic.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(8, 0);
            const functionCode = `
const object = {
  arrowFunction: () => {
    console.log("arrowFunction called");
  },
  normalFunction: () => {
    console.log("normalFunction called");
  },
  nested: {
    arrowFunction: () => {
      console.log("nested.arrowFunction called");
    },
    normalFunction: () => {
      console.log("nested.normalFunction called");
    },
  },
};
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let notExpectedCode = `window.eventStack.set("function", "arrowFunction(Automatic.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );
            notExpectedCode = `window.eventStack.set("function", "normalFunction(Automatic.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );
            notExpectedCode = `window.eventStack.set("function", "nested.arrowFunction(Automatic.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );
            notExpectedCode = `window.eventStack.set("function", "nested.normalFunction(Automatic.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });
    });

    suite("automatic.js", () => {
        test("Adding a new named arrow function with parameters automatically inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/automatic.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(5, 0);
            const functionCode = `
  const externalArrowFunctionWithParameters = (
    param1,
    param2, 
    { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
    [arrayElement, ...restArrayElement],
    ...rest
  ) => {
    console.log("externalArrowFunctionWithParameters called");
  };
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `
  const externalArrowFunctionWithParameters = (
    param1,
    param2, 
    { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
    [arrayElement, ...restArrayElement],
    ...rest
  ) => {
    window.eventStack.set("function", "externalArrowFunctionWithParameters(automatic.js)", param1, param2, object, differentNameKey, arrayElement);
    console.log("externalArrowFunctionWithParameters called");
  };
`
            ;
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );
            
            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Adding a new named arrow function which is declared in another arrow function automatically inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/automatic.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(5, 0);
            const functionCode = `
  const externalArrowFunctionWithParameters = (
    param1,
    param2, 
    { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
    [arrayElement, ...restArrayElement],
    ...rest
  ) => {
    console.log("externalArrowFunctionWithParameters called");

    const innerFunction = () => {
      console.log("innerFunction called");
    };
  };
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `
  const externalArrowFunctionWithParameters = (
    param1,
    param2, 
    { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
    [arrayElement, ...restArrayElement],
    ...rest
  ) => {
    window.eventStack.set("function", "externalArrowFunctionWithParameters(automatic.js)", param1, param2, object, differentNameKey, arrayElement);
    console.log("externalArrowFunctionWithParameters called");

    const innerFunction = () => {
      window.eventStack.set("function", "innerFunction(automatic.js)");
      console.log("innerFunction called");
    };
  };
`
            ;
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );
            
            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Adding a new named arrow function without parameters automatically inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/automatic.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(5, 0);
            const functionCode = `
  const externalArrowFunctionWithoutParameters = () => {
    console.log("externalArrowFunctionWithoutParameters called");
  };
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `
  const externalArrowFunctionWithoutParameters = () => {
    window.eventStack.set("function", "externalArrowFunctionWithoutParameters(automatic.js)");
    console.log("externalArrowFunctionWithoutParameters called");
  };
`
            ;
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );
            
            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Adding a new named normal function with parameters automatically inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/automatic.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);
            
            const emptyPosition = new vscode.Position(5, 0);
            const functionCode = `
  function externalNormalFunctionWithParameters(
    param1,
    param2, 
    { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
    [arrayElement, ...restArrayElement],
    ...rest
  ) {
    console.log("externalNormalFunctionWithParameters called");
  };
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process
            
            // then
            const expectedCode = `
  function externalNormalFunctionWithParameters(
    param1,
    param2, 
    { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
    [arrayElement, ...restArrayElement],
    ...rest
  ) {
    window.eventStack.set("function", "externalNormalFunctionWithParameters(automatic.js)", param1, param2, object, differentNameKey, arrayElement);
    console.log("externalNormalFunctionWithParameters called");
  };
`
            ;
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );
            
            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Adding a new named normal function which is declared in another normal function automatically inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/automatic.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);
            
            const emptyPosition = new vscode.Position(5, 0);
            const functionCode = `
  function externalNormalFunctionWithParameters(
    param1,
    param2, 
    { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject },
    [arrayElement, ...restArrayElement],
    ...rest
  ) {
    console.log("externalNormalFunctionWithParameters called");

    function innerFunction() {
      console.log("innerFunction called");
    }
  };
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `
  function externalNormalFunctionWithParameters(
    param1,
    param2, 
    { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject },
    [arrayElement, ...restArrayElement],
    ...rest
  ) {
    window.eventStack.set("function", "externalNormalFunctionWithParameters(automatic.js)", param1, param2, object, differentNameKey, arrayElement);
    console.log("externalNormalFunctionWithParameters called");

    function innerFunction() {
      window.eventStack.set("function", "innerFunction(automatic.js)");
      console.log("innerFunction called");
    }
  };
`
            ;
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );
            
            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Adding a new named normal function without parameters automatically inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/automatic.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(5, 0);
            const functionCode = `
  function externalNormalFunctionWithoutParameters() {
    console.log("externalNormalFunctionWithoutParameters called");
  };
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `
  function externalNormalFunctionWithoutParameters() {
    window.eventStack.set("function", "externalNormalFunctionWithoutParameters(automatic.js)");
    console.log("externalNormalFunctionWithoutParameters called");
  };
`
            ;
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );
            
            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Adding a new variable does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/automatic.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);
            
            const emptyPosition = new vscode.Position(5, 0);
            const functionCode = `
  const commonVariable = "This is var1";
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const notExpectedCode = `window.eventStack.set("function", "commonVariable(automatic.js)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });

        test("Adding a new ref variable does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/automatic.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(5, 0);
            const functionCode = `
  const commonRef = ref(0);
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const notExpectedCode = `window.eventStack.set("window", "commonRef(automatic.js)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });

        test("Adding a new function assigned to a variable does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/automatic.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(5, 0);
            const functionCode = `
  const variableFunction = function aa() {
    console.log("variableFunction called");
  };
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const notExpectedCode = `window.eventStack.set("function", "variableFunction(automatic.js)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });

        test("Adding a new computed property does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/automatic.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(5, 0);
            const functionCode = `
  const computedValue = computed(() => {
    return 1;
  });
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const notExpectedCode = `window.eventStack.set("function", "computedValue(automatic.js)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });

        test("Adding a new function without body does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/automatic.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(5, 0);
            let functionCode = `
  const oneLineArrowFunctionWithoutBody = () => "aa";
`
            ;
            
            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let notExpectedCode = `window.eventStack.set("function", "oneLineArrowFunctionWithoutBody(automatic.js)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();

            // next test
            functionCode = `
  const multiLineArrowFunctionWithoutBody = () => ({
    aa: "aa",
  });
`
            ;
            
            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "multiLineArrowFunctionWithoutBody(automatic.js)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();

            // next test
            functionCode = `
  const multiLineNestedArrowFunctionWithoutBody = () => ({
    aa: () => ({
      bb: "bb",
    })
  });
`
            ;
            
            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process
            
            // then
            notExpectedCode = `window.eventStack.set("function", "multiLineNestedArrowFunctionWithoutBody(automatic.js)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });

        test("Adding a new one line function with body does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/automatic.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);
            
            const emptyPosition = new vscode.Position(5, 0);
            let functionCode = `
  function oneLineNormalFunctionWithBody() { console.log("oneLineNormalFunctionWithBody called"); }
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process
            
            // then
            let notExpectedCode = `window.eventStack.set("function", "oneLineNormalFunctionWithBody(automatic.js)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();

            // next test
            functionCode = `
  const oneLineArrowFunctionWithBody = () => { console.log("oneLineArrowFunctionWithBody called"); };
`
            ;
            
            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "oneLineArrowFunctionWithBody(automatic.js)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });

        test("Adding a new function that already has event stack does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/automatic.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(5, 0);
            let functionCode = `
  function functionWithEventStack1() {
    window.eventStack.set("function", "functionWithEventStack1");
  };
`
            ;
            
            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let notExpectedCode = `window.eventStack.set("function", "functionWithEventStack1(automatic.js)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();

            // next test
            functionCode = `
  function functionWithEventStack2() {
    window?.eventStack.set("function", "functionWithEventStack2");
  };
`
            ;
            
            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process
            
            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack2(automatic.js)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();

            // next test
            functionCode = `
  function functionWithEventStack3() {
    window.eventStack?.set("function", "functionWithEventStack3");
  };
`
            ;
            
            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process
            
            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack3(automatic.js)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();

            // next test
            functionCode = `
  function functionWithEventStack4() {
    window?.eventStack?.set("function", "functionWithEventStack4");
  };
`
            ;
            
            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack4(automatic.js)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });

        test("Adding a new IIFE does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/automatic.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(5, 0);
            const functionCode = `
  (function iifeFunction() {
    console.log("iifeFunction called");
  });
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const notExpectedCode = `window.eventStack.set("function", "iifeFunction(automatic.js)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });

        test("Adding a new object does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/automatic.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(5, 0);
            const functionCode = `
  const object = {
    arrowFunction: () => {
      console.log("arrowFunction called");
    },
    normalFunction: () => {
      console.log("normalFunction called");
    },
    nested: {
      arrowFunction: () => {
        console.log("nested.arrowFunction called");
      },
      normalFunction: () => {
        console.log("nested.normalFunction called");
      },
    },
  };
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let notExpectedCode = `window.eventStack.set("function", "arrowFunction(automatic.js)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );
            notExpectedCode = `window.eventStack.set("function", "normalFunction(automatic.js)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );
            notExpectedCode = `window.eventStack.set("function", "nested.arrowFunction(automatic.js)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );
            notExpectedCode = `window.eventStack.set("function", "nested.normalFunction(automatic.js)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });

        test("Adding a new function returned from a function does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/automatic.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(5, 0);
            const functionCode = `
  return function returnedFunction() {
    console.log("returnedFunction called");
  };
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const notExpectedCode = `window.eventStack.set("function", "returnedFunction(automatic.js)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });

        // not described in the fixtures
        test("When changing the name of the function, it should be inserted if there is no event stack", async () => {
            // given
            await waitForLoadingExtension();

            const oldFunctionName = "useBanner";
            const newFunctionName = "useBanner2";

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/automatic.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const originalText = document.getText();

            // when
            {
                const edit = new vscode.WorkspaceEdit();
                edit.replace(
                    fileUri,
                    new vscode.Range(
                        document.positionAt(0),
                        document.positionAt(document.getText().length)
                    ),
                    originalText.replace(oldFunctionName, newFunctionName)
                );
                await vscode.workspace.applyEdit(edit);
            }
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `
  window.eventStack.set("function", "useBanner2(automatic.js)");
`
            ;
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );
            
            // clean up
            {
                const edit = new vscode.WorkspaceEdit();
                edit.replace(
                    fileUri,
                    new vscode.Range(
                        document.positionAt(0),
                        document.positionAt(document.getText().length)
                    ),
                    originalText
                );
                await vscode.workspace.applyEdit(edit);
            }
            await document.save(); // eventStack re-add
            await sleep(200); // wait for extension to process

            {
                const edit = new vscode.WorkspaceEdit();
                edit.replace(
                    fileUri,
                    new vscode.Range(
                        document.positionAt(0),
                        document.positionAt(document.getText().length)
                    ),
                    originalText
                );
                await vscode.workspace.applyEdit(edit);
            }
            await document.save();
        });
    });

    suite("Error.vue", () => {
        test("Adding a new function in a file with parsing errors inside the script tag does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/utils/Error.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(10, 0);
            const functionCode = `
function newFunction() {
  console.log("newFunction called");
}
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const notExpectedCode = `window.eventStack.set("function", "newFunction(Error.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });

        test("Adding a new function in a file with parsing errors at the time when the parsing errors are fixed does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/utils/Error.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);
            const originalText = document.getText();

            const deleteCode = `
const aa "fdf";
`
            ;
            const functionCode = `
function newFunction() {
  console.log("newFunction called");
}
`
            ;
            
            // when
            {
                const edit = new vscode.WorkspaceEdit();
                edit.replace(
                  fileUri,
                  new vscode.Range(
                    document.positionAt(document.getText().indexOf(deleteCode)),
                    document.positionAt(document.getText().indexOf(deleteCode) + deleteCode.length)
                  ),
                  functionCode,
                );
                await vscode.workspace.applyEdit(edit);
            }
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const notExpectedCode = `window.eventStack.set("function", "newFunction(Error.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            {
                const edit = new vscode.WorkspaceEdit();
                edit.replace(
                  fileUri,
                  new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(document.getText().length)
                  ),
                  originalText,
                );
                await vscode.workspace.applyEdit(edit);
            }
            await document.save();
        });

        test("Adding a new function in a file with parsing errors after the parsing errors are fixed automatically inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/utils/Error.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);
            const originalText = document.getText();

            // when
            const deleteCode = `
const aa "fdf";
`
            ;
            await remove(fileUri, document, deleteCode);
            await document.save();
            await sleep(200); // wait for extension to process

            const emptyPosition = new vscode.Position(10, 0);
            const functionCode = `
function newFunction() {
  console.log("newFunction called");
}
`
            ;
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `
function newFunction() {
  window.eventStack.set("function", "newFunction(Error.vue)");
  console.log("newFunction called");
}
`
            ;
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            const edit = new vscode.WorkspaceEdit();
            edit.replace(
                fileUri,
                new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(document.getText().length)
                ),
                originalText
            );
            await vscode.workspace.applyEdit(edit);
            await document.save();
        });

        test("Adding a new function in a file with parsing errors inside the template tag automatically inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/utils/Error.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);
            const originalText = document.getText();
            
            const deleteCode = `
const aa "fdf";
`
            ;
            
            await remove(fileUri, document, deleteCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // when
            const errorCode = `
    <
`
            ;
            await insert(fileUri, new vscode.Position(2, 0), errorCode);

            const functionCode = `
function newFunction() {
  console.log("newFunction called");
}
`
            ;
            await insert(fileUri, new vscode.Position(10, 0), functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `
function newFunction() {
  window.eventStack.set("function", "newFunction(Error.vue)");
  console.log("newFunction called");
}
`
            ;
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            const edit = new vscode.WorkspaceEdit();
            edit.replace(
                fileUri,
                new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(document.getText().length)
                ),
                originalText
            );
            await vscode.workspace.applyEdit(edit);
            await document.save();
        });
    });

    suite("error.js", () => {
        test("Adding a new function in a file with parsing errors does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/utils/error.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(3, 0);
            const functionCode = `
function newFunction() {
  console.log("newFunction called");
}
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const notExpectedCode = `window.eventStack.set("function", "newFunction(error.js)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });

        test("Adding a new function in a file with parsing errors at the time when the parsing errors are fixed does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/utils/error.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);
            const originalText = document.getText();

            const deleteCode = `
const aa "fdf";
`
            ;
            const functionCode = `
function newFunction() {
  console.log("newFunction called");
}
`
            ;
            // when
            {
                const edit = new vscode.WorkspaceEdit();
                edit.replace(
                  fileUri,
                  new vscode.Range(
                    document.positionAt(document.getText().indexOf(deleteCode)),
                    document.positionAt(document.getText().indexOf(deleteCode) + deleteCode.length)
                  ),
                  functionCode,
                );
                await vscode.workspace.applyEdit(edit);
            }
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const notExpectedCode = `window.eventStack.set("function", "newFunction(error.js)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            {
                const edit = new vscode.WorkspaceEdit();
                edit.replace(
                  fileUri,
                  new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(document.getText().length)
                  ),
                  originalText,
                );
                await vscode.workspace.applyEdit(edit);
            }
            await document.save();
        });

        test("Adding a new function in a file with parsing errors after the parsing errors are fixed automatically inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/utils/error.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);
            const originalText = document.getText();

            // when
            const deleteCode = `
const aa "fdf";
`
            ;
            await remove(fileUri, document, deleteCode);
            await document.save();
            await sleep(200); // wait for extension to process

            const emptyPosition = new vscode.Position(3, 0);
            const functionCode = `
function newFunction() {
  console.log("newFunction called");
}
`
            ;
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `
function newFunction() {
  window.eventStack.set("function", "newFunction(error.js)");
  console.log("newFunction called");
}
`
            ;
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            const edit = new vscode.WorkspaceEdit();
            edit.replace(
                fileUri,
                new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(document.getText().length)
                ),
                originalText,
            );
            await vscode.workspace.applyEdit(edit);
            await document.save();
        });
    });

    suite("New.vue", () => {
        // not described in the fixtures
        test("Adding a new function in a new file automatically inserts event stack", async () => {
            await waitForLoadingExtension();

            const fileUri = await createDocument(path.join(workspaceRoot, "src/views/New.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(0, 0);
            const functionCode = `
<template>
    <div></div>
</template>

<script setup>
function newFunction() {
  console.log("newFunction called");
}
</script>
`
            ;
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `
function newFunction() {
  window.eventStack.set("function", "newFunction(New.vue)");
  console.log("newFunction called");
}
`
            ;
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await deleteDocument(fileUri);
            await sleep(200); // wait for document to be deleted
        });

        // not described in the fixtures
        test("When renaming a file, the function information from the previous file is moved to the new file, that is, it does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = await createDocument(path.join(workspaceRoot, "src/views/New2.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(0, 0);
            const functionCode = `
<template>
    <div></div>
</template>

<script setup>
function newFunction() {
  console.log("newFunction called");
}
</script>
`
            ;
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            const deleteCode = `window.eventStack.set("function", "newFunction(New2.vue)");`;
            await remove(fileUri, document, deleteCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // when
            const newFileUri = await renameDocument(path.join(workspaceRoot, "src/views/New2.vue"), path.join(workspaceRoot, "src/views/New3.vue"));
            const newDocument = await vscode.workspace.openTextDocument(newFileUri);

            // then
            const notExpectedCode = `window.eventStack.set("function", "newFunction(New3.vue)")`;
            assert.ok(
                !newDocument.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await deleteDocument(newFileUri);
            await sleep(200); // wait for document to be deleted
        });
    });

    suite("new.js", () => {
        // not described in the fixtures
        test("Adding a new function in a new file automatically inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = await createDocument(path.join(workspaceRoot, "src/compositions/new.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(0, 0);
            const functionCode = `
function newFunction() {
  console.log("newFunction called");
}
`
            ;
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `
function newFunction() {
  window.eventStack.set("function", "newFunction(new.js)");
  console.log("newFunction called");
}
`
            ;
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await deleteDocument(fileUri);
            await sleep(200); // wait for document to be deleted
        });

        // not described in the fixtures
        test("When renaming a file, the function information from the previous file is moved to the new file, that is, it does not automatically insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = await createDocument(path.join(workspaceRoot, "src/compositions/new2.js"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(0, 0);
            const functionCode = `
function newFunction() {
  console.log("newFunction called");
}
`
            ;
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();
            await sleep(200); // wait for extension to process

            const deleteCode = `window.eventStack.set("function", "newFunction(new2.js)");`;
            await remove(fileUri, document, deleteCode);
            await document.save();
            await sleep(200); // wait for extension to process

            // when
            const newFileUri = await renameDocument(path.join(workspaceRoot, "src/compositions/new2.js"), path.join(workspaceRoot, "src/compositions/new3.js"));
            const newDocument = await vscode.workspace.openTextDocument(newFileUri);

            // then
            const notExpectedCode = `window.eventStack.set("function", "newFunction(new3.js)")`;
            assert.ok(
                !newDocument.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await deleteDocument(newFileUri);
            await sleep(200); // wait for document to be deleted
        });
    });
});

import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import {
    waitForLoadingExtension,
    sleep,
    insert,
    remove,
} from "./utils.test";

suite("ts basic", () => {
let workspaceRoot: string = "";

    suiteSetup(() => {
        workspaceRoot = path.resolve(__dirname, "../../fixtures/ts");
    });

    suite("Manual.vue", () => {
        test("Triggering 'manualAddEventStack' inside a named arrow function with parameters inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Manual.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const functionCode = `
const externalArrowFunctionWithParameters = (
  param1: any,
  param2: any, 
  { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }: any, 
  [arrayElement, ...restArrayElement]: any,
  ...rest: any
): void => {
  console.log("externalArrowFunctionWithParameters called");
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `window.eventStack.set("function", "externalArrowFunctionWithParameters(Manual.vue)", param1, param2, object, differentNameKey, arrayElement);`; // 공백이 포함되어야 할 수도 있음

            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside a named arrow function which is declared in another arrow function inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Manual.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const functionCode = `
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
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `window.eventStack.set("function", "innerFunction(Manual.vue)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside a named arrow function without parameters inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Manual.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const functionCode = `
const externalArrowFunctionWithoutParameters = (): void => {
  console.log("externalArrowFunctionWithoutParameters called");
};
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `window.eventStack.set("function", "externalArrowFunctionWithoutParameters(Manual.vue)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside a function without a name assigned to the let inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Manual.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            let functionCode = `
let variableLetFunction = function (): void {
  console.log("variableLetFunction called");
};
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let expectedCode = `window.eventStack.set("function", "variableLetFunction(Manual.vue)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();

            functionCode = `
const variableConstFunction = function name() {
  console.log("variableConstFunction called");
};
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            expectedCode = `window.eventStack.set("function", "variableConstFunction(Manual.vue)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside a named normal function with parameters inserts event stack", async () => {
            // given
            await waitForLoadingExtension();
            
            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Manual.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const functionCode = `
function externalNormalFunctionWithParameters(
  param1: any,
  param2: any, 
  { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }: any, 
  [arrayElement, ...restArrayElement]: any,
  ...rest: any
): void {
  console.log("externalNormalFunctionWithParameters called");
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `window.eventStack.set("function", "externalNormalFunctionWithParameters(Manual.vue)", param1, param2, object, differentNameKey, arrayElement);`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside a named normal function which is declared in another normal function inserts event stack", async () => {
            // given
            await waitForLoadingExtension();
            
            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Manual.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const functionCode = `
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
}
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `window.eventStack.set("function", "innerFunction(Manual.vue)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside a named normal function without parameters inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Manual.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const functionCode = `
function externalNormalFunctionWithoutParameters(): void {
  console.log("externalNormalFunctionWithoutParameters called");
}
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `window.eventStack.set("function", "externalNormalFunctionWithoutParameters(Manual.vue)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside an IIFE inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Manual.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const functionCode = `
(function iifeFunction(): void {
  console.log("iifeFunction called");
})()
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `window.eventStack.set("function", "iifeFunction(Manual.vue)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside a returned function inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Manual.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const functionCode = `
  return function returnedFunction(): void {
    console.log("returnedFunction called");
  };
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `window.eventStack.set("function", "returnedFunction(Manual.vue)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside an object method function inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Manual.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            let functionCode = `
  objectMethod1(): void {
    console.log("objectMethod1 called");
  }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let expectedCode = `window.eventStack.set("function", "objectMethod1(Manual.vue)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();

            functionCode = `
  objectMethod2: (): void => {
    console.log("objectMethod2 called");
  }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            expectedCode = `window.eventStack.set("function", "objectMethod2(Manual.vue)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();

            functionCode = `
  objectMethod3: function (): void {
    console.log("objectMethod3 called");
  }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            expectedCode = `window.eventStack.set("function", "objectMethod3(Manual.vue)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();

            functionCode = `
  objectMethod4: function name(): void {
    console.log("objectMethod4 called");
  }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            expectedCode = `window.eventStack.set("function", "objectMethod4(Manual.vue)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside a class method function inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Manual.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            let functionCode = `
  classMethod1(): void {
    console.log("classMethod1 called");
  }
`
            ;

            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let expectedCode = `window.eventStack.set("function", "classMethod1(Manual.vue)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();

            functionCode = `
  classMethod2 = (): void => {
    console.log("classMethod2 called");
  }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            expectedCode = `window.eventStack.set("function", "classMethod2(Manual.vue)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();

            functionCode = `
  classMethod3 = function (): void {
    console.log("classMethod3 called");
  }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            expectedCode = `window.eventStack.set("function", "classMethod3(Manual.vue)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();

            functionCode = `
  classMethod4 = function name(): void {
    console.log("classMethod4 called");
  }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            expectedCode = `window.eventStack.set("function", "classMethod4(Manual.vue)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside a function without body does not insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Manual.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            let functionCode = `
const oneLineArrowFunctionWithoutBody = (): string => "aa";
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let notExpectedCode = `window.eventStack.set("function", "oneLineArrowFunctionWithoutBody(Manual.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
const multiLineArrowFunctionWithoutBody = (): { aa: string } => ({
  aa: "aa",
});
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "multiLineArrowFunctionWithoutBody(Manual.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
const multiLineNestedArrowFunctionWithoutBody = (): { aa: () => { bb: string } } => ({
  aa: () => ({
    bb: "bb",
  }),
});
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process
            
            // then
            notExpectedCode = `window.eventStack.set("function", "multiLineNestedArrowFunctionWithoutBody(Manual.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );
        });

        test("Triggering 'manualAddEventStack' inside a one line function with body does not insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Manual.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            let functionCode = `
function oneLineNormalFunctionWithBody(): void { console.log("oneLineNormalFunctionWithBody called"); }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let notExpectedCode = `window.eventStack.set("function", "oneLineNormalFunctionWithBody(Manual.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
const oneLineArrowFunctionWithBody = (): void => { console.log("oneLineArrowFunctionWithBody called"); };
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "oneLineArrowFunctionWithBody(Manual.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );
        });

        test("Triggering 'manualAddEventStack' inside a function that already has eventstack does not insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Manual.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            let functionCode = `
function functionWithEventStack1(): void {
  (window as any).eventStack.set("function", "functionWithEventStack1");
}
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let notExpectedCode = `window.eventStack.set("function", "functionWithEventStack1(Manual.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
function functionWithEventStack2(): void {
  (window as any)?.eventStack.set("function", "functionWithEventStack2");
}
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack2(Manual.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
function functionWithEventStack3(): void {
  (window as any)!.eventStack.set("function", "functionWithEventStack3");
}
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack3(Manual.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
function functionWithEventStack4(): void {
  (window as any).eventStack?.set("function", "functionWithEventStack4");
}
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack4(Manual.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
function functionWithEventStack5(): void {
  (window as any).eventStack!.set("function", "functionWithEventStack5");
}
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack5(Manual.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
function functionWithEventStack6(): void {
  (window as any)?.eventStack!.set("function", "functionWithEventStack6");
}
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack6(Manual.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
function functionWithEventStack7(): void {
  (window as any)!.eventStack?.set("function", "functionWithEventStack7");
}
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack7(Manual.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
function functionWithEventStack8(): void {
  (window as any)?.eventStack?.set("function", "functionWithEventStack8");
}
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack8(Manual.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
function functionWithEventStack9(): void {
  (window as any)!.eventStack!.set("function", "functionWithEventStack9");
}
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack9(Manual.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );
        });

        test("Triggering 'manualAddEventStack' inside an IIFE without a name does not insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Manual.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            let functionCode = `
(function (): void {
  console.log("iifeFunction called");
})();
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let notExpectedCode = `window.eventStack.set("function", "iifeFunction(Manual.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
((): void => {
  console.log("iifeFunction called");
})();
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "iifeFunction(Manual.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );
        });

        test("Triggering 'manualAddEventStack' inside a function returned from a function without a name does not insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/views/Manual.vue"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            let functionCode = `
  return function (): void {
    console.log("returnedFunction called");
  };
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let notExpectedCode = `window.eventStack.set("function", "returnedFunction(Manual.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
  return (): void => {
    console.log("returnedFunction called");
  };
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "returnedFunction(Manual.vue)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );
        });
    });

    suite("manual.ts", () => {
        test("Triggering 'manualAddEventStack' inside a named arrow function with parameters inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/manual.ts"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const functionCode = `
  const externalArrowFunctionWithParameters = (
    param1: any,
    param2: any, 
    { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }: any, 
    [arrayElement, ...restArrayElement]: any,
    ...rest: any
  ): void => {
    console.log("externalArrowFunctionWithParameters called");
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `window.eventStack.set("function", "externalArrowFunctionWithParameters(manual.ts)", param1, param2, object, differentNameKey, arrayElement);`; // 공백이 포함되어야 할 수도 있음

            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside a named arrow function which is declared in another arrow function inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/manual.ts"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const functionCode = `
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
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `window.eventStack.set("function", "innerFunction(manual.ts)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside a named arrow function without parameters inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/manual.ts"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const functionCode = `
  const externalArrowFunctionWithoutParameters = (): void => {
    console.log("externalArrowFunctionWithoutParameters called");
  };
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `window.eventStack.set("function", "externalArrowFunctionWithoutParameters(manual.ts)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside a function without a name assigned to the let inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/manual.ts"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            let functionCode = `
  let variableLetFunction = function (): void {
    console.log("variableLetFunction called");
  };
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let expectedCode = `window.eventStack.set("function", "variableLetFunction(manual.ts)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();

            functionCode = `
  const variableConstFunction = function name() {
    console.log("variableConstFunction called");
  };
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            expectedCode = `window.eventStack.set("function", "variableConstFunction(manual.ts)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside a named normal function with parameters inserts event stack", async () => {
            // given
            await waitForLoadingExtension();
            
            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/manual.ts"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const functionCode = `
  function externalNormalFunctionWithParameters(
    param1: any,
    param2: any, 
    { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }: any, 
    [arrayElement, ...restArrayElement]: any,
    ...rest: any
  ): void {
    console.log("externalNormalFunctionWithParameters called");
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `window.eventStack.set("function", "externalNormalFunctionWithParameters(manual.ts)", param1, param2, object, differentNameKey, arrayElement);`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside a named normal function which is declared in another normal function inserts event stack", async () => {
            // given
            await waitForLoadingExtension();
            
            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/manual.ts"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const functionCode = `
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
  }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `window.eventStack.set("function", "innerFunction(manual.ts)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside a named normal function without parameters inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/manual.ts"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const functionCode = `
  function externalNormalFunctionWithoutParameters(): void {
    console.log("externalNormalFunctionWithoutParameters called");
  }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `window.eventStack.set("function", "externalNormalFunctionWithoutParameters(manual.ts)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside an IIFE inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/manual.ts"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const functionCode = `
  (function iifeFunction(): void {
    console.log("iifeFunction called");
  })()
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `window.eventStack.set("function", "iifeFunction(manual.ts)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside a returned function inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/manual.ts"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const functionCode = `
    return function returnedFunction(): void {
      console.log("returnedFunction called");
    };
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const expectedCode = `window.eventStack.set("function", "returnedFunction(manual.ts)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside an object method function inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/manual.ts"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            let functionCode = `
    objectMethod1(): void {
      console.log("objectMethod1 called");
    }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let expectedCode = `window.eventStack.set("function", "objectMethod1(manual.ts)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();

            functionCode = `
    objectMethod2: (): void => {
      console.log("objectMethod2 called");
    }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            expectedCode = `window.eventStack.set("function", "objectMethod2(manual.ts)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();

            functionCode = `
    objectMethod3: function (): void {
      console.log("objectMethod3 called");
    }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            expectedCode = `window.eventStack.set("function", "objectMethod3(manual.ts)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();

            functionCode = `
    objectMethod4: function name(): void {
      console.log("objectMethod4 called");
    }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            expectedCode = `window.eventStack.set("function", "objectMethod4(manual.ts)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside a class method function inserts event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/manual.ts"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            let functionCode = `
    classMethod1(): void {
      console.log("classMethod1 called");
    }
`
            ;

            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let expectedCode = `window.eventStack.set("function", "classMethod1(manual.ts)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();

            functionCode = `
    classMethod2 = (): void => {
      console.log("classMethod2 called");
    };
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            expectedCode = `window.eventStack.set("function", "classMethod2(manual.ts)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();

            functionCode = `
    classMethod3 = function (): void {
      console.log("classMethod3 called");
    };
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            expectedCode = `window.eventStack.set("function", "classMethod3(manual.ts)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();

            functionCode = `
    classMethod4 = function name(): void {
      console.log("classMethod4 called");
    };
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            expectedCode = `window.eventStack.set("function", "classMethod4(manual.ts)");`; // 공백이 포함되어야 할 수도 있음
            assert.ok(
                document.getText().includes(expectedCode),
                "eventstack is not inserted as expected"
            );

            // clean up
            await remove(fileUri, document, expectedCode);
            await document.save();
        });

        test("Triggering 'manualAddEventStack' inside a function without body does not insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/manual.ts"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            let functionCode = `
  const oneLineArrowFunctionWithoutBody = (): string => "aa";
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let notExpectedCode = `window.eventStack.set("function", "oneLineArrowFunctionWithoutBody(manual.ts)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
  const multiLineArrowFunctionWithoutBody = (): { aa: string } => ({
    aa: "aa",
  });
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "multiLineArrowFunctionWithoutBody(manual.ts)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
  const multiLineNestedArrowFunctionWithoutBody = (): { aa: () => { bb: string } } => ({
    aa: () => ({
      bb: "bb",
    }),
  });
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "multiLineNestedArrowFunctionWithoutBody(manual.ts)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );
        });

        test("Triggering 'manualAddEventStack' inside a one line function with body does not insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/manual.ts"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            let functionCode = `
  function oneLineNormalFunctionWithBody(): void { console.log("oneLineNormalFunctionWithBody called"); }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let notExpectedCode = `window.eventStack.set("function", "oneLineNormalFunctionWithBody(manual.ts)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
  const oneLineArrowFunctionWithBody = (): void => { console.log("oneLineArrowFunctionWithBody called"); };
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "oneLineArrowFunctionWithBody(manual.ts)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );
        });

        test("Triggering 'manualAddEventStack' inside a function that already has eventstack does not insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/manual.ts"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            let functionCode = `
  function functionWithEventStack1(): void {
    (window as any).eventStack.set("function", "functionWithEventStack1");
  }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let notExpectedCode = `window.eventStack.set("function", "functionWithEventStack1(manual.ts)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
  function functionWithEventStack2(): void {
    (window as any)?.eventStack.set("function", "functionWithEventStack2");
  }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack2(manual.ts)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
  function functionWithEventStack3(): void {
    (window as any)!.eventStack.set("function", "functionWithEventStack3");
  }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack3(manual.ts)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
  function functionWithEventStack4(): void {
    (window as any).eventStack?.set("function", "functionWithEventStack4");
  }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack4(manual.ts)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
  function functionWithEventStack5(): void {
    (window as any).eventStack!.set("function", "functionWithEventStack5");
  }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack5(manual.ts)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
  function functionWithEventStack6(): void {
    (window as any)?.eventStack!.set("function", "functionWithEventStack6");
  }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack6(manual.ts)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
  function functionWithEventStack7(): void {
    (window as any)!.eventStack?.set("function", "functionWithEventStack7");
  }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack7(manual.ts)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
  function functionWithEventStack8(): void {
    (window as any)?.eventStack?.set("function", "functionWithEventStack8");
  }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack8(manual.ts)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
  function functionWithEventStack9(): void {
    (window as any)!.eventStack!.set("function", "functionWithEventStack9");
  }
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "functionWithEventStack9(manual.ts)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );
        });

        test("Triggering 'manualAddEventStack' inside an IIFE without a name does not insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/manual.ts"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            let functionCode = `
  (function (): void {
    console.log("iifeFunction called");
  })();
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let notExpectedCode = `window.eventStack.set("function", "iifeFunction(manual.ts)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
  ((): void => {
    console.log("iifeFunction called");
  })();
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "iifeFunction(manual.ts)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );
        });

        test("Triggering 'manualAddEventStack' inside a function returned from a function without a name does not insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/compositions/manual.ts"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            let functionCode = `
    return function (): void {
      console.log("returnedFunction called");
    };
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            let notExpectedCode = `window.eventStack.set("function", "returnedFunction(manual.ts)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            functionCode = `
    return (): void => {
      console.log("returnedFunction called");
    };
`
            ;
            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠
            
            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            notExpectedCode = `window.eventStack.set("function", "returnedFunction(manual.ts)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );
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
function newFunction(): void {
  console.log("newFunction called");
}
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();

            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
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
    });

    suite("error.ts", () => {
        test("Triggering 'manualAddEventStack' inside a new function in a file with parsing errors does not insert event stack", async () => {
            // given
            await waitForLoadingExtension();

            const fileUri = vscode.Uri.file(path.join(workspaceRoot, "src/utils/error.ts"));
            const document = await vscode.workspace.openTextDocument(fileUri);

            const emptyPosition = new vscode.Position(3, 0);
            const functionCode = `
function newFunction(): void {
  console.log("newFunction called");
}
`
            ;

            // when
            await insert(fileUri, emptyPosition, functionCode);
            await document.save();

            // document text 내에서 functionCode의 위치를 찾음
            // functionCode의 위치 내에서 랜덤한 곳에 커서를 둠

            // when
            // trigger(keyboard or command palette)
            await document.save();
            await sleep(200); // wait for extension to process

            // then
            const notExpectedCode = `window.eventStack.set("function", "newFunction(error.ts)")`;
            assert.ok(
                !document.getText().includes(notExpectedCode),
                "eventstack is unexpectedly inserted"
            );

            // clean up
            await remove(fileUri, document, functionCode);
            await document.save();
        });
    });
});

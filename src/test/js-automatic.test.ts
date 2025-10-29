import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import { waitForLoadingExtension } from "./utils.test";

suite("js basic", () => {
    let workspaceRoot: string = "";

    suiteSetup(() => {
        workspaceRoot = path.resolve(__dirname, "../../fixtures/js");
    });

    suite("App.vue", () => {
        async function getDocument(): Promise<vscode.TextDocument> {
            const targetFileUri = vscode.Uri.file(
                path.join(workspaceRoot, "src/App.vue")
            );

            return vscode.workspace.openTextDocument(targetFileUri);
        }

        test("Adding a new named arrow function with parameters automatically adds event stack", async () => {
            // given
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
const externalArrowFunctionWithParameters = (
  param1,
  param2, 
  { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
  [arrayElement, ...restArrayElement],
  ...rest
) => {
  console.log("externalArrowFunction called");
};
`;
        });

        test("Adding a new named arrow function which is declared in another arrow function automatically adds event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
const externalArrowFunctionWithParameters = (
  param1,
  param2, 
  { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
  [arrayElement, ...restArrayElement],
  ...rest
) => {
  console.log("externalArrowFunction called");

  const innerFunction = () => {
    console.log("innerFunction called");
  };
};
`;
        });

        test("Adding a new named arrow function without parameters automatically adds event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
const externalArrowFunctionWithoutParameters = () => {
  console.log("externalArrowFunctionWithoutParameters called");
};
`;
        });

        test("Adding a new named normal function with parameters automatically adds event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
function externalNormalFunctionWithParameters(
  param1,
  param2, 
  { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
  [arrayElement, ...restArrayElement],
  ...rest
) {
  console.log("normalFunction called");
};
`;
        });

        test("Adding a new named normal function which is declared in another normal function automatically adds event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
function externalNormalFunctionWithParameters(
  param1,
  param2, 
  { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
  [arrayElement, ...restArrayElement],
  ...rest
) {
  console.log("normalFunction called");

  function innerFunction() {
    console.log("innerFunction called");
  }
};
`;
        });

        test("Adding a new named normal function without parameters automatically adds event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
function externalNormalFunctionWithoutParameters() {
  console.log("normalFunction called");
};
`;
        });

        test("Adding a new variable does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
const commonVariable = "This is var1";
`;
        });

        test("Adding a new ref variable does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
const commonRef = ref(0);
`;
        });

        test("Adding a new function assigned to a variable does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
const variableFunction = function aa() {
  console.log("variableFunction called");
};
`;
        });

        test("Adding a new computed property does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
const computedValue = computed(() => {
  return 1;
});
`;
        });

        test("Adding a new function without body does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            let functionCode = `
const oneLineArrowFunctionWithoutBody = () => "aa";
`;
            // TEST

            functionCode = `
const multiLineArrowFunctionWithoutBody = () => ({
  aa: "aa",
});
`;
            // TEST

            functionCode = `
const multiLineNestedArrowFunctionWithoutBody = () => ({
  aa: () => ({
    bb: "bb",
  })
});
`;
            // TEST
        });

        test("Adding a new one line function with body does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            let functionCode = `
function oneLineNormalFunctionWithBody() { console.log("oneLineNormalFunctionWithBody called"); }
`;
            // TEST

            functionCode = `
const oneLineArrowFunctionWithBody = () => { console.log("oneLineArrowFunctionWithBody called"); };
`;
            // TEST
        });

        test("Adding a new function that already has event stack does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            let functionCode = `
function functionWithEventStack1() {
  window.eventStack.set("function", "functionWithEventStack1");
};
`;
            // TEST

            functionCode = `
function functionWithEventStack2() {
  window?.eventStack.set("function", "functionWithEventStack2");
};
`;
            // TEST

            functionCode = `
function functionWithEventStack3() {
  window.eventStack?.set("function", "functionWithEventStack3");
};
`;
            // TEST

            functionCode = `
function functionWithEventStack4() {
  window?.eventStack?.set("function", "functionWithEventStack4");
};
`;
            // TEST
        });

        test("Adding a new IIFE does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
(function iifeFunction() {
  console.log("iifeFunction called");
});
`;
        });

        test("Adding a new object does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
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
`;
        });
    });

    suite("useBanner.js", () => {
        async function getDocument(): Promise<vscode.TextDocument> {
            const targetFileUri = vscode.Uri.file(
                path.join(workspaceRoot, "src/compositions/useBanner.js")
            );

            return vscode.workspace.openTextDocument(targetFileUri);
        }

        test("Adding a new named arrow function with parameters automatically adds event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
  const externalArrowFunctionWithParameters = (
    param1,
    param2, 
    { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
    [arrayElement, ...restArrayElement],
    ...rest
  ) => {
    console.log("externalArrowFunction called");
  };
`;
        });

        test("Adding a new named arrow function which is declared in another arrow function automatically adds event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
  const externalArrowFunctionWithParameters = (
    param1,
    param2, 
    { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
    [arrayElement, ...restArrayElement],
    ...rest
  ) => {
    console.log("externalArrowFunction called");

    const innerFunction = () => {
      console.log("innerFunction called");
    };
  };
`;
        });

        test("Adding a new named arrow function without parameters automatically adds event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
  const externalArrowFunctionWithoutParameters = () => {
    console.log("externalArrowFunctionWithoutParameters called");
  };
`;
        });

        test("Adding a new named normal function with parameters automatically adds event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
  function externalNormalFunctionWithParameters(
    param1,
    param2, 
    { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
    [arrayElement, ...restArrayElement],
    ...rest
  ) {
    console.log("normalFunction called");
  };
`;
        });

        test("Adding a new named normal function which is declared in another normal function automatically adds event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
  function externalNormalFunctionWithParameters(
    param1,
    param2, 
    { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject },
    [arrayElement, ...restArrayElement],
    ...rest
  ) {
    console.log("normalFunction called");

    function innerFunction() {
      console.log("innerFunction called");
    }
  };
`;
        });

        test("Adding a new named normal function without parameters automatically adds event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
  function externalNormalFunctionWithoutParameters() {
    console.log("normalFunction called");
  };
`;
        });

        test("Adding a new variable does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
  const commonVariable = "This is var1";
`;
        });

        test("Adding a new ref variable does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
  const commonRef = ref(0);
`;
        });

        test("Adding a new function assigned to a variable does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
  const variableFunction = function aa() {
    console.log("variableFunction called");
  };
`;
        });

        test("Adding a new computed property does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
  const computedValue = computed(() => {
    return 1;
  });
`;
        });

        test("Adding a new function without body does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            let functionCode = `
  const oneLineArrowFunctionWithoutBody = () => "aa";
`;
            // TEST

            functionCode = `
  const multiLineArrowFunctionWithoutBody = () => ({
    aa: "aa",
  });
`;
            // TEST

            functionCode = `
  const multiLineNestedArrowFunctionWithoutBody = () => ({
    aa: () => ({
      bb: "bb",
    })
  });
`;
            // TEST
        });

        test("Adding a new one line function with body does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            let functionCode = `
  function oneLineNormalFunctionWithBody() { console.log("oneLineNormalFunctionWithBody called"); }
`;
            // TEST

            functionCode = `
  const oneLineArrowFunctionWithBody = () => { console.log("oneLineArrowFunctionWithBody called"); };
`;
            // TEST
        });

        test("Adding a new function that already has event stack does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            let functionCode = `
  function functionWithEventStack1() {
    window.eventStack.set("function", "functionWithEventStack1");
  };
`;
            // TEST

            functionCode = `
  function functionWithEventStack2() {
    window?.eventStack.set("function", "functionWithEventStack2");
  };
`;
            // TEST

            functionCode = `
  function functionWithEventStack3() {
    window.eventStack?.set("function", "functionWithEventStack3");
  };
`;
            // TEST

            functionCode = `
  function functionWithEventStack4() {
    window?.eventStack?.set("function", "functionWithEventStack4");
  };
`;
            // TEST
        });

        test("Adding a new IIFE does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
  (function iifeFunction() {
    console.log("iifeFunction called");
  });
`;
        });

        test("Adding a new object does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
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
`;
        });

        test("Adding a new function returned from a function does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
  return function returnedFunction() {

  };
`;
        });

        test("When changing the name of the function, it should be added if there is no event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const oldFunctionName = "useBanner";
            const newFunctionName = "useBanner2";
        });
    });

    suite("Error.vue", () => {
        async function getDocument(): Promise<vscode.TextDocument> {
            const targetFileUri = vscode.Uri.file(
                path.join(workspaceRoot, "src/views/Error.vue")
            );

            return vscode.workspace.openTextDocument(targetFileUri);
        }

        test("Adding a new function in a file with parsing errors inside the script tag does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
function zxcv() {
    console.log("zxcv called");
}
`;
        });

        test("Adding a new function in a file with parsing errors at the time when the parsing errors are fixed does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const deleteCode = `
const aa "fdf";
`;
            const functionCode = `
function zxcv() {
    console.log("zxcv called");
}
`;
            // save action
        });

        test("Adding a new function in a file with parsing errors after the parsing errors are fixed automatically adds event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const deleteCode = `
const aa "fdf";
`;
            // save action

            const functionCode = `
function zxcv() {
    console.log("zxcv called");
}
`;
        });

        test("Adding a new function in a file with parsing errors inside the template tag automatically adds event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const deleteCode = `
const aa "fdf";
`;
            // save action

            const errorCode = `
    <
`;
            const functionCode = `
function zxcv() {
    console.log("zxcv called");
}
`;
        });
    });

    suite("error.js", () => {
        async function getDocument(): Promise<vscode.TextDocument> {
            const targetFileUri = vscode.Uri.file(
                path.join(workspaceRoot, "src/utils/error.js")
            );

            return vscode.workspace.openTextDocument(targetFileUri);
        }

        test("Adding a new function in a file with parsing errors does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const functionCode = `
function zxcv() {
    console.log("zxcv called");
}
`;
        });

        test("Adding a new function in a file with parsing errors at the time when the parsing errors are fixed does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const deleteCode = `
const aa "fdf";
`;
            const functionCode = `
function zxcv() {
    console.log("zxcv called");
}
`;
            // save action
        });

        test("Adding a new function in a file with parsing errors after the parsing errors are fixed automatically adds event stack", async () => {
            await waitForLoadingExtension();

            const document = await getDocument();
            const deleteCode = `
const aa "fdf";
`;
            // save action

            const functionCode = `
function zxcv() {
    console.log("zxcv called");
}
`;
        });
    });

    suite("New.vue", () => {
        async function createDocument(): Promise<vscode.TextDocument> {
            const filePath = path.join(workspaceRoot, "src/views/New.vue");
            await vscode.workspace.fs.writeFile(vscode.Uri.file(filePath), new TextEncoder().encode(""));
            const targetFileUri = vscode.Uri.file(filePath);

            return vscode.workspace.openTextDocument(targetFileUri);
        }

        async function renameDocument(): Promise<vscode.TextDocument> {
            const oldFilePath = path.join(workspaceRoot, "src/views/New.vue");
            const newFilePath = path.join(workspaceRoot, "src/views/New2.vue");
            await vscode.workspace.fs.rename(vscode.Uri.file(oldFilePath), vscode.Uri.file(newFilePath));
            const targetFileUri = vscode.Uri.file(newFilePath);

            return vscode.workspace.openTextDocument(targetFileUri);
        }

        test("Adding a new function in a new file automatically adds event stack", async () => {
            await waitForLoadingExtension();

            const document = await createDocument();
            const functionCode = `
function newFunction() {
  console.log("newFunction called");
}
`;
        });

        test("When renaming a file, the function information from the previous file is moved to the new file, that is, it does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            await createDocument();
            const document = await renameDocument();
        });
    });

    suite("new.js", () => {
        async function createDocument(): Promise<vscode.TextDocument> {
            const filePath = path.join(workspaceRoot, "src/compositions/new.js");
            await vscode.workspace.fs.writeFile(vscode.Uri.file(filePath), new TextEncoder().encode(""));
            const targetFileUri = vscode.Uri.file(filePath);

            return vscode.workspace.openTextDocument(targetFileUri);
        }

        async function renameDocument(): Promise<vscode.TextDocument> {
            const oldFilePath = path.join(workspaceRoot, "src/compositions/new.js");
            const newFilePath = path.join(workspaceRoot, "src/compositions/new2.js");
            await vscode.workspace.fs.rename(vscode.Uri.file(oldFilePath), vscode.Uri.file(newFilePath));
            const targetFileUri = vscode.Uri.file(newFilePath);

            return vscode.workspace.openTextDocument(targetFileUri);
        }

        test("Adding a new function in a new file automatically adds event stack", async () => {
            await waitForLoadingExtension();

            const document = await createDocument();
            const functionCode = `
function newFunction() {
  console.log("newFunction called");
}
`;
        });

        test("When renaming a file, the function information from the previous file is moved to the new file, that is, it does not automatically add event stack", async () => {
            await waitForLoadingExtension();

            await createDocument();
            const document = await renameDocument();
        });
    });
});

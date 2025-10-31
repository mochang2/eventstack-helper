import * as vscode from "vscode";
import { manuallyAddEventStack, automaticallyAddEventStack } from "./action";
import { CursorScopeResolver } from "./cursorScopeResolver";
import { FunctionTracker } from "./functionTracker";

// TODO
// 1. 단축키 및 context menu 개발
//   - 현재 커서가 함수 선언문 내부에 있음을 인지할 수 있어야 함
//   - 우클릭으로 context menu 추가
//   - 단축키 등록 + 단축키 변경할 수 있게 메뉴 제공해줘야 함
// 2. 테스트 코드 작성
// 3. package.json 안 쓰는 모듈 정리
// 4. publish.yml 배포 자동화 잘 됐는지 한 번 확인해야 함
// 5. DOCS 완성
//   - REAMD.md 완성(Demo)
//   - CHANGELOG.md

// TODO: manuallyAddEventStack 테스트 목록 function 키워드로 선언된 함수 / inner function / const, var, let에 할당된 함수, arrow function / object method / class method / return function <= 전부 이름 있는 함수만!!! params도 잘 들어가는지 확인
// TODO: 유저가 context menu에서 클릭했는데 함수 컨텍스트 안에 없으면 alert 메시지 같은 거를 남기도록 하기 or 이미 이벤트 스택이 있으면 그 위치로 이동할 수 있는 기능 만들기

// tests not described in the fixtures
// - When changing the name of the function, it should be added if there is no event stack because it is recognized as a new function
// - If there is no eventStack for all functions declared in the file, you must add it even if you create a new file
// - When renaming files, do not add eventStack because function information from the previous file is moved to the new file
export async function activate(context: vscode.ExtensionContext) {
    const functionTracker = new FunctionTracker();
    const cursorScopeResolver = new CursorScopeResolver();

    await functionTracker.initialize();

    const manualAddEventStackCommand = vscode.commands.registerCommand(
        "eventstack-helper.manualAddEventStack",
        async () => {
            const functionAtCursor = await cursorScopeResolver.getFunctionAtCursor();
            if (!functionAtCursor) {
                return;
            }

            await manuallyAddEventStack(functionAtCursor.fileUri, functionAtCursor.functionInfo);
        }
    );

    const onDidSaveTextDocument = vscode.workspace.onDidSaveTextDocument(
        async (textDocument) => {
            // TODO: getFunctions를 여러 번 하니까 이거를 효율적으로 고쳐보자
            const savedFileUri = textDocument.uri;
            const newlyAddedFunctions =
                await functionTracker.getNewlyAddedFunctions(savedFileUri);

            await automaticallyAddEventStack(savedFileUri, newlyAddedFunctions);
            await functionTracker.updateFile(savedFileUri);
        }
    );

    const onDidRenameFiles = vscode.workspace.onDidRenameFiles(({ files }) => {
        for (const file of files) {
            const oldFileUri = file.oldUri;
            const newFileUri = file.newUri;

            functionTracker.migrateFunctionInfo(oldFileUri, newFileUri);
        }
    });

    context.subscriptions.push(
        manualAddEventStackCommand,
        onDidSaveTextDocument,
        onDidRenameFiles
    );
}

export function deactivate() {}

import * as vscode from "vscode";
import { FunctionTracker } from "./functionTracker";
import { automaticallyAddEventStack } from "./eventStackManager";

// tests not described in the fixtures
// - When changing the name of the function, it should be added if there is no event stack because it is recognized as a new function
// - If there is no eventStack for all functions declared in the file, you must add it even if you create a new file
// - When renaming files, do not add eventStack because function information from the previous file is moved to the new file
export async function activate(context: vscode.ExtensionContext) {
    const functionTracker = new FunctionTracker();

    await functionTracker.initialize();

    const onDidSaveTextDocument = vscode.workspace.onDidSaveTextDocument(
        async (textDocument) => {
            const savedFileUri = textDocument.uri;
            const newlyAddedFunctions =
                await functionTracker.getNewlyAddedFunctions(savedFileUri);

            await automaticallyAddEventStack(savedFileUri, newlyAddedFunctions);
            await functionTracker.updateFile(savedFileUri);
        }
    );

    const onDidRenameFiles = vscode.workspace.onDidRenameFiles(
        ({ files }) => {
            for (const file of files) {
                const oldFileUri = file.oldUri;
                const newFileUri = file.newUri;

                functionTracker.migrateFunctionInfo(oldFileUri, newFileUri);
            }
        }
    );

    context.subscriptions.push(onDidSaveTextDocument, onDidRenameFiles);
}

export function deactivate() {}

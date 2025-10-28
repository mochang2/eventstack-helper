import * as vscode from "vscode";
import { FunctionTracker } from "./functionTracker";
import { automaticallyAddEventStack } from "./eventStackManager";

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

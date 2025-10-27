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

    context.subscriptions.push(onDidSaveTextDocument);
}

export function deactivate() {}

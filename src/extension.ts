import * as vscode from "vscode";
import { manuallyAddEventStack, automaticallyAddEventStack } from "./action";
import { CursorScopeResolver } from "./cursorScopeResolver";
import { FunctionTracker } from "./functionTracker";

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

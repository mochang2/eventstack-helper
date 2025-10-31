import * as vscode from "vscode";
import {
    shouldProcessFunctions,
    addEventStackToFunction,
    moveCursorToEventStack,
} from "./eventStackManager";
import type { FunctionInfo } from "./types";

export async function automaticallyAddEventStack(
    fileUri: vscode.Uri,
    newlyAddedFunctions: FunctionInfo[]
): Promise<void> {
    if (!shouldProcessFunctions(fileUri, newlyAddedFunctions)) {
        return;
    }

    const functionsToAddEventStack = newlyAddedFunctions.filter(
        ({ isEventStackSetExists }) => !isEventStackSetExists
    );
    const document = await vscode.workspace.openTextDocument(fileUri);
    let addedFunctionCount = 0;
    let lastEventStackPosition: vscode.Position | null = null;

    for (const functionInfo of functionsToAddEventStack) {
        const { line, column } = await addEventStackToFunction(
            document,
            functionInfo,
            addedFunctionCount
        );
        lastEventStackPosition = new vscode.Position(line + 1, column);
        addedFunctionCount++;
    }

    await vscode.workspace.save(fileUri);
    if (lastEventStackPosition) {
        // move cursor to the last event stack position
        await moveCursorToEventStack(fileUri, lastEventStackPosition);
    }
}

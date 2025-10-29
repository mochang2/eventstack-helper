import * as vscode from "vscode";
import * as path from "path";
import { minimatch } from "minimatch";
import type { Position, FunctionInfo } from "./types";

function calculateIndentation(
    document: vscode.TextDocument,
    declarationStartPosition: Position,
    lineAdjustment: number
): string {
    const config = vscode.workspace.getConfiguration("editor", document.uri); // automatically handles priority (workspace > user > default)
    let tabSize = config.get("tabSize", 4);
    let insertSpaces = config.get("insertSpaces", true);

    const totalLines = document.getText().split("\n");

    // calculate the difference in indentation between the function declaration and the next line
    const functionLine = declarationStartPosition.line + lineAdjustment;
    const functionBodyFirstLine = functionLine + 1;

    const functionIndent =
        totalLines[functionLine].match(/^(\s+)(?=\S)/)?.[1] || "";
    const functionBodyFirstLineIndent =
        totalLines[functionBodyFirstLine].match(/^(\s+)(?=\S)/)?.[1] || "";

    const hasValidIndentation =
        functionBodyFirstLineIndent.length > functionIndent.length;
    if (hasValidIndentation) {
        const isUsingTab = functionBodyFirstLineIndent.includes("\t");
        if (isUsingTab) {
            insertSpaces = false;
            tabSize = 1;
        }
        // use spaces
        else {
            const indentDifference =
                functionBodyFirstLineIndent.length - functionIndent.length;
            insertSpaces = true;
            tabSize = indentDifference;
        }
    }

    const indentChar = insertSpaces ? " " : "\t"; // use spaces or tab
    const indentSize = insertSpaces ? tabSize : 1; // use tabSize or 1

    return `${" ".repeat(functionIndent.length)}${indentChar.repeat(
        indentSize
    )}`;
}

function formatEventStackCode(
    indentation: string,
    fileFullPath: string,
    { functionName, params }: FunctionInfo
): string {
    const fileName = path.basename(fileFullPath);

    return params.length > 0
        ? `\n${indentation}window.eventStack.set("function", "${functionName}(${fileName})", ${params.join(", ")});`
        : `\n${indentation}window.eventStack.set("function", "${functionName}(${fileName})");`;
}

// add indentation before eventStackCode according to the editor settings
export async function addEventStackToFunction(
    document: vscode.TextDocument,
    functionInfo: FunctionInfo,
    lineAdjustment: number
): Promise<number> {
    const indentation = calculateIndentation(
        document,
        functionInfo.declarationStartPosition,
        lineAdjustment
    );
    const eventStackCode = formatEventStackCode(
        indentation,
        document.uri.fsPath,
        functionInfo
    );

    const edit = new vscode.WorkspaceEdit();
    const position = new vscode.Position(
        functionInfo.bodyStartPosition.line + lineAdjustment,
        functionInfo.bodyStartPosition.column
    );
    edit.insert(document.uri, position, eventStackCode);

    await vscode.workspace.applyEdit(edit);

    return functionInfo.bodyStartPosition.line + lineAdjustment;
}

async function moveCursorToEventStack(
    fileUri: vscode.Uri,
    position: vscode.Position
): Promise<void> {
    const activeEditor = vscode.window.activeTextEditor;
    // in case that active editor is the saved file
    if (
        activeEditor &&
        activeEditor.document.uri.toString() === fileUri.toString()
    ) {
        const selection = new vscode.Selection(position, position);
        activeEditor.selection = selection;
        activeEditor.revealRange(
            selection,
            vscode.TextEditorRevealType.InCenter
        );
    } // in case that active editor is not the saved file
    else {
        const document = await vscode.workspace.openTextDocument(fileUri);
        const editor = await vscode.window.showTextDocument(document);

        const selection = new vscode.Selection(position, position);
        editor.selection = selection;
        editor.revealRange(selection, vscode.TextEditorRevealType.InCenter);
    }
}

export async function automaticallyAddEventStack(
    fileUri: vscode.Uri,
    newlyAddedFunctions: FunctionInfo[]
): Promise<void> {
    if (newlyAddedFunctions.length === 0) {
        return;
    }

    const config = vscode.workspace.getConfiguration("eventstack-helper"); // automatically handles priority (workspace > user > default)

    const isAutoAddEventStackEnabled = config.get<boolean>(
        "autoAddEventStack",
        true
    );
    if (!isAutoAddEventStackEnabled) {
        return;
    }

    const allowedPatterns = config.get<string[]>("allowedFilePatterns", [
        "**/*",
    ]);
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(fileUri);
    const filePathRelativeToWorkspaceRoot = workspaceFolder
        ? vscode.workspace.asRelativePath(fileUri, false)
        : fileUri.fsPath;

    const isFileAllowed = allowedPatterns.some((pattern) => minimatch(filePathRelativeToWorkspaceRoot, pattern));
    if (!isFileAllowed) {
        return;
    }

    const functionsToAddEventStack = newlyAddedFunctions.filter(
        ({ isEventStackSetExists }) => !isEventStackSetExists
    );
    const document = await vscode.workspace.openTextDocument(fileUri);
    let addedFunctionCount = 0;
    let lastEventStackPosition: vscode.Position | null = null;

    for (const functionInfo of functionsToAddEventStack) {
        const eventStackLine = await addEventStackToFunction(
            document,
            functionInfo,
            addedFunctionCount
        );
        lastEventStackPosition = new vscode.Position(eventStackLine + 1, 0);
        addedFunctionCount++;
    }

    await vscode.workspace.save(fileUri);
    if (lastEventStackPosition) {
        // move cursor to the last event stack position
        await moveCursorToEventStack(fileUri, lastEventStackPosition);
    }
}

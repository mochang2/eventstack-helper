import * as vscode from "vscode";

export async function waitForLoadingExtension() {
    const extension = vscode.extensions.getExtension(
        "qjsrodksro.eventstack-helper"
    ) as vscode.Extension<any>;

    if (!extension.isActive) {
        await extension.activate();
    }

    // Wait a bit more for the functionTracker to be initialized
    await new Promise((resolve) => setTimeout(resolve, 100));
}

export async function sleep(ms: number = 200) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function insert(fileUri: vscode.Uri, emptyPosition: vscode.Position, code: string) {
        const edit = new vscode.WorkspaceEdit();
        edit.insert(fileUri, emptyPosition, code);
        await vscode.workspace.applyEdit(edit);
    }

export async function remove(fileUri: vscode.Uri, document: vscode.TextDocument, code: string) {
    const text = document.getText();
    const startOffset = text.indexOf(code);
    const endOffset = startOffset + code.length;

    const edit = new vscode.WorkspaceEdit();
    edit.delete(fileUri, new vscode.Range(
        document.positionAt(startOffset),
        document.positionAt(endOffset)
    ));
    await vscode.workspace.applyEdit(edit);
}

export async function createDocument(filePath: string): Promise<vscode.Uri> {
    await vscode.workspace.fs.writeFile(vscode.Uri.file(filePath), new TextEncoder().encode(""));
    
    return vscode.Uri.file(filePath);
}

export async function deleteDocument(fileUri: vscode.Uri): Promise<void> {
    await vscode.workspace.fs.delete(fileUri);
}

export async function renameDocument(oldFilePath: string, newFilePath: string): Promise<vscode.Uri> {
    await vscode.workspace.fs.rename(vscode.Uri.file(oldFilePath), vscode.Uri.file(newFilePath));
    
    return vscode.Uri.file(newFilePath);
}

export async function setCursorToRandomPositionInCode(
    document: vscode.TextDocument,
    code: string
): Promise<void> {
    const offset = document.getText().indexOf(code);
    const randomOffset = offset + Math.floor(Math.random() * code.length);
    const randomPosition = document.positionAt(randomOffset);
    
    const editor = await vscode.window.showTextDocument(document);
    editor.selection = new vscode.Selection(randomPosition, randomPosition);
    editor.revealRange(new vscode.Range(randomPosition, randomPosition), vscode.TextEditorRevealType.InCenter);
}

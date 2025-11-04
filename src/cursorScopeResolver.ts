import * as vscode from "vscode";
import * as path from "path";
import type { Position, FunctionInfo } from "./types";
import { getFunctionAtCursor } from "./parser";

export class CursorScopeResolver {
    private getCursorPosition(): {
        document: vscode.TextDocument;
        position: Position;
    } | null {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const pos = editor.selection.active;

            return {
                document: editor.document,
                position: {
                    line: pos.line,
                    column: pos.character,
                },
            };
        }

        return null;
    }

    async getFunctionAtCursor(): Promise<{
        functionInfo: FunctionInfo;
        fileUri: vscode.Uri;
    } | null> {
        const cursor = this.getCursorPosition();
        if (!cursor) {
            vscode.window.showErrorMessage(
                "Failed to Add EventStack Manually: Cursor is not focused in any document"
            );

            return null;
        }

        const allowedFileExtensions = [".js", ".ts", ".vue"];
        const fileExtension = path.extname(cursor.document.uri.fsPath);
        if (!allowedFileExtensions.includes(fileExtension)) {
            vscode.window.showErrorMessage(
                `Failed to Add EventStack Manually: File extension "${fileExtension.slice(
                    1
                )}" is not allowed`
            );

            return null;
        }

        const functionInfo = await getFunctionAtCursor(
            cursor.document,
            cursor.position
        );
        if (!functionInfo) {
            vscode.window.showErrorMessage(
                "Failed to Add EventStack Manually: Cursor is not inside a valid function"
            );
            return null;
        }
        if (functionInfo.isEventStackSetExists) {
            vscode.window.showErrorMessage(
                "Failed to Add EventStack Manually: EventStack is already set in the function"
            );
            return null;
        }

        return {
            functionInfo,
            fileUri: cursor.document.uri,
        };
    }
}

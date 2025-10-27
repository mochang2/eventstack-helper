import * as vscode from "vscode";
import { getFunctions } from "./parser";
import type { FunctionInfo } from "./types";

export class FunctionTracker {
    private fileFunctionNamesMap: Map<string, string[]> = new Map();
    private invalidFiles: Set<string> = new Set();
    private validFileGlob = "**/*.{js,ts,vue}";
    private invalidFileGlob =
        "{node_modules,out,dist,build,.nuxt,.next,.output,.vite,coverage,.temp,.cache}/**";

    async initialize(): Promise<void> {
        const files = await vscode.workspace.findFiles(
            this.validFileGlob,
            this.invalidFileGlob
        );

        for (const file of files) {
            const functions = await getFunctions(file);
            if (functions) {
                this.fileFunctionNamesMap.set(
                    file.fsPath,
                    functions.map(({ functionName }) => functionName)
                );
            } else {
                this.invalidFiles.add(file.fsPath);
            }
        }
    }

    async getNewlyAddedFunctions(fileUri: vscode.Uri): Promise<FunctionInfo[]> {
        // if the file was invalid at the last save, skip this file
        if (this.invalidFiles.has(fileUri.fsPath)) {
            return [];
        }

        const currentFunctions = await getFunctions(fileUri);
        if (!currentFunctions) {
            return [];
        }

        const previousFunctionNames =
            this.fileFunctionNamesMap.get(fileUri.fsPath) || [];

        const newlyAddedFunctions = currentFunctions.filter(
            ({ functionName }) => !previousFunctionNames.includes(functionName)
        );

        return newlyAddedFunctions;
    }

    async updateFile(fileUri: vscode.Uri): Promise<void> {
        const functions = await getFunctions(fileUri);
        if (!functions) {
            this.invalidFiles.add(fileUri.fsPath);

            return;
        } else if (this.invalidFiles.has(fileUri.fsPath)) {
            this.invalidFiles.delete(fileUri.fsPath);
        }

        this.fileFunctionNamesMap.set(
            fileUri.fsPath,
            functions.map(({ functionName }) => functionName)
        );
    }
}

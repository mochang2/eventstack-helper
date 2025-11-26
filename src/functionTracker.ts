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
        try {
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
        } catch (error) {
            console.error(`Error initializing FunctionTracker:`, error);
        }
    }

    async getFunctions(fileUri: vscode.Uri): Promise<{
        newlyAddedFunctions: FunctionInfo[],
        currentFunctions: FunctionInfo[] | null 
    }> {
        const currentFunctions = await getFunctions(fileUri);
        if (!currentFunctions) {
            return {
                newlyAddedFunctions: [],
                currentFunctions: null
            };
        }

        // if the file was invalid at the last save, skip this file
        if (this.invalidFiles.has(fileUri.fsPath)) {
            return {
                newlyAddedFunctions: [],
                currentFunctions: currentFunctions
            };
        }

        const previousFunctionNames =
            this.fileFunctionNamesMap.get(fileUri.fsPath) || [];

        const newlyAddedFunctions = currentFunctions.filter(
            ({ functionName }) => !previousFunctionNames.includes(functionName)
        );

        return {
            newlyAddedFunctions: newlyAddedFunctions,
            currentFunctions: currentFunctions
        };
    }

    async updateFile(fileUri: vscode.Uri, functions: FunctionInfo[] | null): Promise<void> {
        if (!functions) {
            this.invalidFiles.add(fileUri.fsPath);

            return;
        }
        
        if (this.invalidFiles.has(fileUri.fsPath)) {
            this.invalidFiles.delete(fileUri.fsPath);
        }

        this.fileFunctionNamesMap.set(
            fileUri.fsPath,
            functions.map(({ functionName }) => functionName)
        );
    }

    migrateFunctionInfo(oldUri: vscode.Uri, newUri: vscode.Uri): void {
        const oldPath = oldUri.fsPath;
        const newPath = newUri.fsPath;

        if (this.fileFunctionNamesMap.has(oldPath)) {
            const functionNames = this.fileFunctionNamesMap.get(oldPath)!;
            this.fileFunctionNamesMap.set(newPath, functionNames);
            this.fileFunctionNamesMap.delete(oldPath);
        }

        if (this.invalidFiles.has(oldPath)) {
            this.invalidFiles.add(newPath);
            this.invalidFiles.delete(oldPath);
        }
    }
}

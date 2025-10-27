import * as vscode from "vscode";
import * as parser from "@babel/parser";
import { parse } from "@vue/compiler-sfc";
import { TextDecoder } from "node:util";
import type { AstResult } from "./types";

function extractScriptFromVue(
    code: string
): { content: string; startLine: number } | null {
    const { descriptor } = parse(code);
    const script = descriptor.script || descriptor.scriptSetup; // // <script> block || <script setup> block

    if (script) {
        return {
            content: script.content,
            startLine: script.loc.start.line - 1,
        };
    }

    return null;
}

export async function getAst(file: vscode.Uri): Promise<AstResult | null> {
    try {
        const fileContent: Uint8Array = await vscode.workspace.fs.readFile(
            file
        );
        const fullCode: string = new TextDecoder().decode(fileContent);

        let codeToParse = fullCode;
        let scriptStartLine = 0; // 0 if not a vue file

        // extract script content if the file is a Vue file
        if (file.fsPath.endsWith(".vue")) {
            const scriptInfo = extractScriptFromVue(fullCode);
            if (!scriptInfo) {
                console.error(
                    `No script tag found in Vue file: ${file.fsPath}`
                );
                return null;
            }
            codeToParse = scriptInfo.content;
            scriptStartLine = scriptInfo.startLine;
        }

        const ast = parser.parse(codeToParse, {
            sourceType: "module", // use es module system
            plugins: ["typescript"],
            errorRecovery: true, // ignore minor syntax errors
        });

        return { ast, scriptStartLine };
    } catch (error) {
        console.error(`Error parsing AST for ${file.fsPath}`, error);
        return null; // return null if file reading or parsing fails
    }
}

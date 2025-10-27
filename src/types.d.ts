import * as parser from "@babel/parser";
import type { File } from "@babel/types";

export type AstResult = {
    ast: parser.ParseResult<File>;
    scriptStartLine: number;
};

export type Position = {
    line: number;
    column: number;
};

export type FunctionInfo = {
    fileName: string;
    functionName: string;
    declarationStartPosition: Position;
    bodyStartPosition: Position;
    params: string[];
    isEventStackSetExists: boolean; // if the event stack is set exists in the function body
};

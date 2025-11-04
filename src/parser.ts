import * as vscode from "vscode";
import traverse from "@babel/traverse";
import type {
    BlockStatement,
    Identifier,
    MemberExpression,
    OptionalMemberExpression,
    FunctionParameter,
    ObjectPattern,
    ObjectProperty,
    ObjectMethod,
    ClassMethod,
    ClassProperty,
    ArrayPattern,
    SourceLocation,
} from "@babel/types";
import { getAst } from "./ast";
import type { FunctionInfo, Position } from "./types";

function extractAllNestedPropertyNames(
    object: MemberExpression | OptionalMemberExpression | Identifier
): Set<string> {
    const names = new Set<string>();

    function traverse(obj: any): void {
        if (!obj) {
            return;
        }

        if (obj.name) {
            names.add(obj.name);
        }

        if (obj.property) {
            names.add(obj.property.name);
        }

        if (obj.expression) {
            traverse(obj.expression);
        }

        if (obj.object) {
            traverse(obj.object);
        }
    }

    traverse(object);

    return names;
}

function isNormalEventStackSetCall(
    callee: MemberExpression | OptionalMemberExpression | Identifier
): boolean {
    const extracted = extractAllNestedPropertyNames(callee);
    const config = vscode.workspace.getConfiguration("eventstack-helper");
    const eventStackFunctionName = config.get<string>(
        "eventStackFunctionName",
        "window.eventStack.set"
    );

    return eventStackFunctionName
        .split(".")
        .every((objectNameOrMethodName) =>
            extracted.has(objectNameOrMethodName)
        );
}

function checkEventStackSetPattern(functionBody: BlockStatement): boolean {
    return functionBody.body.some(
        (node) =>
            node.type === "ExpressionStatement" &&
            (node.expression.type === "CallExpression" ||
                node.expression.type === "OptionalCallExpression") &&
            (node.expression.callee.type === "MemberExpression" ||
                node.expression.callee.type === "OptionalMemberExpression" ||
                node.expression.callee.type === "Identifier") &&
            isNormalEventStackSetCall(node.expression.callee)
    );
}

// only param1, param2, differentNameKey, arrayElement
/*
function externalNormalFunctionWithParameters(
  param1,
  param2, 
  { object, originalKey: differentNameKey, nestedObject: { originalKey: differentNameKey2 }, ...restObject }, 
  [arrayElement, ...restArrayElement],
  ...rest
) {
    // blabla
};
*/
function extractValidParams(params: FunctionParameter[]): string[] {
    return params
        .filter(
            (param) =>
                param.type === "ObjectPattern" ||
                param.type === "ArrayPattern" ||
                param.type === "Identifier"
        )
        .map((param) => {
            if (param.type === "ObjectPattern") {
                return (param as ObjectPattern).properties
                    .filter(
                        (property) =>
                            property.type === "ObjectProperty" &&
                            property.value.type === "Identifier" &&
                            property.value.name
                    )
                    .map(
                        (property) =>
                            ((property as ObjectProperty).value as Identifier)
                                .name
                    );
            } else if (param.type === "ArrayPattern") {
                return (param as ArrayPattern).elements
                    .filter(
                        (element) =>
                            element &&
                            element.type === "Identifier" &&
                            element.name
                    )
                    .map((element) => (element as Identifier).name);
            } else {
                return (param as Identifier).name;
            }
        })
        .flat();
}

// only the below functions are included(whether the params are used or not)
/*
function func() {
    // blabla
}
=> (hasName: true) && (hasBody: true) && (isUseFunctionKeyword: true && isAllocated: false)
*/
/*
const / var / let func = () => {
    // blabla
}
=> (hasName: true) && (hasBody: true) && (isUseFunctionKeyword: false)
*/

// the below functions are excluded(whether the params are used or not)
/*
func() {
    // blabla
}
=> (hasName: false)
*/
/*
const / var / let variable = function() {
    // blabla
}
=> (hasName: false), (isUseFunctionKeyword: true && isAllocated: true)
*/
/*
const / var / let variable = () => "";
=> (hasBody: false)
*/
// return functions in the file
export async function getFunctions(
    file: vscode.Uri
): Promise<FunctionInfo[] | null> {
    const astResult = await getAst(file);
    if (
        !astResult ||
        (astResult.ast.errors && astResult.ast.errors.length > 0)
    ) {
        return null;
    }

    const functions: FunctionInfo[] = [];

    traverse(astResult.ast, {
        // functions declared with function keyword
        FunctionDeclaration(path) {
            // path.node.body.loc.start.line !== path.node.body.loc.end.line: exclude function with single line body
            if (
                path.node.id?.type === "Identifier" &&
                path.node.loc &&
                path.node.body.loc &&
                path.node.body.loc.start.line !== path.node.body.loc.end.line
            ) {
                functions.push({
                    functionName: path.node.id.name,
                    declarationStartPosition: {
                        line:
                            path.node.loc.start.line -
                            1 +
                            astResult.scriptStartLine,
                        column: path.node.loc.start.column,
                    },
                    bodyStartPosition: {
                        line:
                            path.node.body.loc.start.line -
                            1 +
                            astResult.scriptStartLine,
                        column: path.node.body.loc.start.column + 1,
                    },
                    params: extractValidParams(path.node.params),
                    isEventStackSetExists: checkEventStackSetPattern(
                        path.node.body
                    ),
                });
            }
        },
        // functions declared with const / var / let
        VariableDeclarator(path) {
            // path.node.init?.type === "ArrowFunctionExpression": include only arrow function expression
            // path.node.init.body.type === "BlockStatement": exclude arrow function without expression body
            // path.node.init.body.loc.start.line !== path.node.init.body.loc.end.line: exclude arrow function with single line body
            if (
                path.node.id.type === "Identifier" &&
                path.node.init?.type === "ArrowFunctionExpression" &&
                path.node.init.body.type === "BlockStatement" &&
                path.node.loc &&
                path.node.init.body.loc &&
                path.node.init.body.loc.start.line !==
                    path.node.init.body.loc.end.line
            ) {
                functions.push({
                    functionName: path.node.id.name,
                    declarationStartPosition: {
                        line:
                            path.node.loc.start.line -
                            1 +
                            astResult.scriptStartLine,
                        column: path.node.loc.start.column,
                    },
                    bodyStartPosition: {
                        line:
                            path.node.init.body.loc.start.line -
                            1 +
                            astResult.scriptStartLine,
                        column: path.node.init.body.loc.start.column + 1,
                    },
                    params: extractValidParams(path.node.init.params),
                    isEventStackSetExists: checkEventStackSetPattern(
                        path.node.init.body
                    ),
                });
            }
        },
    });

    functions.sort(
        (a, b) =>
            a.declarationStartPosition.line - b.declarationStartPosition.line
    );

    return functions;
}

function isPositionInRange(
    position: Position,
    location: SourceLocation,
    scriptStartLine: number
): boolean {
    const locationStartLine = location.start.line - 1;
    const locationStartColumn = location.start.column;
    const locationEndLine = location.end.line - 1;
    const locationEndColumn = location.end.column;

    return (
        (locationStartLine === position.line - scriptStartLine &&
            locationStartColumn <= position.column) ||
        (locationStartLine < position.line - scriptStartLine &&
            position.line - scriptStartLine < locationEndLine) ||
        (locationEndLine === position.line - scriptStartLine &&
            position.column <= locationEndColumn)
    );
}

function extractObjectKeyName(
    key:
        | ObjectMethod["key"]
        | ObjectProperty["key"]
        | ClassMethod["key"]
        | ClassProperty["key"]
): string | null {
    if (key.type === "Identifier") {
        return key.name;
    } else if (key.type === "StringLiteral") {
        return key.value;
    }
    return null;
}

// return function info that the cursor is in
export async function getFunctionAtCursor(
    document: vscode.TextDocument,
    cursorPosition: Position
): Promise<FunctionInfo | null> {
    const astResult = await getAst(document.uri);
    if (
        !astResult ||
        (astResult.ast.errors && astResult.ast.errors.length > 0)
    ) {
        return null;
    }

    let matchedFunction: FunctionInfo | null = null;

    traverse(astResult.ast, {
        // functions declared with function keyword
        FunctionDeclaration(path) {
            if (
                path.node.id?.type === "Identifier" &&
                path.node.loc &&
                path.node.body.loc &&
                path.node.body.loc.start.line !== path.node.body.loc.end.line &&
                isPositionInRange(
                    cursorPosition,
                    path.node.loc,
                    astResult.scriptStartLine
                )
            ) {
                matchedFunction = {
                    functionName: path.node.id.name,
                    declarationStartPosition: {
                        line:
                            path.node.loc.start.line -
                            1 +
                            astResult.scriptStartLine,
                        column: path.node.loc.start.column,
                    },
                    bodyStartPosition: {
                        line:
                            path.node.body.loc.start.line -
                            1 +
                            astResult.scriptStartLine,
                        column: path.node.body.loc.start.column + 1,
                    },
                    params: extractValidParams(path.node.params),
                    isEventStackSetExists: checkEventStackSetPattern(
                        path.node.body
                    ),
                };
            }
        },
        // functions declared with const / var / let
        VariableDeclarator(path) {
            const parentDeclaration = path.parentPath?.node;
            const declarationLoc = 
                parentDeclaration?.type === "VariableDeclaration" && parentDeclaration.loc
                    ? parentDeclaration.loc // const / var / let declaration
                    : path.node.loc;
            
            if (
                path.node.id.type === "Identifier" &&
                declarationLoc &&
                path.node.id.loc &&
                path.node.loc &&
                path.node.init &&
                isPositionInRange(
                    cursorPosition,
                    {
                        start: declarationLoc.start,
                        end: declarationLoc.end,
                    } as SourceLocation,
                    astResult.scriptStartLine
                )
            ) {
                let functionBody: BlockStatement | null = null;
                let functionParams: FunctionParameter[] = [];
                let bodyLoc: SourceLocation | null = null;

                // arrow function expression: const variableFunction = () => {}
                if (
                    path.node.init.type === "ArrowFunctionExpression" &&
                    path.node.init.body.type === "BlockStatement" &&
                    path.node.init.body.loc
                ) {
                    functionBody = path.node.init.body;
                    functionParams = path.node.init.params;
                    bodyLoc = path.node.init.body.loc;
                }
                // function expression: const variableFunction = function() {} or function name() {}
                else if (
                    path.node.init.type === "FunctionExpression" &&
                    path.node.init.body.type === "BlockStatement" &&
                    path.node.init.body.loc
                ) {
                    functionBody = path.node.init.body;
                    functionParams = path.node.init.params;
                    bodyLoc = path.node.init.body.loc;
                }

                if (
                    functionBody &&
                    bodyLoc &&
                    bodyLoc.start.line !== bodyLoc.end.line
                ) {
                    matchedFunction = {
                        functionName: path.node.id.name,
                        declarationStartPosition: {
                            line:
                                path.node.loc.start.line -
                                1 +
                                astResult.scriptStartLine,
                            column: path.node.loc.start.column,
                        },
                        bodyStartPosition: {
                            line:
                                bodyLoc.start.line -
                                1 +
                                astResult.scriptStartLine,
                            column: bodyLoc.start.column + 1,
                        },
                        params: extractValidParams(functionParams),
                        isEventStackSetExists:
                            checkEventStackSetPattern(functionBody),
                    };
                }
            }
        },
        // IIFE
        CallExpression(path) {
            if (
                path.node.callee.type === "FunctionExpression" &&
                path.node.callee.id?.type === "Identifier" &&
                path.node.callee.body.type === "BlockStatement" &&
                path.node.loc &&
                path.node.callee.body.loc &&
                path.node.callee.body.loc.start.line !==
                    path.node.callee.body.loc.end.line &&
                isPositionInRange(
                    cursorPosition,
                    path.node.loc,
                    astResult.scriptStartLine
                )
            ) {
                matchedFunction = {
                    functionName: path.node.callee.id.name,
                    declarationStartPosition: {
                        line:
                            path.node.loc.start.line -
                            1 +
                            astResult.scriptStartLine,
                        column: path.node.loc.start.column,
                    },
                    bodyStartPosition: {
                        line:
                            path.node.callee.body.loc.start.line -
                            1 +
                            astResult.scriptStartLine,
                        column: path.node.callee.body.loc.start.column + 1,
                    },
                    params: extractValidParams(path.node.callee.params),
                    isEventStackSetExists: checkEventStackSetPattern(
                        path.node.callee.body
                    ),
                };
            }
        },
        // return function name() {}
        ReturnStatement(path) {
            if (
                path.node.argument?.type === "FunctionExpression" &&
                path.node.argument.id?.type === "Identifier" &&
                path.node.argument.body.type === "BlockStatement" &&
                path.node.loc &&
                path.node.argument.body.loc &&
                path.node.argument.body.loc.start.line !==
                    path.node.argument.body.loc.end.line &&
                isPositionInRange(
                    cursorPosition,
                    path.node.loc,
                    astResult.scriptStartLine
                )
            ) {
                matchedFunction = {
                    functionName: path.node.argument.id.name,
                    declarationStartPosition: {
                        line:
                            path.node.loc.start.line -
                            1 +
                            astResult.scriptStartLine,
                        column: path.node.loc.start.column,
                    },
                    bodyStartPosition: {
                        line:
                            path.node.argument.body.loc.start.line -
                            1 +
                            astResult.scriptStartLine,
                        column: path.node.argument.body.loc.start.column + 1,
                    },
                    params: extractValidParams(path.node.argument.params),
                    isEventStackSetExists: checkEventStackSetPattern(
                        path.node.argument.body
                    ),
                };
            }
        },
        // object { method() {} }
        ObjectMethod(path) {
            if (
                path.node.body.type === "BlockStatement" &&
                path.node.loc &&
                path.node.body.loc &&
                path.node.body.loc.start.line !==
                    path.node.body.loc.end.line &&
                isPositionInRange(
                    cursorPosition,
                    path.node.loc,
                    astResult.scriptStartLine
                )
            ) {
                const keyName = extractObjectKeyName(path.node.key);
                if (keyName) {
                    matchedFunction = {
                        functionName: keyName,
                        declarationStartPosition: {
                            line:
                                path.node.loc.start.line -
                                1 +
                                astResult.scriptStartLine,
                            column: path.node.loc.start.column,
                        },
                        bodyStartPosition: {
                            line:
                                path.node.body.loc.start.line -
                                1 +
                                astResult.scriptStartLine,
                            column: path.node.body.loc.start.column + 1,
                        },
                        params: extractValidParams(path.node.params),
                        isEventStackSetExists: checkEventStackSetPattern(
                            path.node.body
                        ),
                    };
                }
            }
        },
        // object { method: () => {} } or object { method: function() {} } or object { method: function name() {} }
        ObjectProperty(path) {
            if (
                path.node.value.type === "ArrowFunctionExpression" &&
                path.node.value.body.type === "BlockStatement" &&
                path.node.value.body.loc &&
                path.node.loc &&
                path.node.value.body.loc.start.line !==
                    path.node.value.body.loc.end.line &&
                isPositionInRange(
                    cursorPosition,
                    path.node.loc,
                    astResult.scriptStartLine
                )
            ) {
                const keyName = extractObjectKeyName(path.node.key);
                if (keyName) {
                    matchedFunction = {
                        functionName: keyName,
                        declarationStartPosition: {
                            line:
                                path.node.loc.start.line -
                                1 +
                                astResult.scriptStartLine,
                            column: path.node.loc.start.column,
                        },
                        bodyStartPosition: {
                            line:
                                path.node.value.body.loc.start.line -
                                1 +
                                astResult.scriptStartLine,
                            column: path.node.value.body.loc.start.column + 1,
                        },
                        params: extractValidParams(path.node.value.params),
                        isEventStackSetExists: checkEventStackSetPattern(
                            path.node.value.body
                        ),
                    };
                }
            } else if (
                path.node.value.type === "FunctionExpression" &&
                path.node.value.body.type === "BlockStatement" &&
                path.node.value.body.loc &&
                path.node.loc &&
                path.node.value.body.loc.start.line !==
                    path.node.value.body.loc.end.line &&
                isPositionInRange(
                    cursorPosition,
                    path.node.loc,
                    astResult.scriptStartLine
                )
            ) {
                const keyName = extractObjectKeyName(path.node.key);
                if (keyName) {
                    matchedFunction = {
                        functionName: keyName,
                        declarationStartPosition: {
                            line:
                                path.node.loc.start.line -
                                1 +
                                astResult.scriptStartLine,
                            column: path.node.loc.start.column,
                        },
                        bodyStartPosition: {
                            line:
                                path.node.value.body.loc.start.line -
                                1 +
                                astResult.scriptStartLine,
                            column: path.node.value.body.loc.start.column + 1,
                        },
                        params: extractValidParams(path.node.value.params),
                        isEventStackSetExists: checkEventStackSetPattern(
                            path.node.value.body
                        ),
                    };
                }
            }
        },
        // class { method() {} }
        ClassMethod(path) {
            if (
                path.node.body.type === "BlockStatement" &&
                path.node.loc &&
                path.node.body.loc &&
                path.node.body.loc.start.line !==
                    path.node.body.loc.end.line &&
                isPositionInRange(
                    cursorPosition,
                    path.node.loc,
                    astResult.scriptStartLine
                )
            ) {
                const keyName = extractObjectKeyName(path.node.key);
                if (keyName) {
                    matchedFunction = {
                        functionName: keyName,
                        declarationStartPosition: {
                            line:
                                path.node.loc.start.line -
                                1 +
                                astResult.scriptStartLine,
                            column: path.node.loc.start.column,
                        },
                        bodyStartPosition: {
                            line:
                                path.node.body.loc.start.line -
                                1 +
                                astResult.scriptStartLine,
                            column: path.node.body.loc.start.column + 1,
                        },
                        params: extractValidParams(
                            path.node.params.filter(
                                (p): p is FunctionParameter =>
                                    p.type !== "TSParameterProperty"
                            )
                        ),
                        isEventStackSetExists: checkEventStackSetPattern(
                            path.node.body
                        ),
                    };
                }
            }
        },
        // class { method = () => {} } or class { method = function() {} } or class { method = function name() {} }
        ClassProperty(path) {
            if (
                path.node.value?.type === "ArrowFunctionExpression" &&
                path.node.value.body.type === "BlockStatement" &&
                path.node.value.body.loc &&
                path.node.loc &&
                path.node.value.body.loc.start.line !==
                    path.node.value.body.loc.end.line &&
                isPositionInRange(
                    cursorPosition,
                    path.node.loc,
                    astResult.scriptStartLine
                )
            ) {
                const keyName = extractObjectKeyName(path.node.key);
                if (keyName) {
                    matchedFunction = {
                        functionName: keyName,
                        declarationStartPosition: {
                            line:
                                path.node.loc.start.line -
                                1 +
                                astResult.scriptStartLine,
                            column: path.node.loc.start.column,
                        },
                        bodyStartPosition: {
                            line:
                                path.node.value.body.loc.start.line -
                                1 +
                                astResult.scriptStartLine,
                            column: path.node.value.body.loc.start.column + 1,
                        },
                        params: extractValidParams(path.node.value.params),
                        isEventStackSetExists: checkEventStackSetPattern(
                            path.node.value.body
                        ),
                    };
                }
            } else if (
                path.node.value?.type === "FunctionExpression" &&
                path.node.value.body.type === "BlockStatement" &&
                path.node.value.body.loc &&
                path.node.loc &&
                path.node.value.body.loc.start.line !==
                    path.node.value.body.loc.end.line &&
                isPositionInRange(
                    cursorPosition,
                    path.node.loc,
                    astResult.scriptStartLine
                )
            ) {
                const keyName = extractObjectKeyName(path.node.key);
                if (keyName) {
                    matchedFunction = {
                        functionName: keyName,
                        declarationStartPosition: {
                            line:
                                path.node.loc.start.line -
                                1 +
                                astResult.scriptStartLine,
                            column: path.node.loc.start.column,
                        },
                        bodyStartPosition: {
                            line:
                                path.node.value.body.loc.start.line -
                                1 +
                                astResult.scriptStartLine,
                            column: path.node.value.body.loc.start.column + 1,
                        },
                        params: extractValidParams(path.node.value.params),
                        isEventStackSetExists: checkEventStackSetPattern(
                            path.node.value.body
                        ),
                    };
                }
            }
        },
    });

    return matchedFunction;
}

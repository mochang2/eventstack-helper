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
    ArrayPattern,
} from "@babel/types";
import { getAst } from "./ast";
import type { FunctionInfo } from "./types";

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

    return eventStackFunctionName.split(".").every((objectNameOrMethodName) => extracted.has(objectNameOrMethodName));
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
        FunctionDeclaration: {
            enter: (path) => {
                // path.node.body.loc.start.line !== path.node.body.loc.end.line: exclude function with single line body
                if (
                    path.node.id?.type === "Identifier" &&
                    path.node.loc &&
                    path.node.body.loc &&
                    path.node.body.loc.start.line !==
                        path.node.body.loc.end.line
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
        },
        // functions declared with const / var / let
        VariableDeclarator: {
            enter: (path) => {
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
        },
        // functions declared inside an object are not included
        // ObjectExpression: {},
    });

    functions.sort(
        (a, b) =>
            a.declarationStartPosition.line - b.declarationStartPosition.line
    );

    return functions;
}

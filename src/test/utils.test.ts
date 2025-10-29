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

import { defineConfig } from "@vscode/test-cli";

export default defineConfig([
    {
        label: "js automatically adding event stack tests",
        files: "out/test/js-automatic.test.js",
        workspaceFolder: "./fixtures/js",
        mocha: {
            timeout: 10000, // 10s
            slow: 2000, // 2s
        },
    },
    {
        label: "ts automatically adding event stack tests",
        files: "out/test/ts-automatic.test.js",
        workspaceFolder: "./fixtures/ts",
        mocha: {
            timeout: 10000, // 10s
            slow: 2000, // 2s
        },
    },
    {
        label: "js manually adding event stack tests",
        files: "out/test/js-manual.test.js",
        workspaceFolder: "./fixtures/js",
        mocha: {
            timeout: 10000, // 10s
            slow: 2000, // 2s
        },
    },
    {
        label: "ts manually adding event stack tests",
        files: "out/test/ts-manual.test.js",
        workspaceFolder: "./fixtures/ts",
        mocha: {
            timeout: 10000, // 10s
            slow: 2000, // 2s
        },
    },
]);

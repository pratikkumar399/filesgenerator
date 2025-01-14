import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    // Register the "Generate Component" command
    const disposable = vscode.commands.registerCommand(
        'extension.generateComponent',
        async (uri: vscode.Uri) => {
            if (uri && uri.fsPath) {
                const folderPath = uri.fsPath;

                // Prompt the user for a component name
                const componentName = await vscode.window.showInputBox({
                    prompt: 'Enter the component name',
                    placeHolder: 'ComponentName',
                });

                if (!componentName) {
                    vscode.window.showErrorMessage('Component name is required.');
                    return;
                }

                // Generate the files
                await createFiles(folderPath, componentName);
            }
        }
    );

    context.subscriptions.push(disposable);
}

async function createFiles(folderPath: string, componentName: string) {
    const fileNames = [
        `${componentName}.ts`,
        `${componentName}.module.scss`,
        `index.ts`
    ];

    for (const fileName of fileNames) {
        const filePath = path.join(folderPath, fileName);
        const fileUri = vscode.Uri.file(filePath);

        const content = getFileContent(fileName, componentName);

        try {
            await vscode.workspace.fs.writeFile(fileUri, Buffer.from(content));
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create file ${filePath}: ${error}`);
        }
    }

    vscode.window.showInformationMessage(`Component "${componentName}" generated successfully.`);
}

function getFileContent(fileName: string, componentName: string): string {
    if (fileName.endsWith('.module.scss')) {
        return `/* Styles for ${componentName} */`;
    } else if (fileName === 'index.ts') {
        return `export { default } from './${componentName}';`;
    } else {
        return `// Logic for ${componentName}`;
    }
}

export function deactivate() {}

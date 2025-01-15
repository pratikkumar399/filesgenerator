import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    // Register the "Generate Component" command
    const disposable = vscode.commands.registerCommand(
        'filesgenerator.generateComponent',
        async (uri: vscode.Uri) => {
            if (uri && uri.fsPath) {
                const folderPath = uri.fsPath;
                const componentName = path.basename(folderPath);

                await createFiles(folderPath, componentName);
            }
        }
    );
    context.subscriptions.push(disposable);
}

async function createFiles(folderPath: string, componentName: string) {
    const fileNames = [
        `${componentName}.tsx`,
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
        return `.root{}`;
    } else if (fileName === 'index.ts') {
        return `export { ${componentName} as default } from './${componentName}';`;
    } else {
        return `
import React from 'react';
import s from './${componentName}.module.scss';

export const ${componentName} = () => {
    return (
        <div className={s.root}>
            
        </div>
    )}
        `;
    }
}

export function deactivate() {}

import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    // Register the "Generate Component" command
    const disposable = vscode.commands.registerCommand(
        'filesgenerator.generateComponent',
        async (uri: vscode.Uri) => {
            if (uri && uri.fsPath) {
                // Prompt user for the folder name
                const folderName = await vscode.window.showInputBox({
                    prompt: 'Enter the folder name for the new component:',
                    placeHolder: 'ComponentName',
                });

                if (!folderName) {
                    vscode.window.showErrorMessage('Folder name cannot be empty.');
                    return;
                }

                // Validate the folder name
                if (!isValidFolderName(folderName)) {
                    vscode.window.showErrorMessage(
                        'Invalid folder name. Try creating with a different folder name (e.g. MyComponent , myComponent, etc)).'
                    );
                    return;
                }

                const folderPath = path.join(uri.fsPath, folderName);

                try {
                    // Create the new folder
                    await vscode.workspace.fs.createDirectory(vscode.Uri.file(folderPath));

                    // Generate the component files in the new folder
                    await createFiles(folderPath, folderName);
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to create folder or files: ${error}`);
                }
            } else {
                vscode.window.showErrorMessage('No folder selected. Right-click on a folder and try again.');
            }
        }
    );
    context.subscriptions.push(disposable);
}

function isValidFolderName(name: string): boolean {
    // Validation: should not start with a number and should not contain special characters.
    const validFolderNameRegex = /^[A-Za-z][A-Za-z0-9]*$/;
    return validFolderNameRegex.test(name);
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
import styles from './${componentName}.module.scss';

const ${componentName} = () => {
    return (
        <div className={s.root}>
            
        </div>
)};
        `;
    }
}

export function deactivate() {}

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { RTKCodeLensProvider } from './definitionProvider';
import { findEndpointDefinition } from './endpointFinder';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('RTK Map Hook Navigator is now active!');

	// Register the navigation command
	const navigateCommand = vscode.commands.registerCommand('rtk-map.navigateToEndpoint', async (documentUri: string, endpointName: string) => {
		const uri = vscode.Uri.parse(documentUri);
		const document = await vscode.workspace.openTextDocument(uri);
		const location = findEndpointDefinition(document, endpointName);

		if (location) {
			await vscode.window.showTextDocument(document);
			const editor = vscode.window.activeTextEditor;
			if (editor) {
				editor.revealRange(location.range, vscode.TextEditorRevealType.InCenter);
				editor.selection = new vscode.Selection(location.range.start, location.range.end);
			}
		} else {
			vscode.window.showInformationMessage(`RTK Map: Could not find endpoint "${endpointName}"`);
		}
	});

	// Register the CodeLens provider for TypeScript files
	const provider = new RTKCodeLensProvider();
	const codeLensDisposable = vscode.languages.registerCodeLensProvider(
		{ language: 'typescript' },
		provider
	);

	context.subscriptions.push(navigateCommand, codeLensDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

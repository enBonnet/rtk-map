import * as vscode from 'vscode';
import { RTKCodeLensProvider } from './definitionProvider';
import { findEndpointDefinition } from './endpointFinder';

export function activate(context: vscode.ExtensionContext) {
  const navigateCommand = vscode.commands.registerCommand(
    'rtk-map.navigateToEndpoint',
    async (documentUri: string, endpointName: string) => {
      const uri = vscode.Uri.parse(documentUri);
      const document = await vscode.workspace.openTextDocument(uri);
      const location = findEndpointDefinition(document, endpointName);

      if (location) {
        await vscode.window.showTextDocument(document);
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          editor.revealRange(
            location.range,
            vscode.TextEditorRevealType.InCenter
          );
          editor.selection = new vscode.Selection(
            location.range.start,
            location.range.end
          );
        }
      } else {
        vscode.window.showInformationMessage(
          `RTK Map: Could not find endpoint "${endpointName}"`
        );
      }
    }
  );

  const provider = new RTKCodeLensProvider();
  const codeLensDisposable = vscode.languages.registerCodeLensProvider(
    { language: 'typescript' },
    provider
  );

  context.subscriptions.push(navigateCommand, codeLensDisposable);
}

export function deactivate() {}

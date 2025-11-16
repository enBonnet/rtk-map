import * as vscode from 'vscode';
import { parseHookNameToEndpoint } from './nameParser';
import { findEndpointDefinition } from './endpointFinder';

/**
 * CodeLensProvider for RTK Query hooks
 * Adds clickable CodeLens above hook names showing endpoint names
 */
export class RTKCodeLensProvider implements vscode.CodeLensProvider {
    provideCodeLenses(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CodeLens[]> {
        const codeLenses: vscode.CodeLens[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        const exportPattern = /^\s*export\s+const\s*\{\s*$/;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (exportPattern.test(line)) {
                let braceCount = 1;
                let destructuringEnd = -1;

                for (let j = i + 1; j < lines.length; j++) {
                    const currentLine = lines[j];

                    const openBraces = (currentLine.match(/\{/g) || []).length;
                    const closeBraces = (currentLine.match(/\}/g) || []).length;
                    braceCount += openBraces - closeBraces;

                    if (braceCount === 0) {
                        const assignmentMatch = currentLine.match(/^\s*\}\s*=\s*(\w+)\s*;?\s*$/);
                        if (assignmentMatch) {
                            destructuringEnd = j;
                            break;
                        }
                    }
                }

                if (destructuringEnd !== -1) {
                    const hooks: Array<{ name: string; line: number; column: number }> = [];

                    for (let k = i + 1; k < destructuringEnd; k++) {
                        const currentLine = lines[k];
                        const parts = currentLine.split(',');
                        for (const part of parts) {
                            const trimmed = part.trim();
                            if (trimmed && /^\s*use[A-Z]/.test(trimmed)) {
                                const hookIndex = currentLine.indexOf(trimmed);
                                if (hookIndex !== -1) {
                                    hooks.push({
                                        name: trimmed,
                                        line: k,
                                        column: hookIndex
                                    });
                                }
                            }
                        }
                    }

                    for (const hook of hooks) {
                        const endpointName = parseHookNameToEndpoint(hook.name);
                        if (endpointName) {
                            const position = new vscode.Position(hook.line, hook.column);
                            const range = new vscode.Range(position, new vscode.Position(hook.line, hook.column + hook.name.length));

                            const codeLens = new vscode.CodeLens(range, {
                                title: `→ ${endpointName}`,
                                command: 'rtk-map.navigateToEndpoint',
                                arguments: [document.uri.toString(), endpointName]
                            });

                            codeLenses.push(codeLens);
                        }
                    }
                }
            }
        }

        return codeLenses;
    }
}
import * as vscode from 'vscode';
import { parseHookNameToEndpoint } from './nameParser';

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

    // First, handle single-line destructuring
    const singleLinePattern =
      /^\s*export\s+const\s*\{\s*([^}]+)\s*\}\s*=\s*(\w+)\s*;?\s*$/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const singleMatch = line.match(singleLinePattern);

      if (singleMatch) {
        const destructuredItems = singleMatch[1];
        const sliceName = singleMatch[2];

        // Split by comma and clean up whitespace
        const hooks = destructuredItems.split(',').map((h) => h.trim());

        for (const hook of hooks) {
          const endpointName = parseHookNameToEndpoint(hook);
          if (endpointName) {
            // Find the position of the hook in the line
            const hookIndex = line.indexOf(hook);
            if (hookIndex !== -1) {
              const position = new vscode.Position(i, hookIndex);
              const range = new vscode.Range(
                position,
                new vscode.Position(i, hookIndex + hook.length)
              );

              const codeLens = new vscode.CodeLens(range, {
                title: `→ ${endpointName}`,
                command: 'rtk-map.navigateToEndpoint',
                arguments: [document.uri.toString(), endpointName],
              });

              codeLenses.push(codeLens);
            }
          }
        }
      }
    }

    // Then, handle multi-line destructuring
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
            // Look for } = variableName pattern, possibly with content before }
            const assignmentMatch = currentLine.match(
              /\}\s*=\s*(\w+)\s*;?\s*$/
            );
            if (assignmentMatch) {
              destructuringEnd = j;
              break;
            }
          }
        }

        if (destructuringEnd !== -1) {
          const hooks: Array<{ name: string; line: number; column: number }> =
            [];

          // Process all lines from the opening brace to the closing line
          for (let k = i + 1; k <= destructuringEnd; k++) {
            const currentLine = lines[k];
            // For the closing line, only process content before the closing brace
            let lineToProcess = currentLine;
            if (k === destructuringEnd) {
              const braceIndex = currentLine.indexOf('}');
              if (braceIndex !== -1) {
                lineToProcess = currentLine.substring(0, braceIndex);
              }
            }

            const parts = lineToProcess.split(',');
            for (const part of parts) {
              const trimmed = part.trim();
              if (trimmed && /^\s*use[A-Z]/.test(trimmed)) {
                const hookIndex = currentLine.indexOf(trimmed);
                if (hookIndex !== -1) {
                  hooks.push({
                    name: trimmed,
                    line: k,
                    column: hookIndex,
                  });
                }
              }
            }
          }

          for (const hook of hooks) {
            const endpointName = parseHookNameToEndpoint(hook.name);
            if (endpointName) {
              const position = new vscode.Position(hook.line, hook.column);
              const range = new vscode.Range(
                position,
                new vscode.Position(hook.line, hook.column + hook.name.length)
              );

              const codeLens = new vscode.CodeLens(range, {
                title: `→ ${endpointName}`,
                command: 'rtk-map.navigateToEndpoint',
                arguments: [document.uri.toString(), endpointName],
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

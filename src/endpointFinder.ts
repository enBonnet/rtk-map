import * as vscode from 'vscode';

/**
 * Finds the location of an RTK Query endpoint definition in a document
 * @param document The VSCode text document to search in
 * @param endpointName The endpoint name to find (e.g., "getCashbackRewards")
 * @returns The location of the endpoint definition, or null if not found
 */
export function findEndpointDefinition(
  document: vscode.TextDocument,
  endpointName: string
): vscode.Location | null {
  const text = document.getText();
  const lines = text.split('\n');

  const endpointPattern = new RegExp(
    `^\\s*${endpointName}\\s*:\\s*builder\\.(query|mutation)\\s*[<(]`
  );

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (endpointPattern.test(line)) {
      const nameMatch = line.match(new RegExp(`(\\s*${endpointName}\\s*:)`));
      if (nameMatch) {
        const startIndex = line.indexOf(nameMatch[1]);
        const startPosition = new vscode.Position(i, startIndex);
        const endPosition = new vscode.Position(
          i,
          startIndex + nameMatch[1].length
        );
        const range = new vscode.Range(startPosition, endPosition);
        return new vscode.Location(document.uri, range);
      }
    }
  }

  return null;
}

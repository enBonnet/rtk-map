/**
 * Converts RTK Query hook names to their corresponding endpoint names
 * @param hookName The hook name (e.g., "useGetCashbackRewardsQuery")
 * @returns The endpoint name (e.g., "getCashbackRewards")
 */
export function parseHookNameToEndpoint(hookName: string): string | null {
  const hookPattern = /^use(Lazy)?([A-Z][a-zA-Z0-9]*)(Query|Mutation)$/;
  const match = hookName.match(hookPattern);

  if (!match) {
    return null;
  }

  const [, , pascalCaseName] = match;

  const camelCaseName =
    pascalCaseName.charAt(0).toLowerCase() + pascalCaseName.slice(1);

  return camelCaseName;
}

# RTK Map Hook Navigator

A VSCode extension that provides intelligent "Go to Definition" functionality for auto-generated RTK Query hooks, allowing you to navigate directly from exported hooks to their endpoint definitions.[10]

## Overview

When working with Redux Toolkit Query (RTK Query), hooks are automatically generated from your endpoint definitions. This extension bridges the gap between the auto-generated hooks (like `useGetCashbackRewardsQuery`) and their source endpoint definitions (like `getCashbackRewards: builder.query`), enabling seamless navigation with Ctrl+Click or F12.[11][12]

## Problem Statement

RTK Query automatically generates React hooks from endpoint definitions using a naming convention:
- `builder.query` endpoints → `use[EndpointName]Query`
- `builder.mutation` endpoints → `use[EndpointName]Mutation`  
- Lazy queries → `useLazy[EndpointName]Query`

However, TypeScript's native "Go to Definition" doesn't work for these auto-generated hooks because they don't exist as explicit function declarations in your code. This extension solves that problem by implementing custom definition resolution.[10]

## Features

- **Smart Hook Detection**: Recognizes RTK Query hook patterns (`useXxxQuery`, `useXxxMutation`, `useLazyXxxQuery`)
- **Automatic Name Mapping**: Converts hook names back to endpoint names (e.g., `useGetCashbackRewardsQuery` → `getCashbackRewards`)
- **Instant Navigation**: Jump from exported hooks to their endpoint definitions with F12 or Ctrl+Click
- **TypeScript Support**: Works seamlessly with TypeScript files in your RTK Query slices
- **Zero Configuration**: Works out of the box with standard RTK Query patterns

## How RTK Query Generates Hooks

RTK Query uses a predictable naming convention to auto-generate hooks:[12][11]

1. Takes the endpoint name (e.g., `getCashbackRewards`)
2. Converts to PascalCase with "use" prefix (e.g., `useGetCashbackRewards`)
3. Adds the appropriate suffix based on endpoint type:
   - **Queries**: `Query` suffix → `useGetCashbackRewardsQuery`
   - **Mutations**: `Mutation` suffix → `useReferralMutation`
   - **Lazy Queries**: `LazyQuery` prefix and suffix → `useLazyGetRedeemCashbackRewardQuery`

The hooks are generated when you import from `'@reduxjs/toolkit/query/react'` and are attached to both the API slice object and individual endpoints.[13][11]

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Press F5 to launch the extension in a development VSCode window
4. Open any TypeScript file containing RTK Query slices

## Usage

### Example Slice File

```typescript
export const cashbackSlice = baseSlice.injectEndpoints({
  endpoints(builder) {
    return {
      getCashbackRewards: builder.query<CashbackRewardsResponse, void>({
        query() {
          return {
            url: `${urlPaths.cashbackRewards}`,
            method: 'GET',
          }
        },
        providesTags: ['Cashback', 'Points'],
      }),
      referral: builder.mutation<ReferralResponse, { linkId: string; email: string }>({
        query(body) {
          return {
            url: `${urlPaths.referral}/${body.linkId}`,
            method: 'POST',
            body: { email: body.email },
          }
        },
        invalidatesTags: ['Points'],
      }),
    }
  },
})

export const {
  useGetCashbackRewardsQuery,  // ← Ctrl+Click here
  useReferralMutation,          // ← or here
} = cashbackSlice
```

### Navigation Actions

- **Ctrl+Click** (or Cmd+Click on Mac) on any exported hook name
- Press **F12** while cursor is on a hook name
- Right-click and select **"Go to Definition"**

The extension will navigate you directly to the corresponding endpoint definition within the `injectEndpoints` block.

## Implementation Details

### Architecture

The extension uses VSCode's `DefinitionProvider` API to implement custom navigation logic:[10]

1. **Registration**: Registers a definition provider for TypeScript files
2. **Pattern Matching**: Detects RTK Query hook patterns using regex
3. **Name Parsing**: Extracts endpoint name by:
   - Removing "use" prefix
   - Removing "Query", "Mutation", or "LazyQuery" suffix
   - Converting PascalCase to camelCase
4. **Definition Search**: Searches the document for the endpoint definition
5. **Location Return**: Returns a `vscode.Location` pointing to the endpoint

### Core Components

- **extension.ts**: Main activation and provider registration
- **definitionProvider.ts**: Custom `DefinitionProvider` implementation
- **nameParser.ts**: Logic to convert hook names to endpoint names
- **endpointFinder.ts**: Search logic to locate endpoint definitions

## Supported Patterns

- ✅ Standard queries: `useGetXxxQuery`
- ✅ Standard mutations: `useXxxMutation`
- ✅ Lazy queries: `useLazyGetXxxQuery`
- ✅ Multi-word endpoint names: `useGetCashbackEarningActionAssignmentsByUserQuery`
- ✅ Single-word endpoint names: `useReferralMutation`

## Limitations

- Only works within the same file (doesn't follow imports across files)
- Requires standard RTK Query naming conventions
- Works with `injectEndpoints` pattern only

## Use Case for LLMs

This README provides comprehensive context for LLMs to understand:
- The problem this extension solves
- How RTK Query's hook auto-generation works
- The technical implementation approach
- Expected behavior and usage patterns

When using this as context, LLMs can help with:
- Extending the extension to support cross-file navigation
- Adding support for custom naming conventions
- Implementing additional features like reverse navigation (endpoint → hooks)
- Debugging and troubleshooting definition resolution issues

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Run in development mode
Press F5 in VSCode

# Package extension
vsce package
```

## Contributing

Contributions are welcome! Please ensure your code follows the existing patterns and includes appropriate type definitions.

## License

MIT

## Related Documentation

- [RTK Query Documentation](https://redux-toolkit.js.org/rtk-query/overview)
- [VSCode Extension API](https://code.visualstudio.com/api)
- [DefinitionProvider API](https://code.visualstudio.com/api/references/vscode-api#DefinitionProvider)

[1](https://github.com/oGranny/readme-template-extension)
[2](https://code.visualstudio.com/docs/languages/markdown)
[3](https://marketplace.visualstudio.com/items?itemName=Anonknowsit.readme-template-generator)
[4](https://www.youtube.com/watch?v=jeOfS90Flf8)
[5](https://dev.to/sourishkrout/run-your-readmemd-in-vs-code-50l7)
[6](https://www.makeareadme.com)
[7](https://marketplace.visualstudio.com/items?itemName=thomascsd.vscode-readme-pattern)
[8](https://code.visualstudio.com/api/extension-guides/markdown-extension)
[9](https://code.visualstudio.com/api/extension-guides/overview)
[10](https://code.visualstudio.com/api/language-extensions/programmatic-language-features)
[11](https://redux-toolkit.js.org/rtk-query/api/created-api/hooks)
[12](https://stackoverflow.com/questions/69502501/redux-rtk-not-auto-generating-react-hooks)
[13](https://www.reddit.com/r/reactjs/comments/10lwhx9/is_there_a_different_way_of_accessing_the_hooks/)
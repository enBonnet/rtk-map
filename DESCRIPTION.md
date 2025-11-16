# RTK Map Hook Navigator

A VSCode extension that provides intelligent navigation from Redux Toolkit Query (RTK Query) auto-generated hooks directly to their endpoint definitions using CodeLens annotations.

## 🎯 Overview

When working with RTK Query, hooks are automatically generated from endpoint definitions. This extension bridges the gap by adding clickable CodeLens annotations above hook names that show the corresponding endpoint name and allow instant navigation with a single click.

## ✨ Features

- **Smart CodeLens Detection**: Automatically detects RTK Query hook destructuring patterns
- **Instant Navigation**: Click CodeLens to jump to endpoint definitions
- **Multiple Format Support**: Handles all common RTK Query export patterns
- **TypeScript Support**: Works seamlessly with TypeScript files
- **Zero Configuration**: Works out of the box with standard RTK Query patterns

## 🔍 How It Works

The extension analyzes your TypeScript files and adds CodeLens annotations above RTK Query hook names. Each annotation shows `→ endpointName` and clicking it navigates to the corresponding `builder.query` or `builder.mutation` definition.

### Hook Name Parsing

The extension intelligently converts hook names to endpoint names:

| Hook Name | Endpoint Name |
|-----------|---------------|
| `useGetPokemonByNameQuery` | `getPokemonByName` |
| `useCreateUserMutation` | `createUser` |
| `useLazyFetchPostsQuery` | `fetchPosts` |

## 📋 Supported Patterns

### 1. Single-Line Destructuring
```typescript
// CodeLens: → getPokemonByName
export const { useGetPokemonByNameQuery } = pokemonApi
```

### 2. Multi-Line Destructuring (Closing Brace on Separate Line)
```typescript
export const {
  // CodeLens: → getPokemonByName
  useGetPokemonByNameQuery,
  // CodeLens: → createUser
  useCreateUserMutation,
  // CodeLens: → fetchPosts
  useLazyFetchPostsQuery
} = api
```

### 3. Multi-Line Destructuring (Closing Brace on Same Line)
```typescript
export const {
  // CodeLens: → getPokemonByName
  useGetPokemonByNameQuery,
  // CodeLens: → createUser
  useCreateUserMutation,
  // CodeLens: → fetchPosts
  useLazyFetchPostsQuery } = api
```

## 🏗️ Architecture

### Core Components

#### `src/extension.ts`
- Main extension activation and registration
- Registers the CodeLens provider for TypeScript files
- Handles the navigation command that jumps to endpoint definitions

#### `src/definitionProvider.ts`
- Implements VSCode's `CodeLensProvider` interface
- Detects RTK Query hook destructuring patterns using regex
- Supports both single-line and multi-line export formats
- Creates CodeLens annotations with endpoint names

#### `src/nameParser.ts`
- Converts hook names to endpoint names using regex patterns
- Handles `useXxxQuery`, `useXxxMutation`, and `useLazyXxxQuery` formats
- Converts PascalCase to camelCase

#### `src/endpointFinder.ts`
- Searches for endpoint definitions in the current document
- Uses regex to find `endpointName: builder.(query|mutation)` patterns
- Returns VSCode Location for navigation

## 🎮 Usage

1. **Install** the extension
2. **Open** a TypeScript file containing RTK Query slices
3. **Look** for CodeLens annotations above hook names (may need to enable CodeLens in VSCode)
4. **Click** the `→ endpointName` annotation to navigate to the definition

### Enabling CodeLens

If you don't see the annotations:
- Go to VSCode settings
- Search for "CodeLens"
- Ensure "Editor: Code Lens" is enabled

## 🔧 Technical Details

### Hook Pattern Recognition
```regex
/^use(Lazy)?([A-Z][a-zA-Z0-9]*)(Query|Mutation)$/
```

### Endpoint Pattern Matching
```regex
/^\s*endpointName\s*:\s*builder\.(query|mutation)\s*[<(]/
```

### Destructuring Pattern Detection
- **Single-line**: `/^\s*export\s+const\s*\{\s*([^}]+)\s*\}\s*=\s*(\w+)\s*;?\s*$/`
- **Multi-line start**: `/^\s*export\s+const\s*\{\s*$/`
- **Multi-line end**: `/\}\s*=\s*(\w+)\s*;?\s*$/`

## 📝 Examples

### Complete RTK Query Slice
```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const pokemonApi = createApi({
  reducerPath: 'pokemonApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://pokeapi.co/api/v2/' }),
  endpoints: (builder) => ({
    // ← CodeLens clicks navigate here
    getPokemonByName: builder.query<Pokemon, string>({
      query: (name) => `pokemon/${name}`,
    }),
    createPokemon: builder.mutation<Pokemon, Partial<Pokemon>>({
      query: (pokemon) => ({
        url: 'pokemon',
        method: 'POST',
        body: pokemon,
      }),
    }),
  }),
})

// CodeLens annotations appear above each hook
export const {
  useGetPokemonByNameQuery,    // → getPokemonByName
  useCreatePokemonMutation,    // → createPokemon
} = pokemonApi
```

### Complex Multi-Line Export
```typescript
// Group queries and mutations for better organization
// Queries (read operations)
export const {
  useFetchItemsQuery,            // → fetchItems
  useFetchItemQuery,             // → fetchItem
  useFetchPreviouslyPurchasedSubItemsQuery, // → fetchPreviouslyPurchasedSubItems
} = itemsSlice

// Mutations (write operations)
export const {
  useAddSubItemInItemMutation,    // → addSubItemInItem
  useCreateItemMutation,          // → createItem
  useDeleteItemMutation,          // → deleteItem
  useDeleteSubItemInItemMutation, // → deleteSubItemInItem
  useDuplicateItemMutation,       // → duplicateItem
  useMoveSubItemsInItemMutation,  // → moveSubItemsInItem
  usePinItemMutation,             // → pinItem
  useRenameItemMutation,          // → renameItem
  useUpdateItemsRankedMutation,   // → updateItemsRanked
} = itemsSlice
```

## 🚀 Installation & Development

### Installation
1. Clone this repository
2. Run `npm install`
3. Press F5 to launch in development mode
4. Open any TypeScript file with RTK Query hooks

### Development
```bash
npm run compile    # Build the extension
npm run watch      # Watch mode for development
```

## 🎯 Use Cases

- **Large RTK Query slices** with many endpoints
- **Team collaboration** where hook usage and definitions are in different parts of files
- **Code reviews** to quickly understand hook-to-endpoint relationships
- **Refactoring** to locate endpoint definitions from hook usage

## 🔮 Future Enhancements

- Cross-file navigation (hooks imported from other files)
- Support for custom RTK Query naming conventions
- Integration with RTK Query devtools
- Reverse navigation (endpoint → hooks)

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please ensure code follows existing patterns and includes appropriate TypeScript types.

---

**Made with ❤️ for the RTK Query community**
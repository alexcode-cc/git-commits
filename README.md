# @alexcode-cc/git-commits

**[繁體中文版 (Traditional Chinese)](./README-CHT.md)**

Git Commits Management Toolkit - Generate commit lists and batch branch operations

[![npm version](https://badge.fury.io/js/%40alexcode-cc%2Fgit-commits.svg)](https://www.npmjs.com/package/@alexcode-cc/git-commits)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔍 **Generate commit lists** - Organize all commits from a specified branch into a formatted list
- 🌿 **Batch create branches** - Automatically create branches based on commit lists
- 🗑️ **Batch delete branches** - Delete branches in batches based on sequence number ranges
- 📦 **Programmatic usage** - Provides complete TypeScript API
- 🖥️ **CLI tool** - Convenient command-line interface
- 📝 **Uses .log extension** - Defaults to `git-commits.log` output to avoid Git tracking
- 🌍 **Multi-language support** - English, Traditional Chinese (--CHT), and Simplified Chinese (--CHS)

## Installation

```bash
# Using npm
npm install -g @alexcode-cc/git-commits

# Using pnpm
pnpm add -g @alexcode-cc/git-commits

# Using yarn
yarn global add @alexcode-cc/git-commits
```

## CLI Usage

### Generate Commit List

```bash
# Use default settings (auto-detect branch, output to git-commits.log)
git-commits generate

# Specify branch
git-commits generate main

# Specify output file (will automatically convert to .log extension)
# If you input my-commits.txt, the actual output will be forced to my-commits.log
git-commits generate develop -o my-commits.log

# Include merge commits
git-commits generate develop -m

# Use Traditional Chinese language
git-commits generate --CHT

# Use Simplified Chinese language
git-commits generate --CHS
```

### Batch Create Branches

```bash
# Create all branches
git-commits create

# Create branches in specified range (0001 to 0010)
git-commits create git-commits.log 0001 0010

# Create only a single branch (0080)
git-commits create 0080

# Skip confirmation prompt
git-commits create 0001 0010 -y

# Use Traditional Chinese language
git-commits create --CHT
```

### Batch Delete Branches

```bash
# Delete all branches (will list branches and require confirmation)
git-commits delete

# Delete branches in specified range
git-commits delete git-commits.log 0001 0010

# Delete only a single branch
git-commits delete 0080

# Skip confirmation prompt
git-commits delete 0001 0010 -y

# Use Traditional Chinese language
git-commits delete --CHT
```

## Programmatic Usage

### Basic Usage

```typescript
import {
  generateCommits,
  createBranches,
  deleteBranches,
} from '@alexcode-cc/git-commits';

// Generate commit list
const commits = await generateCommits({
  branch: 'develop',
  outputFile: 'git-commits.log',
});

// Batch create branches
const createResult = await createBranches({
  commitsFile: 'git-commits.log',
  startSeq: 1,
  endSeq: 10,
  skipConfirm: true,
});

// Batch delete branches
const deleteResult = await deleteBranches({
  commitsFile: 'git-commits.log',
  startSeq: 1,
  endSeq: 10,
  skipConfirm: true,
});
```

### Advanced Usage

```typescript
import {
  parseCommitsFile,
  filterCommitsByRange,
  isGitRepository,
  getCurrentBranch,
  createBranch,
  deleteBranch,
} from '@alexcode-cc/git-commits';

// Check if in a Git repository
if (await isGitRepository()) {
  const currentBranch = await getCurrentBranch();
  console.log(`Current branch: ${currentBranch}`);
}

// Parse commits file
const commits = await parseCommitsFile('git-commits.log');

// Filter specific range
const filtered = filterCommitsByRange(commits, 1, 10);

// Manually create/delete branches
await createBranch('my-branch', 'abc1234');
await deleteBranch('my-branch');
```

## API Reference

### Main Functions

#### `generateCommits(options?)`

Generate Git commits list.

```typescript
interface GenerateCommitsOptions {
  branch?: string;        // Branch name (default auto-detect: develop/main/master)
  outputFile?: string;    // Output file (default: 'git-commits.log', will auto-convert to .log)
  includeMerges?: boolean; // Whether to include merge commits (default: false)
}

function generateCommits(options?: GenerateCommitsOptions): Promise<CommitInfo[]>;
```

#### `createBranches(options?)`

Batch create branches.

```typescript
interface BranchOperationOptions {
  commitsFile?: string;   // Commits file path (default: 'git-commits.log')
  startSeq?: number;      // Starting sequence number
  endSeq?: number;        // Ending sequence number
  skipConfirm?: boolean;  // Whether to skip confirmation (default: false)
}

function createBranches(options?: BranchOperationOptions): Promise<OperationResult>;
```

#### `deleteBranches(options?)`

Batch delete branches.

```typescript
function deleteBranches(options?: BranchOperationOptions): Promise<OperationResult>;
```

### Type Definitions

```typescript
interface CommitInfo {
  seq: string;        // Sequence number (e.g., "0001")
  hash: string;       // Commit hash
  message?: string;   // Commit message
  branchName: string; // Branch name (seq-hash)
}

interface OperationResult {
  success: boolean;      // Whether successful
  successCount: number;  // Success count
  failCount: number;     // Failure count
  skipped: SkippedItem[]; // Skipped items
  error?: string;        // Error message
}
```

## Output Format

Generated `git-commits.log` format:

```
0001 5122da3 Initial commit
0002 ce322f4 chore: Add project .gitignore configuration
0003 bafbcb0 docs(constitution): Add project charter document
0004 9b1e0a2 docs(spec): Add software feature specification document
...
```

Created branch naming format: `sequence-commit-hash`

Examples:
- `0001-5122da3`
- `0002-ce322f4`
- `0003-bafbcb0`

## System Requirements

- Node.js >= 18.0.0
- Git (installed and in PATH)

## Development

```bash
# Install dependencies
npm install

# Build project
npm run build

# Development mode (watch for file changes and auto-rebuild)
npm run dev

# Type checking
npm run typecheck

# Run tests
npm test

# Run lint
npm run lint
```

### Testing CLI in Development Mode

After building, you can test CLI functionality directly using the following commands:

```bash
# Show CLI help
npm run cli -- --help

# Generate commit list
npm run cli:generate                           # Use default settings (auto-detect branch)
npm run cli:generate -- main                   # Specify main branch
npm run cli:generate -- develop -o output.txt  # Specify output file (will convert to output.log)

# Batch create branches
npm run cli:create                             # Create all branches
npm run cli:create -- 0001 0010                # Create branches for seq 0001 to 0010
npm run cli:create -- 0080                     # Create only branch for seq 0080
npm run cli:create -- 0001 0010 -y             # Skip confirmation prompt

# Batch delete branches
npm run cli:delete -- 0001 0010                # Delete branches for seq 0001 to 0010
npm run cli:delete -- 0080                     # Delete only branch for seq 0080
npm run cli:delete -- 0001 0010 -y             # Skip confirmation prompt
```

> **Note**: When passing arguments with `npm run`, you need to add the `--` separator before the arguments.

### Local Installation Testing

Install the current development version to the local global environment for testing:

```bash
# Install to global environment
npm run install:global

# Test global command
git-commits --help

# Update development version (reinstall after modifying code)
npm run install:global

# Remove development version
npm uninstall -g @alexcode-cc/git-commits
```

### Direct CLI Execution

You can also execute directly using Node.js:

```bash
# Execute CLI directly
node dist/cli.js --help
node dist/cli.js generate main
node dist/cli.js create 0001 0010
node dist/cli.js delete 0080 -y
```

## Development Collaboration

This project was developed with the assistance of [Claude Code](https://claude.com/claude-code). Claude Code is an AI programming assistant from Anthropic that helps with code writing, architecture design, and documentation.

## License

MIT License

## Related Links

- [GitHub Repository](https://github.com/alexcode-cc/git-commits)
- [npm Package](https://www.npmjs.com/package/@alexcode-cc/git-commits)
- [Issue Tracker](https://github.com/alexcode-cc/git-commits/issues)

## Legacy Scripts

The `scripts/` directory contains legacy Python and PowerShell scripts that were the predecessors of this tool. The current version has been completely rewritten in TypeScript, providing more comprehensive functionality and better maintainability.

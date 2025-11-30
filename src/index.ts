/**
 * Git Commits 工具集
 * 
 * @packageDocumentation
 * @module git-commits
 */

// 類型匯出
export type {
  CommitInfo,
  GenerateCommitsOptions,
  BranchOperationOptions,
  OperationResult,
  SkippedItem,
  GitExecResult,
} from './types.js';

// 主要功能匯出
export { generateCommits, generateCommitsCLI } from './generate-commits.js';
export {
  createBranches,
  deleteBranches,
  createBranchesCLI,
  deleteBranchesCLI,
} from './batch-branch-operations.js';

// 工具函數匯出
export {
  isGitRepository,
  checkBranchExists,
  getCurrentBranch,
  getCommits,
  createBranch,
  switchBranch,
  deleteBranch,
  execGit,
} from './utils/git.js';

export {
  parseCommitsFile,
  writeCommitsFile,
  formatCommits,
  filterCommitsByRange,
} from './utils/file.js';

export { confirm, printSeparator } from './utils/prompt.js';


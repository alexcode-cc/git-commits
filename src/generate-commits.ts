/**
 * Git Commits 生成模組
 * 將指定分支的所有 commit 整理成格式化列表
 */

import chalk from 'chalk';
import type { GenerateCommitsOptions, CommitInfo } from './types.js';
import {
  isGitRepository,
  checkBranchExists,
  getCommits,
} from './utils/git.js';
import { formatCommits, writeCommitsFile } from './utils/file.js';
import { printSeparator } from './utils/prompt.js';

/**
 * 生成 Git commits 清單
 * @param options 選項
 * @returns 生成的 CommitInfo 陣列
 */
export async function generateCommits(
  options: GenerateCommitsOptions = {}
): Promise<CommitInfo[]> {
  const {
    branch = 'develop',
    outputFile = 'git-commits.txt',
    includeMerges = false,
  } = options;

  // 檢查是否在 Git 儲存庫中
  if (!(await isGitRepository())) {
    throw new Error('當前目錄不是 git 儲存庫或找不到 git 命令');
  }

  // 檢查分支是否存在
  const branchInfo = await checkBranchExists(branch);
  if (!branchInfo.exists) {
    throw new Error(`找不到分支: ${branch}`);
  }

  const targetBranch = branchInfo.fullName;

  if (branchInfo.isRemote) {
    console.log(chalk.yellow(`提示: ${branch} 是遠端分支，將使用 ${targetBranch}`));
  }

  console.log(chalk.cyan(`正在處理分支: ${targetBranch}`));
  console.log(chalk.cyan(`輸出檔案: ${outputFile}`));
  printSeparator();

  // 獲取 commit 列表
  const rawCommits = await getCommits(targetBranch, includeMerges);

  if (rawCommits.length === 0) {
    console.log(chalk.yellow(`警告: ${targetBranch} 分支沒有任何 commit`));
    return [];
  }

  // 格式化 commits
  const commits = formatCommits(rawCommits);

  // 寫入檔案
  await writeCommitsFile(outputFile, commits);

  console.log(chalk.green(`✓ 成功生成 ${outputFile}`));
  console.log(chalk.green(`  共 ${commits.length} 個 commit`));

  return commits;
}

/**
 * 生成 Git commits 清單（CLI 版本，包含錯誤處理）
 * @param options 選項
 */
export async function generateCommitsCLI(
  options: GenerateCommitsOptions = {}
): Promise<void> {
  try {
    await generateCommits(options);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`錯誤: ${message}`));
    process.exit(1);
  }
}


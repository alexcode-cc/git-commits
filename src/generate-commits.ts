/**
 * Git Commits 生成模組
 * 將指定分支的所有 commit 整理成格式化列表
 */

import chalk from 'chalk';
import { basename, dirname, extname, join } from 'path';
import type { GenerateCommitsOptions, CommitInfo } from './types.js';
import {
  isGitRepository,
  checkBranchExists,
  getCommits,
} from './utils/git.js';
import { formatCommits, writeCommitsFile } from './utils/file.js';
import { printSeparator } from './utils/prompt.js';

/**
 * 確保檔案名稱使用 .log 附檔名
 * @param filePath 檔案路徑
 * @returns 使用 .log 附檔名的檔案路徑
 */
function ensureLogExtension(filePath: string): string {
  const ext = extname(filePath);
  if (ext.toLowerCase() === '.log') {
    return filePath;
  }
  const dir = dirname(filePath);
  const name = basename(filePath, ext);
  return dir === '.' ? `${name}.log` : join(dir, `${name}.log`);
}

/** 預設分支優先順序 */
const DEFAULT_BRANCHES = ['develop', 'main', 'master'];

/**
 * 自動偵測可用的預設分支
 * @returns 找到的分支名稱，若都找不到則回傳 null
 */
async function detectDefaultBranch(): Promise<string | null> {
  for (const branch of DEFAULT_BRANCHES) {
    const branchInfo = await checkBranchExists(branch);
    if (branchInfo.exists) {
      return branchInfo.fullName;
    }
  }
  return null;
}

/**
 * 生成 Git commits 清單
 * @param options 選項
 * @returns 生成的 CommitInfo 陣列
 */
export async function generateCommits(
  options: GenerateCommitsOptions = {}
): Promise<CommitInfo[]> {
  const {
    branch,
    outputFile: rawOutputFile = 'git-commits.log',
    includeMerges = false,
  } = options;

  // 確保輸出檔案使用 .log 附檔名
  const outputFile = ensureLogExtension(rawOutputFile);

  // 檢查是否在 Git 儲存庫中
  if (!(await isGitRepository())) {
    throw new Error('當前目錄不是 git 儲存庫或找不到 git 命令');
  }

  let targetBranch: string;

  // 如果沒有指定分支，自動偵測預設分支
  if (!branch) {
    const detectedBranch = await detectDefaultBranch();
    if (!detectedBranch) {
      throw new Error(`找不到預設分支（已嘗試: ${DEFAULT_BRANCHES.join(', ')}）`);
    }
    targetBranch = detectedBranch;
    console.log(chalk.yellow(`提示: 自動偵測到分支 ${targetBranch}`));
  } else {
    // 檢查指定的分支是否存在
    const branchInfo = await checkBranchExists(branch);
    if (!branchInfo.exists) {
      throw new Error(`找不到分支: ${branch}`);
    }
    targetBranch = branchInfo.fullName;

    if (branchInfo.isRemote) {
      console.log(chalk.yellow(`提示: ${branch} 是遠端分支，將使用 ${targetBranch}`));
    }
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


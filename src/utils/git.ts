/**
 * Git 操作工具函數
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import type { GitExecResult } from '../types.js';

const execAsync = promisify(exec);

/**
 * 執行 Git 命令
 * @param args Git 命令參數
 * @returns 執行結果
 */
export async function execGit(args: string[]): Promise<GitExecResult> {
  try {
    const { stdout, stderr } = await execAsync(`git ${args.join(' ')}`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });
    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0,
    };
  } catch (error: unknown) {
    const execError = error as { stdout?: string; stderr?: string; code?: number };
    return {
      stdout: execError.stdout?.trim() ?? '',
      stderr: execError.stderr?.trim() ?? '',
      exitCode: execError.code ?? 1,
    };
  }
}

/**
 * 檢查是否在 Git 儲存庫中
 * @returns 是否在 Git 儲存庫中
 */
export async function isGitRepository(): Promise<boolean> {
  const result = await execGit(['rev-parse', '--git-dir']);
  return result.exitCode === 0;
}

/**
 * 檢查分支是否存在
 * @param branch 分支名稱
 * @returns 分支資訊（如果存在）
 */
export async function checkBranchExists(
  branch: string
): Promise<{ exists: boolean; isRemote: boolean; fullName: string }> {
  // 檢查本地分支
  const localResult = await execGit([
    'show-ref',
    '--verify',
    '--quiet',
    `refs/heads/${branch}`,
  ]);

  if (localResult.exitCode === 0) {
    return { exists: true, isRemote: false, fullName: branch };
  }

  // 檢查遠端分支
  const remoteResult = await execGit([
    'show-ref',
    '--verify',
    '--quiet',
    `refs/remotes/origin/${branch}`,
  ]);

  if (remoteResult.exitCode === 0) {
    return { exists: true, isRemote: true, fullName: `origin/${branch}` };
  }

  return { exists: false, isRemote: false, fullName: branch };
}

/**
 * 獲取當前分支名稱
 * @returns 當前分支名稱
 */
export async function getCurrentBranch(): Promise<string | null> {
  const result = await execGit(['branch', '--show-current']);
  return result.exitCode === 0 && result.stdout ? result.stdout : null;
}

/**
 * 獲取指定分支的所有 commits
 * @param branch 分支名稱
 * @param includeMerges 是否包含 merge commits
 * @returns Commit 列表（格式: "hash message"）
 */
export async function getCommits(
  branch: string,
  includeMerges = false
): Promise<string[]> {
  const args = ['log', branch, '--oneline', '--reverse'];
  if (!includeMerges) {
    args.push('--no-merges');
  }

  const result = await execGit(args);

  if (result.exitCode !== 0) {
    throw new Error(`無法獲取 ${branch} 分支的 commit 列表: ${result.stderr}`);
  }

  return result.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * 創建分支
 * @param branchName 分支名稱
 * @param commitHash Commit hash
 * @returns 是否成功
 */
export async function createBranch(
  branchName: string,
  commitHash: string
): Promise<{ success: boolean; error?: string; alreadyExists?: boolean }> {
  const result = await execGit(['checkout', '-b', branchName, commitHash]);

  if (result.exitCode === 0) {
    return { success: true };
  }

  const errorMsg = result.stderr.toLowerCase();
  if (errorMsg.includes('already exists') || errorMsg.includes('已存在')) {
    return { success: false, alreadyExists: true, error: '分支已存在' };
  }

  return { success: false, error: result.stderr };
}

/**
 * 切換分支
 * @param branch 分支名稱
 * @returns 是否成功
 */
export async function switchBranch(branch: string): Promise<boolean> {
  const result = await execGit(['switch', branch]);
  return result.exitCode === 0;
}

/**
 * 刪除分支
 * @param branchName 分支名稱
 * @returns 刪除結果
 */
export async function deleteBranch(
  branchName: string
): Promise<{ success: boolean; error?: string; notFound?: boolean }> {
  const result = await execGit(['branch', '-D', branchName]);

  if (result.exitCode === 0) {
    return { success: true };
  }

  const errorMsg = result.stderr.toLowerCase();
  if (errorMsg.includes('not found') || errorMsg.includes('找不到')) {
    return { success: false, notFound: true, error: '分支不存在' };
  }

  return { success: false, error: result.stderr };
}


/**
 * 獲取所有本地分支名稱
 * @returns 本地分支名稱列表
 */
export async function getLocalBranches(): Promise<string[]> {
  const result = await execGit(['branch', '--format=%(refname:short)']);
  
  if (result.exitCode !== 0) {
    throw new Error(`無法獲取本地分支列表: ${result.stderr}`);
  }

  return result.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

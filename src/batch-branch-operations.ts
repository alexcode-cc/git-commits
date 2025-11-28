/**
 * Git 批次分支操作模組
 * 根據 git-commits.log 批次創建或刪除分支
 */

import chalk from 'chalk';
import type {
  BranchOperationOptions,
  OperationResult,
  CommitInfo,
  SkippedItem,
} from './types.js';
import {
  isGitRepository,
  getCurrentBranch,
  createBranch,
  switchBranch,
  deleteBranch,
} from './utils/git.js';
import { parseCommitsFile, filterCommitsByRange } from './utils/file.js';
import { confirm, printSeparator } from './utils/prompt.js';

/**
 * 批次創建分支
 * @param options 選項
 * @returns 操作結果
 */
export async function createBranches(
  options: BranchOperationOptions = {}
): Promise<OperationResult> {
  const {
    commitsFile = 'git-commits.log',
    startSeq,
    endSeq,
    skipConfirm = false,
  } = options;

  // 檢查是否在 Git 儲存庫中
  if (!(await isGitRepository())) {
    return {
      success: false,
      successCount: 0,
      failCount: 0,
      skipped: [],
      error: '當前目錄不是 git 儲存庫或找不到 git 命令',
    };
  }

  // 獲取當前分支
  const currentBranch = await getCurrentBranch();
  if (!currentBranch) {
    console.log(chalk.yellow('警告: 無法確定當前分支，將繼續執行'));
  }

  // 解析 commits 檔案
  let commits: CommitInfo[];
  try {
    commits = await parseCommitsFile(commitsFile);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      successCount: 0,
      failCount: 0,
      skipped: [],
      error: message,
    };
  }

  if (commits.length === 0) {
    return {
      success: false,
      successCount: 0,
      failCount: 0,
      skipped: [],
      error: `${commitsFile} 中沒有找到任何 commit`,
    };
  }

  console.log(chalk.green(`已讀取 ${commits.length} 個 commit`));

  // 篩選範圍
  if (startSeq !== undefined) {
    commits = filterCommitsByRange(commits, startSeq, endSeq);

    if (commits.length === 0) {
      const rangeStr =
        endSeq !== undefined && endSeq !== startSeq
          ? `${String(startSeq).padStart(4, '0')} 到 ${String(endSeq).padStart(4, '0')}`
          : String(startSeq).padStart(4, '0');
      return {
        success: false,
        successCount: 0,
        failCount: 0,
        skipped: [],
        error: `找不到序號範圍 ${rangeStr} 的 commit`,
      };
    }

    const rangeStr =
      endSeq !== undefined && endSeq !== startSeq
        ? `${String(startSeq).padStart(4, '0')} 到 ${String(endSeq).padStart(4, '0')}`
        : String(startSeq).padStart(4, '0');
    console.log(chalk.cyan(`範圍: ${rangeStr}`));
  }

  console.log(chalk.cyan(`準備創建 ${commits.length} 個分支`));
  console.log(chalk.cyan(`當前分支: ${currentBranch ?? '未知'}`));
  printSeparator();

  // 確認操作
  if (!skipConfirm) {
    const confirmed = await confirm('確定要繼續嗎？');
    if (!confirmed) {
      console.log(chalk.yellow('操作已取消'));
      return {
        success: true,
        successCount: 0,
        failCount: 0,
        skipped: [],
      };
    }
  }

  let successCount = 0;
  let failCount = 0;
  const skipped: SkippedItem[] = [];

  for (const commit of commits) {
    const { branchName, hash, seq } = commit;

    process.stdout.write(`[${seq}] 正在創建分支: ${branchName}... `);

    const result = await createBranch(branchName, hash);

    if (result.success) {
      // 切換回原分支
      if (currentBranch) {
        await switchBranch(currentBranch);
      }
      console.log(chalk.green('✓'));
      successCount++;
    } else if (result.alreadyExists) {
      console.log(chalk.yellow('⚠ (分支已存在，跳過)'));
      skipped.push({ seq, branchName, reason: '分支已存在' });
    } else {
      console.log(chalk.red(`✗ 錯誤: ${result.error}`));
      failCount++;
    }
  }

  printSeparator();
  console.log(chalk.cyan(`完成！成功: ${successCount}, 失敗: ${failCount}`));

  // 顯示跳過的分支
  if (skipped.length > 0) {
    console.log(chalk.yellow(`\n跳過的分支（因為已存在）: ${skipped.length} 個`));
    for (const item of skipped) {
      console.log(chalk.yellow(`  - [${item.seq}] ${item.branchName}`));
    }
  }

  return {
    success: failCount === 0,
    successCount,
    failCount,
    skipped,
  };
}

/**
 * 批次刪除分支
 * @param options 選項
 * @returns 操作結果
 */
export async function deleteBranches(
  options: BranchOperationOptions = {}
): Promise<OperationResult> {
  const {
    commitsFile = 'git-commits.log',
    startSeq,
    endSeq,
    skipConfirm = false,
  } = options;

  // 檢查是否在 Git 儲存庫中
  if (!(await isGitRepository())) {
    return {
      success: false,
      successCount: 0,
      failCount: 0,
      skipped: [],
      error: '當前目錄不是 git 儲存庫或找不到 git 命令',
    };
  }

  // 解析 commits 檔案
  let commits: CommitInfo[];
  try {
    commits = await parseCommitsFile(commitsFile);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      successCount: 0,
      failCount: 0,
      skipped: [],
      error: message,
    };
  }

  if (commits.length === 0) {
    return {
      success: false,
      successCount: 0,
      failCount: 0,
      skipped: [],
      error: `${commitsFile} 中沒有找到任何 commit`,
    };
  }

  console.log(chalk.green(`已讀取 ${commits.length} 個 commit`));

  // 篩選範圍（若未指定序號則刪除全部）
  let branchesToDelete: CommitInfo[];
  let rangeStr: string;

  if (startSeq !== undefined) {
    branchesToDelete = filterCommitsByRange(commits, startSeq, endSeq);

    if (branchesToDelete.length === 0) {
      rangeStr =
        endSeq !== undefined && endSeq !== startSeq
          ? `${String(startSeq).padStart(4, '0')} 到 ${String(endSeq).padStart(4, '0')}`
          : String(startSeq).padStart(4, '0');
      return {
        success: false,
        successCount: 0,
        failCount: 0,
        skipped: [],
        error: `找不到序號範圍 ${rangeStr} 的分支`,
      };
    }

    rangeStr =
      endSeq !== undefined && endSeq !== startSeq
        ? `${String(startSeq).padStart(4, '0')} 到 ${String(endSeq).padStart(4, '0')}`
        : String(startSeq).padStart(4, '0');
    console.log(chalk.cyan(`範圍: ${rangeStr}`));
  } else {
    // 未指定序號，刪除全部
    branchesToDelete = commits;
    rangeStr = '全部';
    console.log(chalk.yellow('未指定序號，將刪除所有本工具產生的分支'));
  }

  console.log(chalk.cyan(`準備刪除 ${branchesToDelete.length} 個分支`));
  printSeparator();

  // 顯示將要刪除的分支
  console.log(chalk.yellow('將要刪除的分支:'));
  for (const commit of branchesToDelete) {
    console.log(chalk.yellow(`  - ${commit.branchName}`));
  }

  // 確認操作
  if (!skipConfirm) {
    const confirmed = await confirm('\n確定要刪除這些分支嗎？');
    if (!confirmed) {
      console.log(chalk.yellow('操作已取消'));
      return {
        success: true,
        successCount: 0,
        failCount: 0,
        skipped: [],
      };
    }
  }

  let currentBranch = await getCurrentBranch();
  let successCount = 0;
  let failCount = 0;
  const skipped: SkippedItem[] = [];

  for (const commit of branchesToDelete) {
    const { branchName, seq } = commit;

    // 如果當前在要刪除的分支上，先切換到其他分支
    if (currentBranch === branchName) {
      const switched =
        (await switchBranch('develop')) || (await switchBranch('main'));
      if (!switched) {
        console.log(
          chalk.red(`錯誤: 無法切換分支，請手動切換後再刪除 ${branchName}`)
        );
        skipped.push({ seq, branchName, reason: '無法切換分支' });
        failCount++;
        continue;
      }
      currentBranch = (await getCurrentBranch()) ?? currentBranch;
    }

    process.stdout.write(`[${seq}] 正在刪除分支: ${branchName}... `);

    const result = await deleteBranch(branchName);

    if (result.success) {
      console.log(chalk.green('✓'));
      successCount++;
    } else if (result.notFound) {
      console.log(chalk.yellow('⚠ (分支不存在，跳過)'));
    } else {
      console.log(chalk.red('✗ (無法刪除，跳過)'));
      skipped.push({ seq, branchName, reason: result.error });
      failCount++;
    }
  }

  printSeparator();
  console.log(chalk.cyan(`完成！成功: ${successCount}, 失敗: ${failCount}`));

  // 顯示無法刪除的分支
  if (skipped.length > 0) {
    console.log(chalk.yellow(`\n無法刪除的分支: ${skipped.length} 個`));
    for (const item of skipped) {
      console.log(
        chalk.yellow(`  - [${item.seq}] ${item.branchName} (${item.reason ?? '未知原因'})`)
      );
    }
  }

  return {
    success: failCount === 0,
    successCount,
    failCount,
    skipped,
  };
}

/**
 * 批次創建分支（CLI 版本）
 * @param options 選項
 */
export async function createBranchesCLI(
  options: BranchOperationOptions = {}
): Promise<void> {
  const result = await createBranches(options);
  if (!result.success && result.error) {
    console.error(chalk.red(`錯誤: ${result.error}`));
    process.exit(1);
  }
}

/**
 * 批次刪除分支（CLI 版本）
 * @param options 選項
 */
export async function deleteBranchesCLI(
  options: BranchOperationOptions = {}
): Promise<void> {
  const result = await deleteBranches(options);
  if (!result.success && result.error) {
    console.error(chalk.red(`錯誤: ${result.error}`));
    process.exit(1);
  }
}


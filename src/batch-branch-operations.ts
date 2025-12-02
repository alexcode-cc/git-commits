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
import { t } from './i18n/index.js';

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
      error: t('git.notRepository'),
    };
  }

  // 獲取當前分支
  const currentBranch = await getCurrentBranch();
  if (!currentBranch) {
    console.log(chalk.yellow(`${t('common.warning')}: ${t('git.cannotDetermineCurrentBranch')}`));
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
      error: t('branch.noCommitsFound', { file: commitsFile }),
    };
  }

  console.log(chalk.green(t('branch.commitsRead', { count: commits.length })));

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
        error: t('branch.rangeNotFound', { range: rangeStr }),
      };
    }

    const rangeStr =
      endSeq !== undefined && endSeq !== startSeq
        ? `${String(startSeq).padStart(4, '0')} 到 ${String(endSeq).padStart(4, '0')}`
        : String(startSeq).padStart(4, '0');
    console.log(chalk.cyan(t('branch.range', { range: rangeStr })));
  }

  console.log(chalk.cyan(t('branch.preparing', { count: commits.length })));
  console.log(chalk.cyan(`${t('git.currentBranch')}: ${currentBranch ?? '未知'}`));
  printSeparator();

  // 確認操作
  if (!skipConfirm) {
    const confirmed = await confirm(t('branch.confirmCreate'));
    if (!confirmed) {
      console.log(chalk.yellow(t('branch.cancelled')));
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

    process.stdout.write(`[${seq}] ${t('branch.creating', { branch: branchName })}... `);

    const result = await createBranch(branchName, hash);

    if (result.success) {
      // 切換回原分支
      if (currentBranch) {
        await switchBranch(currentBranch);
      }
      console.log(chalk.green(t('branch.created')));
      successCount++;
    } else if (result.alreadyExists) {
      console.log(chalk.yellow(t('branch.alreadyExists')));
      skipped.push({ seq, branchName, reason: '分支已存在' });
    } else {
      console.log(chalk.red(`${t('common.error')}: ${result.error}`));
      failCount++;
    }
  }

  printSeparator();
  console.log(chalk.cyan(t('branch.success', { success: successCount, fail: failCount })));

  // 顯示跳過的分支
  if (skipped.length > 0) {
    console.log(chalk.yellow(t('branch.skippedExists', { count: skipped.length })));
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
      error: t('git.notRepository'),
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
      error: t('branch.noCommitsFound', { file: commitsFile }),
    };
  }

  console.log(chalk.green(t('branch.commitsRead', { count: commits.length })));

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
        error: t('branch.rangeNotFound', { range: rangeStr }),
      };
    }

    rangeStr =
      endSeq !== undefined && endSeq !== startSeq
        ? `${String(startSeq).padStart(4, '0')} 到 ${String(endSeq).padStart(4, '0')}`
        : String(startSeq).padStart(4, '0');
    console.log(chalk.cyan(t('branch.range', { range: rangeStr })));
  } else {
    // 未指定序號，刪除全部
    branchesToDelete = commits;
    rangeStr = '全部';
    console.log(chalk.yellow(t('branch.notSpecifiedDeleteAll')));
  }

  console.log(chalk.cyan(t('branch.preparingDelete', { count: branchesToDelete.length })));
  printSeparator();

  // 顯示將要刪除的分支
  console.log(chalk.yellow(t('branch.toBeDeleted')));
  for (const commit of branchesToDelete) {
    console.log(chalk.yellow(`  - ${commit.branchName}`));
  }

  // 確認操作
  if (!skipConfirm) {
    const confirmed = await confirm(t('branch.confirmDelete'));
    if (!confirmed) {
      console.log(chalk.yellow(t('branch.cancelled')));
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
          chalk.red(`${t('common.error')}: ${t('git.cannotSwitch', { branch: branchName })}`)
        );
        skipped.push({ seq, branchName, reason: '無法切換分支' });
        failCount++;
        continue;
      }
      currentBranch = (await getCurrentBranch()) ?? currentBranch;
    }

    process.stdout.write(`[${seq}] ${t('branch.deleting', { branch: branchName })}... `);

    const result = await deleteBranch(branchName);

    if (result.success) {
      console.log(chalk.green(t('branch.deleted')));
      successCount++;
    } else if (result.notFound) {
      console.log(chalk.yellow(t('branch.notFound')));
    } else {
      console.log(chalk.red(t('branch.cannotDelete')));
      skipped.push({ seq, branchName, reason: result.error });
      failCount++;
    }
  }

  printSeparator();
  console.log(chalk.cyan(t('branch.success', { success: successCount, fail: failCount })));

  // 顯示無法刪除的分支
  if (skipped.length > 0) {
    console.log(chalk.yellow(t('branch.skippedCannotDelete', { count: skipped.length })));
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
    console.error(chalk.red(`${t('common.error')}: ${result.error}`));
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
    console.error(chalk.red(`${t('common.error')}: ${result.error}`));
    process.exit(1);
  }
}


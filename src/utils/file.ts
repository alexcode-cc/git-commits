/**
 * 檔案操作工具函數
 */

import { readFile, writeFile } from 'fs/promises';
import type { CommitInfo } from '../types.js';
import { t } from '../i18n/index.js';

const COMMIT_LINE_PATTERN = /^(\d{4})\s+([0-9a-fA-F]{7,40})(?:\s+(.*))?$/;

/**
 * 解析 commits 檔案
 * @param filePath 檔案路徑
 * @returns Commit 資訊陣列
 */
export async function parseCommitsFile(filePath: string): Promise<CommitInfo[]> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const commits: CommitInfo[] = [];

    for (const [index, line] of lines.entries()) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // 格式: 0001 5122da3 Initial commit from Specify template
      const match = COMMIT_LINE_PATTERN.exec(trimmedLine);
      if (!match) {
        throw new Error(
          `無效的 commit 清單格式: ${filePath}:${index + 1}，預期格式為 "0001 5122da3 commit message"`
        );
      }

      const [, seq, rawHash, message = ''] = match;
      const hash = rawHash.toLowerCase();

      commits.push({
        seq,
        hash,
        message,
        branchName: `${seq}-${hash}`,
      });
    }

    return commits;
  } catch (error: unknown) {
    const fsError = error as { code?: string };
    if (fsError.code === 'ENOENT') {
      throw new Error(t('file.fileNotFound', { file: filePath }));
    }
    throw error;
  }
}

/**
 * 寫入 commits 檔案
 * @param filePath 檔案路徑
 * @param commits Commit 資訊陣列
 */
export async function writeCommitsFile(
  filePath: string,
  commits: CommitInfo[]
): Promise<void> {
  const content = commits
    .map((c) => `${c.seq} ${c.hash}${c.message ? ` ${c.message}` : ''}`)
    .join('\n');

  await writeFile(filePath, content, 'utf-8');
}

/**
 * 格式化 commits 為標準格式
 * @param rawCommits 原始 commit 字串陣列（格式: "hash message"）
 * @returns 格式化的 CommitInfo 陣列
 */
export function formatCommits(rawCommits: string[]): CommitInfo[] {
  return rawCommits.map((commit, index) => {
    const [hash = '', ...messageParts] = commit.split(/\s+/);
    const message = messageParts.join(' ');
    const seq = String(index + 1).padStart(4, '0');

    return {
      seq,
      hash,
      message,
      branchName: `${seq}-${hash}`,
    };
  });
}

/**
 * 篩選指定範圍的 commits
 * @param commits Commit 資訊陣列
 * @param startSeq 起始序號
 * @param endSeq 結束序號（可選，預設與起始相同）
 * @returns 篩選後的 CommitInfo 陣列
 */
export function filterCommitsByRange(
  commits: CommitInfo[],
  startSeq: number,
  endSeq?: number
): CommitInfo[] {
  const end = endSeq ?? startSeq;

  return commits.filter((commit) => {
    const seqNum = parseInt(commit.seq, 10);
    return seqNum >= startSeq && seqNum <= end;
  });
}


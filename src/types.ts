/**
 * Git Commits 工具集型別定義
 */

/**
 * Commit 資訊介面
 */
export interface CommitInfo {
  /** 序號（4位數字串，例如 "0001"） */
  seq: string;
  /** Commit hash（短格式） */
  hash: string;
  /** Commit 訊息 */
  message?: string;
  /** 分支名稱（序號-hash 格式） */
  branchName: string;
}

/**
 * 生成 Commits 選項
 */
export interface GenerateCommitsOptions {
  /** 分支名稱（預設: develop） */
  branch?: string;
  /** 輸出檔案路徑（預設: git-commits.txt） */
  outputFile?: string;
  /** 是否包含 merge commits（預設: false） */
  includeMerges?: boolean;
}

/**
 * 批次分支操作選項
 */
export interface BranchOperationOptions {
  /** Commits 清單檔案路徑 */
  commitsFile?: string;
  /** 起始序號 */
  startSeq?: number;
  /** 結束序號 */
  endSeq?: number;
  /** 是否跳過確認提示（預設: false） */
  skipConfirm?: boolean;
}

/**
 * 操作結果
 */
export interface OperationResult {
  /** 是否成功 */
  success: boolean;
  /** 成功數量 */
  successCount: number;
  /** 失敗數量 */
  failCount: number;
  /** 跳過的項目 */
  skipped: SkippedItem[];
  /** 錯誤訊息（如有） */
  error?: string;
}

/**
 * 跳過的項目資訊
 */
export interface SkippedItem {
  /** 序號 */
  seq: string;
  /** 分支名稱 */
  branchName: string;
  /** 原因 */
  reason?: string;
}

/**
 * Git 執行結果
 */
export interface GitExecResult {
  /** 標準輸出 */
  stdout: string;
  /** 標準錯誤 */
  stderr: string;
  /** 退出碼 */
  exitCode: number;
}


# @spec-kit/git-commits

Git commits 管理工具集 - 生成 commit 清單與批次分支操作

[![npm version](https://badge.fury.io/js/%40spec-kit%2Fgit-commits.svg)](https://www.npmjs.com/package/@spec-kit/git-commits)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 功能特色

- 🔍 **生成 commit 清單** - 將指定分支的所有 commit 整理成格式化列表
- 🌿 **批次創建分支** - 根據 commit 清單自動創建分支
- 🗑️ **批次刪除分支** - 根據序號範圍批次刪除分支
- 📦 **可程式化使用** - 提供完整的 TypeScript API
- 🖥️ **CLI 工具** - 提供便捷的命令列介面

## 安裝

```bash
# 使用 npm
npm install -g @spec-kit/git-commits

# 使用 pnpm
pnpm add -g @spec-kit/git-commits

# 使用 yarn
yarn global add @spec-kit/git-commits
```

## CLI 使用方法

### 生成 commit 清單

```bash
# 使用預設設定（develop 分支，輸出到 git-commits.txt）
git-commits generate

# 指定分支
git-commits generate main

# 指定輸出檔案
git-commits generate develop -o my-commits.txt

# 包含 merge commits
git-commits generate develop -m
```

### 批次創建分支

```bash
# 創建所有分支
git-commits create

# 創建指定範圍的分支（0001 到 0010）
git-commits create git-commits.txt 0001 0010

# 只創建單一分支（0080）
git-commits create 0080

# 跳過確認提示
git-commits create 0001 0010 -y
```

### 批次刪除分支

```bash
# 刪除指定範圍的分支
git-commits delete git-commits.txt 0001 0010

# 只刪除單一分支
git-commits delete 0080

# 跳過確認提示
git-commits delete 0001 0010 -y
```

## 程式化使用

### 基本用法

```typescript
import {
  generateCommits,
  createBranches,
  deleteBranches,
} from '@spec-kit/git-commits';

// 生成 commit 清單
const commits = await generateCommits({
  branch: 'develop',
  outputFile: 'git-commits.txt',
});

// 批次創建分支
const createResult = await createBranches({
  commitsFile: 'git-commits.txt',
  startSeq: 1,
  endSeq: 10,
  skipConfirm: true,
});

// 批次刪除分支
const deleteResult = await deleteBranches({
  commitsFile: 'git-commits.txt',
  startSeq: 1,
  endSeq: 10,
  skipConfirm: true,
});
```

### 進階用法

```typescript
import {
  parseCommitsFile,
  filterCommitsByRange,
  isGitRepository,
  getCurrentBranch,
  createBranch,
  deleteBranch,
} from '@spec-kit/git-commits';

// 檢查是否在 Git 儲存庫中
if (await isGitRepository()) {
  const currentBranch = await getCurrentBranch();
  console.log(`當前分支: ${currentBranch}`);
}

// 解析 commits 檔案
const commits = await parseCommitsFile('git-commits.txt');

// 篩選特定範圍
const filtered = filterCommitsByRange(commits, 1, 10);

// 手動創建/刪除分支
await createBranch('my-branch', 'abc1234');
await deleteBranch('my-branch');
```

## API 參考

### 主要函數

#### `generateCommits(options?)`

生成 Git commits 清單。

```typescript
interface GenerateCommitsOptions {
  branch?: string;        // 分支名稱（預設: 'develop'）
  outputFile?: string;    // 輸出檔案（預設: 'git-commits.txt'）
  includeMerges?: boolean; // 是否包含 merge commits（預設: false）
}

function generateCommits(options?: GenerateCommitsOptions): Promise<CommitInfo[]>;
```

#### `createBranches(options?)`

批次創建分支。

```typescript
interface BranchOperationOptions {
  commitsFile?: string;   // Commits 檔案路徑（預設: 'git-commits.txt'）
  startSeq?: number;      // 起始序號
  endSeq?: number;        // 結束序號
  skipConfirm?: boolean;  // 是否跳過確認（預設: false）
}

function createBranches(options?: BranchOperationOptions): Promise<OperationResult>;
```

#### `deleteBranches(options?)`

批次刪除分支。

```typescript
function deleteBranches(options?: BranchOperationOptions): Promise<OperationResult>;
```

### 類型定義

```typescript
interface CommitInfo {
  seq: string;        // 序號（例如 "0001"）
  hash: string;       // Commit hash
  message?: string;   // Commit 訊息
  branchName: string; // 分支名稱（序號-hash）
}

interface OperationResult {
  success: boolean;      // 是否成功
  successCount: number;  // 成功數量
  failCount: number;     // 失敗數量
  skipped: SkippedItem[]; // 跳過的項目
  error?: string;        // 錯誤訊息
}
```

## 輸出格式

生成的 `git-commits.txt` 格式：

```
0001 5122da3 Initial commit
0002 ce322f4 chore: 新增專案 .gitignore 設定
0003 bafbcb0 docs(constitution): 新增專案憲章文件
0004 9b1e0a2 docs(spec): 新增軟體功能規格文件
...
```

創建的分支命名格式：`序號-commit-hash`

例如：
- `0001-5122da3`
- `0002-ce322f4`
- `0003-bafbcb0`

## 系統需求

- Node.js >= 18.0.0
- Git（已安裝並在 PATH 中）

## 開發

```bash
# 安裝依賴
npm install

# 建置專案
npm run build

# 開發模式（監聽檔案變更自動重新建置）
npm run dev

# 類型檢查
npm run typecheck
```

### 開發模式測試 CLI

建置完成後，可以使用以下指令直接測試 CLI 功能：

```bash
# 顯示 CLI 說明
npm run cli -- --help

# 生成 commit 清單
npm run cli:generate                           # 使用預設設定（develop 分支）
npm run cli:generate -- main                   # 指定 main 分支
npm run cli:generate -- develop -o output.txt  # 指定輸出檔案

# 批次創建分支
npm run cli:create                             # 創建所有分支
npm run cli:create -- 0001 0010                # 創建序號 0001 到 0010 的分支
npm run cli:create -- 0080                     # 只創建序號 0080 的分支
npm run cli:create -- 0001 0010 -y             # 跳過確認提示

# 批次刪除分支
npm run cli:delete -- 0001 0010                # 刪除序號 0001 到 0010 的分支
npm run cli:delete -- 0080                     # 只刪除序號 0080 的分支
npm run cli:delete -- 0001 0010 -y             # 跳過確認提示
```

> **注意**: 使用 `npm run` 傳遞參數時，需要在參數前加上 `--` 分隔符號。

### 直接執行 CLI

也可以直接使用 Node.js 執行：

```bash
# 直接執行 CLI
node dist/cli.js --help
node dist/cli.js generate main
node dist/cli.js create 0001 0010
node dist/cli.js delete 0080 -y
```

## 授權

MIT License

## 相關連結

- [GitHub Repository](https://github.com/spec-kit/git-commits)
- [npm Package](https://www.npmjs.com/package/@spec-kit/git-commits)
- [Issue Tracker](https://github.com/spec-kit/git-commits/issues)

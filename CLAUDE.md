# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

這是一個 Git commits 管理工具集，用於生成 commit 清單並進行批次分支操作。專案使用 TypeScript 開發，建置為 ESM 格式的 Node.js CLI 工具和程式庫。

## 開發指令

### 建置與開發
```bash
# 建置專案（TypeScript 編譯 + Vite 打包）
npm run build

# 開發模式（監聽檔案變更自動重新建置）
npm run dev

# 類型檢查（不輸出檔案）
npm run typecheck

# Lint 檢查
npm run lint
```

### CLI 測試指令
建置完成後，可用以下方式測試 CLI：

```bash
# 方式 1: 使用 npm script（需要 -- 分隔參數）
npm run cli -- --help
npm run cli:generate
npm run cli:create -- 0001 0010
npm run cli:delete -- 0080 -y

# 方式 2: 直接執行編譯後的檔案
node dist/cli.js --help
node dist/cli.js generate main
node dist/cli.js create 0001 0010

# 方式 3: 全域安裝測試
npm run install:global      # 安裝到全域
git-commits --help           # 測試全域指令
npm uninstall -g @alexcode-cc/git-commits  # 移除
```

## 程式碼架構

### 核心模組結構

專案採用模組化設計，分為以下主要部分：

1. **CLI 層** (`src/cli.ts`)
   - 使用 Commander.js 建立命令列介面
   - 定義五個主要命令：`generate`、`create`、`delete`、`list`、`list-all`
   - 處理參數解析與驗證（支援靈活的序號參數格式）

2. **核心功能層**
   - `src/generate-commits.ts`: 生成 commit 清單功能
   - `src/batch-branch-operations.ts`: 批次創建/刪除分支功能
   - `src/list-commits.ts`: 列出分支與 commit 清單功能

3. **工具層** (`src/utils/`)
   - `git.ts`: Git 操作封裝（執行 git 命令、分支管理等）
   - `file.ts`: 檔案操作（解析、寫入、格式化 commits 檔案）
   - `prompt.ts`: 使用者互動（確認提示、分隔線）

4. **類型定義** (`src/types.ts`)
   - 定義所有介面：`CommitInfo`、`GenerateCommitsOptions`、`BranchOperationOptions`、`OperationResult` 等

5. **公開 API** (`src/index.ts`)
   - 匯出所有公開函數與類型供程式化使用

### 建置系統

- **Vite** 作為建置工具，搭配 `vite-plugin-dts` 生成型別定義
- 雙進入點設計：
  - `index.ts` → `dist/index.js`（程式庫 API）
  - `cli.ts` → `dist/cli.js`（CLI 工具，含 shebang）
- 建置目標：Node.js 18+，ES2022，ESM 格式
- 外部依賴：chalk、commander、所有 Node.js 內建模組

### 分支命名規則

工具生成的分支遵循格式：`序號-commit-hash`
- 序號：4位數字（例如 `0001`）
- Hash：Git commit 的短 hash（7位）
- 範例：`0001-5122da3`、`0042-abc1234`

### Commits 檔案格式

預設檔案：`git-commits.log`（使用 .log 避免被 Git 追蹤）

格式：
```
0001 5122da3 Initial commit
0002 ce322f4 chore: 新增專案 .gitignore 設定
0003 bafbcb0 docs(constitution): 新增專案憲章文件
```

每行結構：`序號 空格 hash 空格 訊息`

## Git Commit 規範

**重要：所有的提交訊息必須使用繁體中文**

遵循 AngularJS Git Commit Message Conventions 規範進行 Git Commit。

### 格式
```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

### Type 類型（必填）
- `feat`: 新功能 (A new feature)
- `fix`: 修復 bug (A bug fix)
- `docs`: 文件變更 (Documentation only changes)
- `style`: 程式碼格式調整，不影響程式邏輯 (Changes that do not affect the meaning of the code)
- `refactor`: 重構 (A code change that neither fixes a bug nor adds a feature)
- `perf`: 效能優化 (A code change that improves performance)
- `test`: 新增或修改測試 (Adding missing tests or correcting existing tests)
- `chore`: 建置過程或輔助工具的變動 (Changes to the build process or auxiliary tools)

### Scope（選填）
用於說明變更的範圍，例如：`cli`、`utils`、`core`、`git`、`file` 等。

### Subject（必填）
- 使用繁體中文
- 簡潔扼要地描述變更內容
- 結尾不需要句號

### Body（選填）
- 使用繁體中文
- 詳細描述變更的動機與內容

### Footer（選填）
- 標註 Breaking Changes
- 關聯 Issue（例如：`Closes #123`）

### 提交訊息範例
```
feat(cli): 新增 list-all 命令

新增列出所有 commit 清單的功能，方便使用者查看完整內容。

Closes #42
```

```
fix(git): 修正分支名稱解析錯誤

修正當分支名稱包含特殊字元時無法正確解析的問題。
```

```
docs: 更新 README 使用說明

補充 CLI 測試方式說明與程式化使用範例。
```

## 語言規範

- **所有程式碼內的中文字串、註解、文件都使用繁體中文**
- **Git commit 訊息使用繁體中文**
- **與使用者互動的 CLI 訊息使用繁體中文**

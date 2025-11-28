# Git Commits 整理工具

這個工具可以將指定 git 分支的所有 commit 整理成格式化列表，方便查看和管理。

> **注意**: 所有工具檔案位於 `git-commits/` 目錄中。請在**專案根目錄**執行這些指令稿，或使用相對路徑指向 `git-commits/` 目錄中的檔案。

## 功能

- 自動獲取指定分支的所有 commit（從最早到最晚）
- 自動編號（3 位數補零格式：001, 002, 003...）
- 排除 merge commit
- 支援本地分支和遠端分支
- 輸出格式：`序號 commit-hash commit-message`

## 使用方法

### Python 版本（推薦，跨平台）

```bash
# 在專案根目錄執行，使用預設設定（develop 分支，輸出到 git-commits/git-commits.txt）
python git-commits/generate-git-commits.py

# 指定分支名稱
python git-commits/generate-git-commits.py main

# 指定分支和輸出檔案名稱
python git-commits/generate-git-commits.py develop git-commits/git-commits-develop.txt

# 或者進入 git-commits 目錄執行
cd git-commits
python generate-git-commits.py
```

### PowerShell 版本（Windows）

```powershell
# 在專案根目錄執行，使用預設設定（develop 分支，輸出到 git-commits/git-commits.txt）
.\git-commits\generate-git-commits.ps1

# 指定分支名稱
.\git-commits\generate-git-commits.ps1 main

# 指定分支和輸出檔案名稱
.\git-commits\generate-git-commits.ps1 develop git-commits/git-commits-develop.txt

# 或者進入 git-commits 目錄執行
cd git-commits
.\generate-git-commits.ps1
```

## 輸出格式範例

```
001 5122da3 Initial commit
002 ce322f4 chore: 新增專案 .gitignore 設定
003 bafbcb0 docs(constitution): 新增專案憲章文件
004 9b1e0a2 docs(spec): 新增軟體功能規格文件
...
```

## 需求

- Git（已安裝並在 PATH 中）
- Python 3.x（使用 Python 版本時）
- PowerShell 5.1+（使用 PowerShell 版本時）

## 注意事項

1. 請在 git 儲存庫的根目錄執行此腳本
2. 如果指定的分支不存在，腳本會自動檢查遠端分支
3. 輸出檔案會覆蓋同名的現有檔案
4. 腳本會自動排除 merge commit

## 故障排除

### 找不到分支

如果遇到「找不到分支」的錯誤，請確認：
- 分支名稱拼寫正確
- 分支已存在（使用 `git branch -a` 查看所有分支）
- 如果是遠端分支，確保已執行 `git fetch`

### 編碼問題

如果輸出檔案中的中文顯示為亂碼：
- Python 版本：腳本已設定 UTF-8 編碼，應該不會有問題
- PowerShell 版本：確保終端機支援 UTF-8 編碼

## 批次分支操作工具

除了生成 commit 清單外，還提供了批次分支操作工具，可以根據 `git-commits.txt` 批次創建或刪除分支。

### 功能

- **批次創建分支**: 根據 commit 清單自動創建分支，分支名稱格式為 `序號-commit-hash`
- **可指定範圍**: 支援指定序號範圍創建分支（例如：001-005），方便測試
- **批次刪除分支**: 根據序號範圍批次刪除分支
- **安全確認**: 執行前會要求確認，避免誤操作

### 使用方法

#### Python 版本

```bash
# 在專案根目錄執行，創建 001 到 010 的分支（用於測試）
python git-commits/batch-branch-operations.py create git-commits/git-commits.txt 001-010

# 創建所有分支
python git-commits/batch-branch-operations.py create git-commits/git-commits.txt

# 刪除 001 到 010 的分支
python git-commits/batch-branch-operations.py delete git-commits/git-commits.txt 001-010

# 或者進入 git-commits 目錄執行
cd git-commits
python batch-branch-operations.py create git-commits.txt 001-010
```

#### PowerShell 版本

```powershell
# 在專案根目錄執行，創建 001 到 010 的分支（用於測試）
.\git-commits\batch-branch-operations.ps1 create git-commits\git-commits.txt 001-010

# 創建所有分支
.\git-commits\batch-branch-operations.ps1 create git-commits\git-commits.txt

# 刪除 001 到 010 的分支
.\git-commits\batch-branch-operations.ps1 delete git-commits\git-commits.txt 001-010

# 或者進入 git-commits 目錄執行
cd git-commits
.\batch-branch-operations.ps1 create git-commits.txt 001-010
```

### 分支命名規則

創建的分支名稱格式為：`序號-commit-hash`

例如：
- `001-5122da3`
- `002-ce322f4`
- `003-bafbcb0`

### 注意事項

1. **創建分支時**：
   - 可以指定序號範圍（例如：`001-010`），或省略範圍參數創建所有分支
   - 會自動從指定範圍的每個 commit 創建分支
   - 創建後會自動切換回原分支（develop 或 main）
   - 如果分支已存在，會跳過並顯示警告

2. **刪除分支時**：
   - 需要指定序號範圍，格式為：`起始序號-結束序號`（例如：`001-010`）
   - 如果當前在要刪除的分支上，會自動切換到 develop 或 main
   - 如果分支不存在，會跳過並顯示警告

3. **安全機制**：
   - 所有操作前都會要求確認
   - 刪除操作會先顯示將要刪除的分支清單

### 使用範例

```bash
# 1. 先生成 commit 清單（在專案根目錄執行）
python git-commits/generate-git-commits.py develop

# 2. 測試創建 001 到 003 的分支
python git-commits/batch-branch-operations.py create git-commits/git-commits.txt 001-003

# 3. 確認無誤後，創建所有分支
python git-commits/batch-branch-operations.py create git-commits/git-commits.txt

# 4. 完成工作後，刪除測試分支
python git-commits/batch-branch-operations.py delete git-commits/git-commits.txt 001-003
```

## 授權

此工具可自由使用和修改。


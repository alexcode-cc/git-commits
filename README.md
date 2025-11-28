# Git Commits 工具集

此目錄包含用於管理和操作 Git commit 的工具集。

## 檔案說明

- **generate-git-commits.py / .ps1** - 生成 commit 清單工具
- **batch-branch-operations.py / .ps1** - 批次分支操作工具
- **git-commits.txt** - commit 清單檔案（由工具生成）
- **README-git-commits.md** - 完整使用說明文件

## 快速開始

### 1. 生成 commit 清單

在專案根目錄執行：

```bash
# Python 版本（會在當前目錄創建 git-commits.txt）
python git-commits/generate-git-commits.py develop

# PowerShell 版本（會在當前目錄創建 git-commits.txt）
.\git-commits\generate-git-commits.ps1 develop
```

### 2. 批次創建分支

```bash
# 創建 0001 到 0010 的分支（測試用，使用當前目錄的 git-commits.txt）
python git-commits/batch-branch-operations.py create git-commits.txt 0001 0010

# 只創建 0080 這個分支
python git-commits/batch-branch-operations.py create git-commits.txt 0080

# 創建所有分支（使用預設的 git-commits.txt）
python git-commits/batch-branch-operations.py create
```

### 3. 批次刪除分支

```bash
# 刪除 0001 到 0010 的分支
python git-commits/batch-branch-operations.py delete git-commits.txt 0001 0010

# 只刪除 0080 這個分支
python git-commits/batch-branch-operations.py delete git-commits.txt 0080
```

## 詳細說明

請參閱 [README-git-commits.md](./README-git-commits.md) 獲取完整的使用說明和範例。


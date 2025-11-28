# Git Commits 整理工具 (PowerShell 版本)
# 將指定分支的所有 commit 整理成格式化列表
#
# 使用方法:
#     .\generate-git-commits.ps1 [分支名稱] [輸出檔案名稱]
#
# 參數:
#     分支名稱: 要處理的 git 分支（預設: develop）
#     輸出檔案名稱: 輸出檔案名稱（預設: git-commits.txt）
#
# 範例:
#     .\generate-git-commits.ps1
#     .\generate-git-commits.ps1 main
#     .\generate-git-commits.ps1 develop git-commits-develop.txt

param(
    [string]$Branch = "develop",
    [string]$OutputFile = "git-commits.txt"
)

# 檢查是否在 git 儲存庫中
try {
    $null = git rev-parse --git-dir 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "錯誤: 當前目錄不是 git 儲存庫" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "錯誤: 找不到 git 命令，請確認已安裝 Git" -ForegroundColor Red
    exit 1
}

# 檢查分支是否存在
$branchExists = $false
try {
    $null = git show-ref --verify --quiet "refs/heads/$Branch" 2>$null
    if ($LASTEXITCODE -eq 0) {
        $branchExists = $true
    } else {
        # 嘗試檢查遠端分支
        $null = git show-ref --verify --quiet "refs/remotes/origin/$Branch" 2>$null
        if ($LASTEXITCODE -eq 0) {
            $Branch = "origin/$Branch"
            $branchExists = $true
            Write-Host "提示: 使用遠端分支 $Branch" -ForegroundColor Yellow
        }
    }
} catch {
    $branchExists = $false
}

if (-not $branchExists) {
    Write-Host "錯誤: 找不到分支 $Branch" -ForegroundColor Red
    exit 1
}

Write-Host "正在處理分支: $Branch" -ForegroundColor Cyan
Write-Host "輸出檔案: $OutputFile" -ForegroundColor Cyan
Write-Host ("-" * 50)

# 獲取 commit 列表
try {
    $commits = git log $Branch --oneline --reverse --no-merges 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "錯誤: 無法獲取 $Branch 分支的 commit 列表" -ForegroundColor Red
        exit 1
    }
    
    # 過濾空行並整理
    $commits = $commits | Where-Object { $_.Trim() -ne '' }
    
    if ($commits.Count -eq 0) {
        Write-Host "警告: $Branch 分支沒有任何 commit" -ForegroundColor Yellow
        exit 0
    }
    
    # 格式化 commit
    $formattedCommits = @()
    $index = 1
    foreach ($commit in $commits) {
        $num = $index.ToString().PadLeft(3, '0')
        $formattedCommits += "$num $commit"
        $index++
    }
    
    # 寫入檔案
    try {
        $formattedCommits -join "`n" | Out-File -FilePath $OutputFile -Encoding utf8 -NoNewline
        Write-Host "✓ 成功生成 $OutputFile" -ForegroundColor Green
        Write-Host "  共 $($formattedCommits.Count) 個 commit" -ForegroundColor Green
    } catch {
        Write-Host "錯誤: 無法寫入檔案 $OutputFile" -ForegroundColor Red
        Write-Host "錯誤訊息: $_" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "錯誤: 執行 git 命令時發生錯誤" -ForegroundColor Red
    Write-Host "錯誤訊息: $_" -ForegroundColor Red
    exit 1
}


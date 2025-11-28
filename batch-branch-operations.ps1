# Git 批次分支操作工具 (PowerShell 版本)
# 根據 git-commits.txt 批次創建或刪除分支
#
# 使用方法:
#     創建分支:
#         .\batch-branch-operations.ps1 create [git-commits.txt] [數量]
#     
#     刪除分支:
#         .\batch-branch-operations.ps1 delete [git-commits.txt] [起始序號-結束序號]
#         例如: .\batch-branch-operations.ps1 delete git-commits.txt 001-010
#
# 參數:
#     create: 批次創建分支
#     delete: 批次刪除分支
#     git-commits.txt: commit 清單檔案（預設: git-commits.txt）
#     數量: 要創建的分支數量（預設: 全部）
#     起始序號-結束序號: 要刪除的分支範圍，例如 001-010
#
# 範例:
#     # 創建前 5 個分支（用於測試）
#     .\batch-branch-operations.ps1 create git-commits.txt 5
#     
#     # 創建所有分支
#     .\batch-branch-operations.ps1 create git-commits.txt
#     
#     # 刪除 001 到 010 的分支
#     .\batch-branch-operations.ps1 delete git-commits.txt 001-010

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('create', 'delete')]
    [string]$Operation,
    
    [string]$CommitsFile = "git-commits.txt",
    [string]$ExtraArg = $null
)

# 檢查是否在 git 儲存庫中
function Test-GitRepo {
    try {
        $null = git rev-parse --git-dir 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "錯誤: 當前目錄不是 git 儲存庫或找不到 git 命令" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "錯誤: 找不到 git 命令，請確認已安裝 Git" -ForegroundColor Red
        exit 1
    }
}

# 獲取當前分支
function Get-CurrentBranch {
    try {
        $branch = git branch --show-current 2>$null
        if ($LASTEXITCODE -eq 0) {
            return $branch.Trim()
        }
    } catch {
        return $null
    }
    return $null
}

# 解析 commit 清單檔案
function Parse-CommitsFile {
    param([string]$Filename)
    
    if (-not (Test-Path $Filename)) {
        Write-Host "錯誤: 找不到檔案 $Filename" -ForegroundColor Red
        exit 1
    }
    
    $commits = @()
    $lines = Get-Content $Filename -Encoding UTF8
    
    foreach ($line in $lines) {
        $line = $line.Trim()
        if ([string]::IsNullOrWhiteSpace($line)) {
            continue
        }
        
        # 格式: 001 5122da3 Initial commit from Specify template
        $parts = $line -split '\s+', 3
        if ($parts.Count -ge 2) {
            $seq = $parts[0]
            $commitHash = $parts[1]
            $commits += @{
                Seq = $seq
                Hash = $commitHash
                BranchName = "$seq-$commitHash"
            }
        }
    }
    
    return $commits
}

# 批次創建分支
function Create-Branches {
    param(
        [array]$Commits,
        [int]$Count = 0
    )
    
    Test-GitRepo
    
    $currentBranch = Get-CurrentBranch
    if (-not $currentBranch) {
        Write-Host "警告: 無法確定當前分支，將繼續執行" -ForegroundColor Yellow
    }
    
    # 限制數量
    if ($Count -gt 0) {
        $Commits = $Commits[0..($Count - 1)]
    }
    
    Write-Host "準備創建 $($Commits.Count) 個分支" -ForegroundColor Cyan
    Write-Host "當前分支: $($currentBranch ?? '未知')" -ForegroundColor Cyan
    Write-Host ("-" * 50)
    
    # 確認操作
    $response = Read-Host "確定要繼續嗎？(y/N)"
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host "操作已取消" -ForegroundColor Yellow
        return
    }
    
    $successCount = 0
    $failCount = 0
    
    foreach ($commit in $Commits) {
        $branchName = $commit.BranchName
        $commitHash = $commit.Hash
        $seq = $commit.Seq
        
        Write-Host "[$seq] 正在創建分支: $branchName... " -NoNewline
        
        try {
            # 創建分支
            $null = git checkout -b $branchName $commitHash 2>&1
            if ($LASTEXITCODE -eq 0) {
                # 切換回原分支
                if ($currentBranch) {
                    $null = git switch $currentBranch 2>&1
                }
                Write-Host "✓" -ForegroundColor Green
                $successCount++
            } else {
                $errorOutput = git checkout -b $branchName $commitHash 2>&1 | Out-String
                if ($errorOutput -match 'already exists' -or $errorOutput -match '已存在') {
                    Write-Host "⚠ (分支已存在)" -ForegroundColor Yellow
                } else {
                    Write-Host "✗ 錯誤" -ForegroundColor Red
                    $failCount++
                }
            }
        } catch {
            Write-Host "✗ 錯誤: $_" -ForegroundColor Red
            $failCount++
        }
    }
    
    Write-Host ("-" * 50)
    Write-Host "完成！成功: $successCount, 失敗: $failCount" -ForegroundColor Cyan
}

# 批次刪除分支
function Delete-Branches {
    param(
        [array]$Commits,
        [int]$StartSeq,
        [int]$EndSeq
    )
    
    Test-GitRepo
    
    if ($StartSeq -gt $EndSeq) {
        Write-Host "錯誤: 起始序號不能大於結束序號" -ForegroundColor Red
        exit 1
    }
    
    # 篩選要刪除的分支
    $branchesToDelete = $Commits | Where-Object {
        $seqNum = [int]$_.Seq
        $seqNum -ge $StartSeq -and $seqNum -le $EndSeq
    }
    
    if ($branchesToDelete.Count -eq 0) {
        Write-Host "錯誤: 找不到序號範圍 $($StartSeq.ToString('000'))-$($EndSeq.ToString('000')) 的分支" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "準備刪除 $($branchesToDelete.Count) 個分支" -ForegroundColor Cyan
    Write-Host "範圍: $($StartSeq.ToString('000')) 到 $($EndSeq.ToString('000'))" -ForegroundColor Cyan
    Write-Host ("-" * 50)
    
    # 顯示將要刪除的分支
    Write-Host "將要刪除的分支:" -ForegroundColor Yellow
    foreach ($commit in $branchesToDelete) {
        Write-Host "  - $($commit.BranchName)" -ForegroundColor Yellow
    }
    
    # 確認操作
    $response = Read-Host "`n確定要刪除這些分支嗎？(y/N)"
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host "操作已取消" -ForegroundColor Yellow
        return
    }
    
    $currentBranch = Get-CurrentBranch
    
    $successCount = 0
    $failCount = 0
    
    foreach ($commit in $branchesToDelete) {
        $branchName = $commit.BranchName
        $seq = $commit.Seq
        
        # 如果當前在要刪除的分支上，先切換到其他分支
        if ($currentBranch -eq $branchName) {
            try {
                $null = git switch develop 2>&1
                if ($LASTEXITCODE -eq 0) {
                    $currentBranch = 'develop'
                } else {
                    $null = git switch main 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        $currentBranch = 'main'
                    } else {
                        Write-Host "錯誤: 無法切換分支，請手動切換後再刪除 $branchName" -ForegroundColor Red
                        $failCount++
                        continue
                    }
                }
            } catch {
                Write-Host "錯誤: 無法切換分支，請手動切換後再刪除 $branchName" -ForegroundColor Red
                $failCount++
                continue
            }
        }
        
        Write-Host "[$seq] 正在刪除分支: $branchName... " -NoNewline
        
        try {
            $null = git branch -D $branchName 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓" -ForegroundColor Green
                $successCount++
            } else {
                $errorOutput = git branch -D $branchName 2>&1 | Out-String
                if ($errorOutput -match 'not found' -or $errorOutput -match '找不到') {
                    Write-Host "⚠ (分支不存在)" -ForegroundColor Yellow
                } else {
                    Write-Host "✗ 錯誤" -ForegroundColor Red
                    $failCount++
                }
            }
        } catch {
            Write-Host "✗ 錯誤: $_" -ForegroundColor Red
            $failCount++
        }
    }
    
    Write-Host ("-" * 50)
    Write-Host "完成！成功: $successCount, 失敗: $failCount" -ForegroundColor Cyan
}

# 主程式
# 解析參數（PowerShell 參數處理）
if ($args.Count -gt 0) {
    # 如果第一個參數是檔案名稱
    if ($args[0] -and (Test-Path $args[0]) -and $args[0].EndsWith('.txt')) {
        $CommitsFile = $args[0]
        if ($args.Count -gt 1) {
            $ExtraArg = $args[1]
        }
    } elseif ($args[0] -and -not $args[0].EndsWith('.txt')) {
        $ExtraArg = $args[0]
    }
}

# 解析 commit 清單
$commits = Parse-CommitsFile -Filename $CommitsFile
if ($commits.Count -eq 0) {
    Write-Host "錯誤: $CommitsFile 中沒有找到任何 commit" -ForegroundColor Red
    exit 1
}

Write-Host "已讀取 $($commits.Count) 個 commit" -ForegroundColor Green

if ($Operation -eq 'create') {
    $count = 0
    if ($ExtraArg) {
        if ([int]::TryParse($ExtraArg, [ref]$count)) {
            # $count 已設定
        } else {
            Write-Host "錯誤: 無效的數量參數: $ExtraArg" -ForegroundColor Red
            exit 1
        }
    }
    Create-Branches -Commits $commits -Count $count
} elseif ($Operation -eq 'delete') {
    if (-not $ExtraArg) {
        Write-Host "錯誤: 刪除操作需要指定範圍，例如: 001-010" -ForegroundColor Red
        exit 1
    }
    
    # 解析範圍格式: 001-010
    if ($ExtraArg -match '^(\d+)-(\d+)$') {
        $startSeq = [int]$matches[1]
        $endSeq = [int]$matches[2]
        Delete-Branches -Commits $commits -StartSeq $startSeq -EndSeq $endSeq
    } else {
        Write-Host "錯誤: 範圍格式錯誤，應為: 起始序號-結束序號 (例如: 001-010)" -ForegroundColor Red
        exit 1
    }
}


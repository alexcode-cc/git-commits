# Git 批次分支操作工具 (PowerShell 版本)
# 根據 git-commits.txt 批次創建或刪除分支
#
# 使用方法:
#     創建分支:
#         .\batch-branch-operations.ps1 create [git-commits.txt] [起始序號] [結束序號]
#     
#     刪除分支:
#         .\batch-branch-operations.ps1 delete [git-commits.txt] [起始序號] [結束序號]
#         例如: .\batch-branch-operations.ps1 delete git-commits.txt 0001 0010
#
# 參數:
#     create: 批次創建分支
#     delete: 批次刪除分支
#     git-commits.txt: commit 清單檔案（預設: git-commits.txt）
#     起始序號: 要處理的起始序號（例如: 0080）
#     結束序號: 要處理的結束序號（可選，不指定則只處理起始序號）
#
# 範例:
#     # 創建 0001 到 0005 的分支（用於測試）
#     .\batch-branch-operations.ps1 create git-commits.txt 0001 0005
#     
#     # 只創建 0080 這個分支
#     .\batch-branch-operations.ps1 create git-commits.txt 0080
#     
#     # 創建所有分支
#     .\batch-branch-operations.ps1 create git-commits.txt
#     
#     # 刪除 0001 到 0010 的分支
#     .\batch-branch-operations.ps1 delete git-commits.txt 0001 0010
#     
#     # 只刪除 0080 這個分支
#     .\batch-branch-operations.ps1 delete git-commits.txt 0080

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
        [int]$StartSeq = -1,
        [int]$EndSeq = -1
    )
    
    Test-GitRepo
    
    $currentBranch = Get-CurrentBranch
    if (-not $currentBranch) {
        Write-Host "警告: 無法確定當前分支，將繼續執行" -ForegroundColor Yellow
    }
    
    # 解析範圍或使用全部
    if ($StartSeq -ge 0) {
        # 如果只指定了起始序號，則只處理該序號
        if ($EndSeq -lt 0) {
            $EndSeq = $StartSeq
        }
        
        if ($StartSeq -gt $EndSeq) {
            Write-Host "錯誤: 起始序號不能大於結束序號" -ForegroundColor Red
            exit 1
        }
        
        # 篩選要創建的分支
        $commitsToCreate = $Commits | Where-Object {
            $seqNum = [int]$_.Seq
            $seqNum -ge $StartSeq -and $seqNum -le $EndSeq
        }
        
        if ($commitsToCreate.Count -eq 0) {
            if ($StartSeq -eq $EndSeq) {
                Write-Host "錯誤: 找不到序號 $($StartSeq.ToString('0000')) 的 commit" -ForegroundColor Red
            } else {
                Write-Host "錯誤: 找不到序號範圍 $($StartSeq.ToString('0000')) 到 $($EndSeq.ToString('0000')) 的 commit" -ForegroundColor Red
            }
            exit 1
        }
        
        $Commits = $commitsToCreate
        if ($StartSeq -eq $EndSeq) {
            Write-Host "序號: $($StartSeq.ToString('0000'))" -ForegroundColor Cyan
        } else {
            Write-Host "範圍: $($StartSeq.ToString('0000')) 到 $($EndSeq.ToString('0000'))" -ForegroundColor Cyan
        }
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
    $skippedBranches = @()  # 記錄因為已存在而跳過的分支
    
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
                    Write-Host "⚠ (分支已存在，跳過)" -ForegroundColor Yellow
                    $skippedBranches += @{Seq = $seq; BranchName = $branchName}
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
    
    # 顯示跳過的分支
    if ($skippedBranches.Count -gt 0) {
        Write-Host "`n跳過的分支（因為已存在）: $($skippedBranches.Count) 個" -ForegroundColor Yellow
        foreach ($branch in $skippedBranches) {
            Write-Host "  - [$($branch.Seq)] $($branch.BranchName)" -ForegroundColor Yellow
        }
    }
}

# 批次刪除分支
function Delete-Branches {
    param(
        [array]$Commits,
        [int]$StartSeq,
        [int]$EndSeq = -1
    )
    
    Test-GitRepo
    
    # 如果只指定了起始序號，則只處理該序號
    if ($EndSeq -lt 0) {
        $EndSeq = $StartSeq
    }
    
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
        if ($StartSeq -eq $EndSeq) {
            Write-Host "錯誤: 找不到序號 $($StartSeq.ToString('0000')) 的分支" -ForegroundColor Red
        } else {
            Write-Host "錯誤: 找不到序號範圍 $($StartSeq.ToString('0000')) 到 $($EndSeq.ToString('0000')) 的分支" -ForegroundColor Red
        }
        exit 1
    }
    
    Write-Host "準備刪除 $($branchesToDelete.Count) 個分支" -ForegroundColor Cyan
    if ($StartSeq -eq $EndSeq) {
        Write-Host "序號: $($StartSeq.ToString('0000'))" -ForegroundColor Cyan
    } else {
        Write-Host "範圍: $($StartSeq.ToString('0000')) 到 $($EndSeq.ToString('0000'))" -ForegroundColor Cyan
    }
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
    $skippedBranches = @()  # 記錄無法刪除的分支
    
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
                        $skippedBranches += @{Seq = $seq; BranchName = $branchName; Reason = '無法切換分支'}
                        $failCount++
                        continue
                    }
                }
            } catch {
                Write-Host "錯誤: 無法切換分支，請手動切換後再刪除 $branchName" -ForegroundColor Red
                $skippedBranches += @{Seq = $seq; BranchName = $branchName; Reason = '無法切換分支'}
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
                    Write-Host "⚠ (分支不存在，跳過)" -ForegroundColor Yellow
                } else {
                    Write-Host "✗ (無法刪除，跳過)" -ForegroundColor Red
                    $reason = ($errorOutput -split "`n")[0].Trim()
                    if ([string]::IsNullOrWhiteSpace($reason)) {
                        $reason = '未知原因'
                    }
                    $skippedBranches += @{Seq = $seq; BranchName = $branchName; Reason = $reason}
                    $failCount++
                }
            }
        } catch {
            Write-Host "✗ (無法刪除，跳過)" -ForegroundColor Red
            $skippedBranches += @{Seq = $seq; BranchName = $branchName; Reason = $_.ToString()}
            $failCount++
        }
    }
    
    Write-Host ("-" * 50)
    Write-Host "完成！成功: $successCount, 失敗: $failCount" -ForegroundColor Cyan
    
    # 顯示無法刪除的分支
    if ($skippedBranches.Count -gt 0) {
        Write-Host "`n無法刪除的分支: $($skippedBranches.Count) 個" -ForegroundColor Yellow
        foreach ($branch in $skippedBranches) {
            Write-Host "  - [$($branch.Seq)] $($branch.BranchName) ($($branch.Reason))" -ForegroundColor Yellow
        }
    }
}

# 主程式
# 解析參數（PowerShell 參數處理）
$startSeq = -1
$endSeq = -1

if ($args.Count -gt 0) {
    # 如果第一個參數是檔案名稱
    if ($args[0] -and (Test-Path $args[0]) -and $args[0].EndsWith('.txt')) {
        $CommitsFile = $args[0]
        # 從第二個參數開始可能是序號
        if ($args.Count -gt 1) {
            if ([int]::TryParse($args[1], [ref]$startSeq)) {
                if ($args.Count -gt 2) {
                    if (-not [int]::TryParse($args[2], [ref]$endSeq)) {
                        Write-Host "錯誤: 結束序號必須是數字" -ForegroundColor Red
                        exit 1
                    }
                }
            } else {
                Write-Host "錯誤: 起始序號必須是數字" -ForegroundColor Red
                Write-Host "使用方式: .\batch-branch-operations.ps1 create git-commits.txt [起始序號] [結束序號]" -ForegroundColor Yellow
                Write-Host "範例: .\batch-branch-operations.ps1 create git-commits.txt 0080 0100" -ForegroundColor Yellow
                Write-Host "範例: .\batch-branch-operations.ps1 create git-commits.txt 0080  (只處理 0080)" -ForegroundColor Yellow
                exit 1
            }
        }
    } elseif ($args[0] -and -not $args[0].EndsWith('.txt')) {
        # 第一個參數就是序號
        if ([int]::TryParse($args[0], [ref]$startSeq)) {
            if ($args.Count -gt 1) {
                if (-not [int]::TryParse($args[1], [ref]$endSeq)) {
                    Write-Host "錯誤: 結束序號必須是數字" -ForegroundColor Red
                    exit 1
                }
            }
        } else {
            Write-Host "錯誤: 起始序號必須是數字" -ForegroundColor Red
            exit 1
        }
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
    Create-Branches -Commits $commits -StartSeq $startSeq -EndSeq $endSeq
} elseif ($Operation -eq 'delete') {
    if ($startSeq -lt 0) {
        Write-Host "錯誤: 刪除操作需要指定序號，例如: 0001 或 0001 0010" -ForegroundColor Red
        exit 1
    }
    Delete-Branches -Commits $commits -StartSeq $startSeq -EndSeq $endSeq
}


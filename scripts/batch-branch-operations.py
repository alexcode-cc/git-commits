#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Git 批次分支操作工具
根據 git-commits.txt 批次創建或刪除分支

使用方法:
    創建分支:
        python batch-branch-operations.py create [git-commits.txt] [起始序號] [結束序號]
    
    刪除分支:
        python batch-branch-operations.py delete [git-commits.txt] [起始序號] [結束序號]
        例如: python batch-branch-operations.py delete git-commits.txt 0001 0010

參數:
    create: 批次創建分支
    delete: 批次刪除分支
    git-commits.txt: commit 清單檔案（預設: git-commits.txt）
    起始序號: 要處理的起始序號（例如: 0080）
    結束序號: 要處理的結束序號（可選，不指定則只處理起始序號）

範例:
    # 創建 0001 到 0005 的分支（用於測試）
    python batch-branch-operations.py create git-commits.txt 0001 0005
    
    # 只創建 0080 這個分支
    python batch-branch-operations.py create git-commits.txt 0080
    
    # 創建所有分支
    python batch-branch-operations.py create git-commits.txt
    
    # 刪除 0001 到 0010 的分支
    python batch-branch-operations.py delete git-commits.txt 0001 0010
    
    # 只刪除 0080 這個分支
    python batch-branch-operations.py delete git-commits.txt 0080
"""

import subprocess
import sys
import os
import re


def parse_commits_file(filename='git-commits.txt'):
    """解析 commit 清單檔案"""
    commits = []
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                # 格式: 001 5122da3 Initial commit from Specify template
                parts = line.split(None, 2)
                if len(parts) >= 2:
                    seq = parts[0]
                    commit_hash = parts[1]
                    commits.append({
                        'seq': seq,
                        'hash': commit_hash,
                        'branch_name': f"{seq}-{commit_hash}"
                    })
        return commits
    except FileNotFoundError:
        print(f"錯誤: 找不到檔案 {filename}")
        sys.exit(1)
    except Exception as e:
        print(f"錯誤: 讀取檔案 {filename} 時發生錯誤: {e}")
        sys.exit(1)


def check_git_repo():
    """檢查是否在 git 儲存庫中"""
    try:
        subprocess.run(['git', 'rev-parse', '--git-dir'],
                      capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("錯誤: 當前目錄不是 git 儲存庫或找不到 git 命令")
        sys.exit(1)


def get_current_branch():
    """獲取當前分支名稱"""
    try:
        result = subprocess.run(['git', 'branch', '--show-current'],
                               capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except:
        return None


def create_branches(commits, start_seq=None, end_seq=None):
    """批次創建分支"""
    check_git_repo()
    
    current_branch = get_current_branch()
    if not current_branch:
        print("警告: 無法確定當前分支，將繼續執行")
    
    # 解析範圍或使用全部
    if start_seq is not None:
        # 如果只指定了起始序號，則只處理該序號
        if end_seq is None:
            end_seq = start_seq
        
        if start_seq > end_seq:
            print("錯誤: 起始序號不能大於結束序號")
            sys.exit(1)
        
        # 篩選要創建的分支
        commits_to_create = []
        for commit in commits:
            seq_num = int(commit['seq'])
            if start_seq <= seq_num <= end_seq:
                commits_to_create.append(commit)
        
        if not commits_to_create:
            if start_seq == end_seq:
                print(f"錯誤: 找不到序號 {start_seq:04d} 的 commit")
            else:
                print(f"錯誤: 找不到序號範圍 {start_seq:04d} 到 {end_seq:04d} 的 commit")
            sys.exit(1)
        
        commits = commits_to_create
        if start_seq == end_seq:
            print(f"序號: {start_seq:04d}")
        else:
            print(f"範圍: {start_seq:04d} 到 {end_seq:04d}")
    
    print(f"準備創建 {len(commits)} 個分支")
    print(f"當前分支: {current_branch or '未知'}")
    print("-" * 50)
    
    # 確認操作
    response = input("確定要繼續嗎？(y/N): ").strip().lower()
    if response != 'y':
        print("操作已取消")
        return
    
    success_count = 0
    fail_count = 0
    skipped_branches = []  # 記錄因為已存在而跳過的分支
    
    for commit in commits:
        branch_name = commit['branch_name']
        commit_hash = commit['hash']
        seq = commit['seq']
        
        print(f"[{seq}] 正在創建分支: {branch_name}...", end=' ')
        
        try:
            # 創建分支並切換回原分支
            subprocess.run(['git', 'checkout', '-b', branch_name, commit_hash],
                          capture_output=True, check=True)
            if current_branch:
                subprocess.run(['git', 'switch', current_branch],
                              capture_output=True, check=True)
            print("✓")
            success_count += 1
        except subprocess.CalledProcessError as e:
            error_msg = e.stderr.decode('utf-8', errors='ignore') if e.stderr else str(e.stderr)
            # 檢查是否因為分支已存在而失敗
            if 'already exists' in error_msg.lower() or '已存在' in error_msg:
                print("⚠ (分支已存在，跳過)")
                skipped_branches.append({'seq': seq, 'branch_name': branch_name})
            else:
                print(f"✗ 錯誤: {error_msg}")
                fail_count += 1
    
    print("-" * 50)
    print(f"完成！成功: {success_count}, 失敗: {fail_count}")
    
    # 顯示跳過的分支
    if skipped_branches:
        print(f"\n跳過的分支（因為已存在）: {len(skipped_branches)} 個")
        for branch in skipped_branches:
            print(f"  - [{branch['seq']}] {branch['branch_name']}")


def delete_branches(commits, start_seq, end_seq=None):
    """批次刪除分支"""
    check_git_repo()
    
    # 如果只指定了起始序號，則只處理該序號
    if end_seq is None:
        end_seq = start_seq
    
    # 確保是整數
    try:
        start_num = int(start_seq)
        end_num = int(end_seq)
        if start_num > end_num:
            print("錯誤: 起始序號不能大於結束序號")
            sys.exit(1)
    except (ValueError, TypeError):
        print(f"錯誤: 無效的序號格式")
        sys.exit(1)
    
    # 篩選要刪除的分支
    branches_to_delete = []
    for commit in commits:
        seq_num = int(commit['seq'])
        if start_num <= seq_num <= end_num:
            branches_to_delete.append(commit)
    
    if not branches_to_delete:
        if start_num == end_num:
            print(f"錯誤: 找不到序號 {start_num:04d} 的分支")
        else:
            print(f"錯誤: 找不到序號範圍 {start_num:04d} 到 {end_num:04d} 的分支")
        sys.exit(1)
    
    print(f"準備刪除 {len(branches_to_delete)} 個分支")
    if start_num == end_num:
        print(f"序號: {start_num:04d}")
    else:
        print(f"範圍: {start_num:04d} 到 {end_num:04d}")
    print("-" * 50)
    
    # 顯示將要刪除的分支
    print("將要刪除的分支:")
    for commit in branches_to_delete:
        print(f"  - {commit['branch_name']}")
    
    # 確認操作
    response = input("\n確定要刪除這些分支嗎？(y/N): ").strip().lower()
    if response != 'y':
        print("操作已取消")
        return
    
    current_branch = get_current_branch()
    
    success_count = 0
    fail_count = 0
    skipped_branches = []  # 記錄無法刪除的分支
    
    for commit in branches_to_delete:
        branch_name = commit['branch_name']
        seq = commit['seq']
        
        # 如果當前在要刪除的分支上，先切換到其他分支
        if current_branch == branch_name:
            try:
                subprocess.run(['git', 'switch', 'develop'],
                              capture_output=True, check=True)
                current_branch = 'develop'
            except:
                try:
                    subprocess.run(['git', 'switch', 'main'],
                                  capture_output=True, check=True)
                    current_branch = 'main'
                except:
                    print(f"錯誤: 無法切換分支，請手動切換後再刪除 {branch_name}")
                    skipped_branches.append({'seq': seq, 'branch_name': branch_name, 'reason': '無法切換分支'})
                    fail_count += 1
                    continue
        
        print(f"[{seq}] 正在刪除分支: {branch_name}...", end=' ')
        
        try:
            subprocess.run(['git', 'branch', '-D', branch_name],
                          capture_output=True, check=True)
            print("✓")
            success_count += 1
        except subprocess.CalledProcessError as e:
            error_msg = e.stderr.decode('utf-8', errors='ignore') if e.stderr else str(e.stderr)
            if 'not found' in error_msg.lower() or '找不到' in error_msg:
                print("⚠ (分支不存在，跳過)")
            else:
                print(f"✗ (無法刪除，跳過)")
                skipped_branches.append({'seq': seq, 'branch_name': branch_name, 'reason': error_msg.strip()})
                fail_count += 1
    
    print("-" * 50)
    print(f"完成！成功: {success_count}, 失敗: {fail_count}")
    
    # 顯示無法刪除的分支
    if skipped_branches:
        print(f"\n無法刪除的分支: {len(skipped_branches)} 個")
        for branch in skipped_branches:
            reason = branch.get('reason', '未知原因')
            print(f"  - [{branch['seq']}] {branch['branch_name']} ({reason})")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    operation = sys.argv[1].lower()
    
    if operation not in ['create', 'delete']:
        print(f"錯誤: 無效的操作 '{operation}'，請使用 'create' 或 'delete'")
        print(__doc__)
        sys.exit(1)
    
    # 解析參數
    commits_file = 'git-commits.txt'
    start_seq = None
    end_seq = None
    
    if len(sys.argv) >= 3:
        # 檢查第三個參數是檔案名稱還是序號
        # 優先檢查是否為檔案（以 .txt 結尾或存在）
        if sys.argv[2].endswith('.txt') or os.path.exists(sys.argv[2]):
            commits_file = sys.argv[2]
            # 從第四個參數開始可能是序號
            if len(sys.argv) >= 4:
                try:
                    # 使用 base=10 強制使用十進制，避免前導零被解釋為八進制
                    start_seq = int(sys.argv[3], 10)
                    if len(sys.argv) >= 5:
                        end_seq = int(sys.argv[4], 10)
                except ValueError as e:
                    print(f"錯誤: 序號必須是數字 (接收到: {repr(sys.argv[3])})")
                    print("使用方式: python batch-branch-operations.py create git-commits.txt [起始序號] [結束序號]")
                    print("範例: python batch-branch-operations.py create git-commits.txt 0080 0100")
                    print("範例: python batch-branch-operations.py create git-commits.txt 0080  (只處理 0080)")
                    sys.exit(1)
        else:
            # 第二個參數可能是序號（嘗試解析為數字）
            try:
                # 使用 base=10 強制使用十進制，避免前導零被解釋為八進制
                start_seq = int(sys.argv[2], 10)
                if len(sys.argv) >= 4:
                    end_seq = int(sys.argv[3], 10)
            except ValueError:
                # 如果無法解析為數字，可能是檔案名稱
                commits_file = sys.argv[2]
                if len(sys.argv) >= 4:
                    try:
                        start_seq = int(sys.argv[3], 10)
                        if len(sys.argv) >= 5:
                            end_seq = int(sys.argv[4], 10)
                    except ValueError as e:
                        print(f"錯誤: 序號必須是數字 (接收到: {repr(sys.argv[3])})")
                        sys.exit(1)
    
    # 解析 commit 清單
    commits = parse_commits_file(commits_file)
    if not commits:
        print(f"錯誤: {commits_file} 中沒有找到任何 commit")
        sys.exit(1)
    
    print(f"已讀取 {len(commits)} 個 commit")
    
    if operation == 'create':
        create_branches(commits, start_seq, end_seq)
    elif operation == 'delete':
        if start_seq is None:
            print("錯誤: 刪除操作需要指定序號，例如: 0001 或 0001 0010")
            sys.exit(1)
        delete_branches(commits, start_seq, end_seq)


if __name__ == '__main__':
    main()


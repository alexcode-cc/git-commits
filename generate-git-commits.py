#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Git Commits 整理工具
將指定分支的所有 commit 整理成格式化列表

使用方法:
    python generate-git-commits.py [分支名稱] [輸出檔案名稱]

參數:
    分支名稱: 要處理的 git 分支（預設: develop）
    輸出檔案名稱: 輸出檔案名稱（預設: git-commits.txt）

範例:
    python generate-git-commits.py
    python generate-git-commits.py main
    python generate-git-commits.py develop git-commits-develop.txt
"""

import subprocess
import sys
import os


def get_commits(branch='develop'):
    """獲取指定分支的所有 commit（按時間順序，從最早到最晚）"""
    try:
        # 使用 git log 獲取 commit 列表，--reverse 確保從最早到最晚
        result = subprocess.run(
            ['git', 'log', branch, '--oneline', '--reverse', '--no-merges'],
            capture_output=True,
            text=True,
            encoding='utf-8',
            check=True
        )
        
        commits = [line.strip() for line in result.stdout.strip().split('\n') if line.strip()]
        return commits
    except subprocess.CalledProcessError as e:
        print(f"錯誤: 無法獲取 {branch} 分支的 commit 列表")
        print(f"Git 錯誤訊息: {e.stderr}")
        sys.exit(1)
    except FileNotFoundError:
        print("錯誤: 找不到 git 命令，請確認已安裝 Git")
        sys.exit(1)


def format_commits(commits):
    """將 commit 列表格式化為指定格式"""
    formatted = []
    for i, commit in enumerate(commits, start=1):
        # 序號補零到 3 位數
        num = f"{i:03d}"
        formatted.append(f"{num} {commit}")
    return formatted


def write_output(formatted_commits, output_file='git-commits.txt'):
    """將格式化後的 commit 寫入檔案"""
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(formatted_commits))
        print(f"✓ 成功生成 {output_file}")
        print(f"  共 {len(formatted_commits)} 個 commit")
    except IOError as e:
        print(f"錯誤: 無法寫入檔案 {output_file}")
        print(f"錯誤訊息: {e}")
        sys.exit(1)


def main():
    # 解析命令列參數
    branch = 'develop'
    output_file = 'git-commits.txt'
    
    if len(sys.argv) >= 2:
        branch = sys.argv[1]
    if len(sys.argv) >= 3:
        output_file = sys.argv[2]
    
    # 檢查是否在 git 儲存庫中
    try:
        subprocess.run(['git', 'rev-parse', '--git-dir'], 
                      capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("錯誤: 當前目錄不是 git 儲存庫或找不到 git 命令")
        sys.exit(1)
    
    # 檢查分支是否存在
    try:
        subprocess.run(['git', 'show-ref', '--verify', '--quiet', f'refs/heads/{branch}'],
                      capture_output=True, check=True)
    except subprocess.CalledProcessError:
        # 嘗試檢查遠端分支
        try:
            subprocess.run(['git', 'show-ref', '--verify', '--quiet', f'refs/remotes/origin/{branch}'],
                          capture_output=True, check=True)
            print(f"提示: {branch} 是遠端分支，將使用遠端分支")
            branch = f'origin/{branch}'
        except subprocess.CalledProcessError:
            print(f"錯誤: 找不到分支 {branch}")
            sys.exit(1)
    
    print(f"正在處理分支: {branch}")
    print(f"輸出檔案: {output_file}")
    print("-" * 50)
    
    # 獲取 commit 列表
    commits = get_commits(branch)
    
    if not commits:
        print(f"警告: {branch} 分支沒有任何 commit")
        sys.exit(0)
    
    # 格式化 commit
    formatted_commits = format_commits(commits)
    
    # 寫入檔案
    write_output(formatted_commits, output_file)


if __name__ == '__main__':
    main()


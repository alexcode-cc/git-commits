# Git Commits Management Tool

**[繁體中文版 (Traditional Chinese)](./README-git-commits-CHT.md)**

This tool organizes all commits from a specified git branch into a formatted list for easy viewing and management.

> **Note**: All tool files are located in the `git-commits/` directory. Copy this tool directory as a subdirectory under the parent directory of the target project, at the same level as the target project directory. Execute these scripts in the **target project root directory**, or use relative paths pointing to files in the `git-commits/` directory.

## Features

- Automatically retrieve all commits from a specified branch (from earliest to latest)
- Automatic numbering (4-digit zero-padded format: 0001, 0002, 0003...)
- Exclude merge commits
- Support for local and remote branches
- Output format: `sequence commit-hash commit-message`

## Usage

### Python Version (Recommended, Cross-platform)

```bash
# Execute in project root directory, use default settings (develop branch, output to git-commits.txt in current directory)
python ../git-commits/generate-git-commits.py

# Specify branch name
python ../git-commits/generate-git-commits.py main

# Specify branch and output file name
python ../git-commits/generate-git-commits.py develop git-commits-develop.txt
```

### PowerShell Version (Windows)

```powershell
# Execute in project root directory, use default settings (develop branch, output to git-commits/git-commits.txt)
..\git-commits\generate-git-commits.ps1

# Specify branch name
..\git-commits\generate-git-commits.ps1 main

# Specify branch and output file name
..\git-commits\generate-git-commits.ps1 develop git-commits/git-commits-develop.txt
```

## Output Format Example

```
0001 5122da3 Initial commit
0002 ce322f4 chore: Add project .gitignore configuration
0003 bafbcb0 docs(constitution): Add project charter document
0004 9b1e0a2 docs(spec): Add software feature specification document
...
```

## Requirements

- Git (installed and in PATH)
- Python 3.x (when using Python version)
- PowerShell 5.1+ (when using PowerShell version)

## Notes

1. Execute this script in the root directory of a git repository
2. If the specified branch doesn't exist, the script will automatically check remote branches
3. The output file will overwrite any existing file with the same name
4. The script automatically excludes merge commits

## Troubleshooting

### Branch Not Found

If you encounter a "branch not found" error, please verify:
- Branch name is spelled correctly
- Branch exists (use `git branch -a` to view all branches)
- If it's a remote branch, ensure you've executed `git fetch`

### Encoding Issues

If Chinese characters appear as garbled text in the output file:
- Python version: Script is configured with UTF-8 encoding, should not have issues
- PowerShell version: Ensure terminal supports UTF-8 encoding

## Batch Branch Operations Tool

In addition to generating commit lists, batch branch operation tools are provided to create or delete branches in batches based on `git-commits.txt`.

### Features

- **Batch create branches**: Automatically create branches based on commit list, branch name format is `sequence-commit-hash`
- **Range specification**: Support specifying sequence number ranges for branch creation (e.g., 0001 0005), convenient for testing
- **Single sequence**: Support processing only a single sequence number (e.g., 0080)
- **Batch delete branches**: Delete branches in batches based on sequence number ranges
- **Safety confirmation**: Requires confirmation before execution to avoid accidental operations

### Usage

#### Python Version

```bash
# Execute in project root directory, create branches 0001 to 0010 (for testing)
python ../git-commits/batch-branch-operations.py create git-commits.txt 0001 0010

# Create only branch 0080
python ../git-commits/batch-branch-operations.py create git-commits.txt 0080

# Create all branches (using default git-commits.txt)
python ../git-commits/batch-branch-operations.py create

# Delete branches 0001 to 0010
python ../git-commits/batch-branch-operations.py delete git-commits.txt 0001 0010

# Delete only branch 0080
python ../git-commits/batch-branch-operations.py delete git-commits.txt 0080
```

#### PowerShell Version

```powershell
# Execute in project root directory, create branches 0001 to 0010 (for testing)
..\git-commits\batch-branch-operations.ps1 create git-commits.txt 0001 0010

# Create only branch 0080
..\git-commits\batch-branch-operations.ps1 create git-commits.txt 0080

# Create all branches (using default git-commits.txt)
..\git-commits\batch-branch-operations.ps1 create

# Delete branches 0001 to 0010
..\git-commits\batch-branch-operations.ps1 delete git-commits.txt 0001 0010

# Delete only branch 0080
..\git-commits\batch-branch-operations.ps1 delete git-commits.txt 0080
```

### Branch Naming Convention

Created branch name format: `sequence-commit-hash`

Examples:
- `0001-5122da3`
- `0002-ce322f4`
- `0003-bafbcb0`

### Notes

1. **When creating branches**:
   - Can specify sequence range (e.g., `0001 0010`), or only specify a single sequence (e.g., `0080`), or omit parameters to create all branches
   - Will automatically create branches from each commit in the specified range
   - Will automatically switch back to the original branch (develop or main) after creation
   - If branch already exists, will skip and display a warning

2. **When deleting branches**:
   - Need to specify sequence numbers, format: `start-sequence [end-sequence]` (e.g., `0001 0010` or `0080`)
   - If currently on a branch to be deleted, will automatically switch to develop or main
   - If branch doesn't exist, will skip and display a warning

3. **Safety mechanisms**:
   - All operations require confirmation before execution
   - Delete operations will first display the list of branches to be deleted

### Usage Example

```bash
# 1. First generate commit list (execute in project root directory, will create git-commits.txt)
python ../git-commits/generate-git-commits.py develop

# 2. Test creating branches 0001 to 0003
python ../git-commits/batch-branch-operations.py create git-commits.txt 0001 0003

# 3. After confirming no issues, create all branches
python ../git-commits/batch-branch-operations.py create

# 4. After completing work, delete test branches
python ../git-commits/batch-branch-operations.py delete git-commits.txt 0001 0003

# Or process only a single sequence
python ../git-commits/batch-branch-operations.py create git-commits.txt 0080
python ../git-commits/batch-branch-operations.py delete git-commits.txt 0080
```

## License

This tool is free to use and modify.

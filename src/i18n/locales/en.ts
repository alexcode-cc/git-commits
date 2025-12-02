/**
 * English (en) translations
 */

export const en = {
  common: {
    error: 'Error',
    warning: 'Warning',
    success: 'Success',
    hint: 'Hint',
    yes: 'y',
    no: 'N',
    total: 'Total',
    completed: 'Completed',
    failed: 'Failed',
    skipped: 'Skipped',
    branches: 'branches',
    commits: 'commits',
  },

  git: {
    notRepository: 'Current directory is not a git repository or git command not found',
    branchNotFound: 'Branch not found: {branch}',
    branchDetected: 'Auto-detected branch {branch}',
    branchIsRemote: '{branch} is a remote branch, will use {fullName}',
    currentBranch: 'Current branch',
    processing: 'Processing branch: {branch}',
    cannotSwitch: 'Cannot switch branch, please manually switch and then delete {branch}',
    noDefaultBranch: 'No default branch found (tried: {branches})',
    cannotGetCommits: 'Cannot get commit list for {branch}: {error}',
    noBranches: 'No branches found created by git-commits tool.',
    cannotGetBranches: 'Cannot get local branch list: {error}',
    cannotDetermineCurrentBranch: 'Cannot determine current branch, will continue',
  },

  file: {
    outputFile: 'Output file: {file}',
    fileNotFound: 'File not found: {file}',
    noCommits: '{file} contains no commits',
    noData: 'File {file} contains no commit data.',
  },

  generate: {
    noCommitsInBranch: '{branch} branch has no commits',
    generatedSuccess: '✓ Successfully generated {file}',
    commitsCount: '  Total {count} commits',
  },

  branch: {
    creating: 'Creating branch: {branch}',
    deleting: 'Deleting branch: {branch}',
    created: '✓',
    deleted: '✓',
    alreadyExists: '⚠ (Branch already exists, skipped)',
    notFound: '⚠ (Branch not found, skipped)',
    cannotDelete: '✗ (Cannot delete, skipped)',
    commitsRead: 'Read {count} commits',
    range: 'Range: {range}',
    preparing: 'Preparing to create {count} branches',
    preparingDelete: 'Preparing to delete {count} branches',
    toBeDeleted: 'Branches to be deleted:',
    confirmCreate: 'Continue?',
    confirmDelete: '\nAre you sure you want to delete these branches?',
    cancelled: 'Operation cancelled',
    rangeNotFound: 'Cannot find commits in range {range}',
    noCommitsFound: 'No commits found in {file}',
    success: 'Completed! Success: {success}, Failed: {fail}',
    skippedExists: '\nSkipped branches (already exist): {count}',
    skippedCannotDelete: '\nBranches that cannot be deleted: {count}',
    notSpecifiedDeleteAll: 'No sequence number specified, will delete all branches created by this tool',
  },

  list: {
    checkedOutBranches: '\nChecked Out Branch List:',
    seqHashBranch: 'Seq   Hash     Branch Name',
    commitList: '\nCommit List ({file}):',
    seqHashMessage: 'Seq   Hash     Message',
  },

  cli: {
    description: 'Git commits management tool - Generate commit list and batch branch operations',
    generateDesc: 'Generate commit list for specified branch (auto-detect develop/main/master if not specified)',
    createDesc: 'Batch create branches from commit list',
    deleteDesc: 'Batch delete branches from commit list (delete all if no sequence number specified)',
    listDesc: 'List currently checked out branches (only branches created by this tool)',
    listAllDesc: 'List all commit content in git-commits file',
    branchArg: 'Branch name (auto-detect by default)',
    fileArg: 'Commit list file',
    startArg: 'Start sequence number (e.g., 0001 or 1)',
    endArg: 'End sequence number (optional)',
    outputOpt: 'Output filename',
    mergesOpt: 'Include merge commits',
    yesOpt: 'Skip confirmation prompt',
    invalidStartSeq: 'Invalid start sequence number: {seq}',
    invalidEndSeq: 'Invalid end sequence number: {seq}',
  },
} as const;

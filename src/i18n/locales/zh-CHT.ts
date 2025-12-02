/**
 * Traditional Chinese (zh-CHT) translations
 */

export const zhCHT = {
  common: {
    error: '錯誤',
    warning: '警告',
    success: '成功',
    hint: '提示',
    yes: 'y',
    no: 'N',
    total: '總計',
    completed: '完成',
    failed: '失敗',
    skipped: '跳過',
    branches: '個分支',
    commits: '個 commits',
  },

  git: {
    notRepository: '當前目錄不是 git 儲存庫或找不到 git 命令',
    branchNotFound: '找不到分支: {branch}',
    branchDetected: '自動偵測到分支 {branch}',
    branchIsRemote: '{branch} 是遠端分支，將使用 {fullName}',
    currentBranch: '當前分支',
    processing: '正在處理分支: {branch}',
    cannotSwitch: '無法切換分支，請手動切換後再刪除 {branch}',
    noDefaultBranch: '找不到預設分支（已嘗試: {branches}）',
    cannotGetCommits: '無法獲取 {branch} 分支的 commit 列表: {error}',
    noBranches: '找不到由 git-commits 工具創建的分支。',
    cannotGetBranches: '無法獲取本地分支列表: {error}',
    cannotDetermineCurrentBranch: '無法確定當前分支，將繼續執行',
  },

  file: {
    outputFile: '輸出檔案: {file}',
    fileNotFound: '找不到檔案: {file}',
    noCommits: '{file} 中沒有找到任何 commit',
    noData: '檔案 {file} 中沒有 commit 資料。',
  },

  generate: {
    noCommitsInBranch: '{branch} 分支沒有任何 commit',
    generatedSuccess: '✓ 成功生成 {file}',
    commitsCount: '  共 {count} 個 commit',
  },

  branch: {
    creating: '正在創建分支: {branch}',
    deleting: '正在刪除分支: {branch}',
    created: '✓',
    deleted: '✓',
    alreadyExists: '⚠ (分支已存在，跳過)',
    notFound: '⚠ (分支不存在，跳過)',
    cannotDelete: '✗ (無法刪除，跳過)',
    commitsRead: '已讀取 {count} 個 commit',
    range: '範圍: {range}',
    preparing: '準備創建 {count} 個分支',
    preparingDelete: '準備刪除 {count} 個分支',
    toBeDeleted: '將要刪除的分支:',
    confirmCreate: '確定要繼續嗎？',
    confirmDelete: '\n確定要刪除這些分支嗎？',
    cancelled: '操作已取消',
    rangeNotFound: '找不到序號範圍 {range} 的 commit',
    noCommitsFound: '{file} 中沒有找到任何 commit',
    success: '完成！成功: {success}, 失敗: {fail}',
    skippedExists: '\n跳過的分支（因為已存在）: {count} 個',
    skippedCannotDelete: '\n無法刪除的分支: {count} 個',
    notSpecifiedDeleteAll: '未指定序號，將刪除所有本工具產生的分支',
  },

  list: {
    checkedOutBranches: '\n已 Checkout 的分支列表:',
    seqHashBranch: '序號  Hash     分支名稱',
    commitList: '\nCommit 清單 ({file}):',
    seqHashMessage: '序號  Hash     訊息',
  },

  cli: {
    description: 'Git commits 管理工具集 - 生成 commit 清單與批次分支操作',
    generateDesc: '生成指定分支的 commit 清單（未指定時自動偵測 develop/main/master）',
    createDesc: '根據 commit 清單批次創建分支',
    deleteDesc: '根據 commit 清單批次刪除分支（未指定序號時刪除全部）',
    listDesc: '列出目前已經 checkout 的分支（只包含此工具 checkout 出來的分支）',
    listAllDesc: '列出 git-commits 的所有分支內容',
    branchArg: '分支名稱（預設自動偵測）',
    fileArg: 'commit 清單檔案',
    startArg: '起始序號（例如: 0001 或 1）',
    endArg: '結束序號（可選）',
    outputOpt: '輸出檔案名稱',
    mergesOpt: '包含 merge commits',
    yesOpt: '跳過確認提示',
    invalidStartSeq: '無效的起始序號: {seq}',
    invalidEndSeq: '無效的結束序號: {seq}',
  },
} as const;

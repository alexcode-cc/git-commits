/**
 * Simplified Chinese (zh-CHS) translations
 */

export const zhCHS = {
  common: {
    error: '错误',
    warning: '警告',
    success: '成功',
    hint: '提示',
    yes: 'y',
    no: 'N',
    total: '总计',
    completed: '完成',
    failed: '失败',
    skipped: '跳过',
    branches: '个分支',
    commits: '个 commits',
  },

  git: {
    notRepository: '当前目录不是 git 仓库或找不到 git 命令',
    branchNotFound: '找不到分支: {branch}',
    branchDetected: '自动检测到分支 {branch}',
    branchIsRemote: '{branch} 是远程分支，将使用 {fullName}',
    currentBranch: '当前分支',
    processing: '正在处理分支: {branch}',
    cannotSwitch: '无法切换分支，请手动切换后再删除 {branch}',
    noDefaultBranch: '找不到默认分支（已尝试: {branches}）',
    cannotGetCommits: '无法获取 {branch} 分支的 commit 列表: {error}',
    noBranches: '找不到由 git-commits 工具创建的分支。',
    cannotGetBranches: '无法获取本地分支列表: {error}',
    cannotDetermineCurrentBranch: '无法确定当前分支，将继续执行',
  },

  file: {
    outputFile: '输出文件: {file}',
    fileNotFound: '找不到文件: {file}',
    noCommits: '{file} 中没有找到任何 commit',
    noData: '文件 {file} 中没有 commit 数据。',
  },

  generate: {
    noCommitsInBranch: '{branch} 分支没有任何 commit',
    generatedSuccess: '✓ 成功生成 {file}',
    commitsCount: '  共 {count} 个 commit',
  },

  branch: {
    creating: '正在创建分支: {branch}',
    deleting: '正在删除分支: {branch}',
    created: '✓',
    deleted: '✓',
    alreadyExists: '⚠ (分支已存在，跳过)',
    notFound: '⚠ (分支不存在，跳过)',
    cannotDelete: '✗ (无法删除，跳过)',
    commitsRead: '已读取 {count} 个 commit',
    range: '范围: {range}',
    preparing: '准备创建 {count} 个分支',
    preparingDelete: '准备删除 {count} 个分支',
    toBeDeleted: '将要删除的分支:',
    confirmCreate: '确定要继续吗？',
    confirmDelete: '\n确定要删除这些分支吗？',
    cancelled: '操作已取消',
    rangeNotFound: '找不到序号范围 {range} 的 commit',
    noCommitsFound: '{file} 中没有找到任何 commit',
    success: '完成！成功: {success}, 失败: {fail}',
    skippedExists: '\n跳过的分支（因为已存在）: {count} 个',
    skippedCannotDelete: '\n无法删除的分支: {count} 个',
    notSpecifiedDeleteAll: '未指定序号，将删除所有本工具产生的分支',
  },

  list: {
    checkedOutBranches: '\n已 Checkout 的分支列表:',
    seqHashBranch: '序号  Hash     分支名称',
    commitList: '\nCommit 清单 ({file}):',
    seqHashMessage: '序号  Hash     消息',
  },

  cli: {
    description: 'Git commits 管理工具集 - 生成 commit 清单与批次分支操作',
    generateDesc: '生成指定分支的 commit 清单（未指定时自动检测 develop/main/master）',
    createDesc: '根据 commit 清单批次创建分支',
    deleteDesc: '根据 commit 清单批次删除分支（未指定序号时删除全部）',
    listDesc: '列出目前已经 checkout 的分支（只包含此工具 checkout 出来的分支）',
    listAllDesc: '列出 git-commits 的所有分支内容',
    branchArg: '分支名称（默认自动检测）',
    fileArg: 'commit 清单文件',
    startArg: '起始序号（例如: 0001 或 1）',
    endArg: '结束序号（可选）',
    outputOpt: '输出文件名称',
    mergesOpt: '包含 merge commits',
    yesOpt: '跳过确认提示',
    invalidStartSeq: '无效的起始序号: {seq}',
    invalidEndSeq: '无效的结束序号: {seq}',
  },
} as const;

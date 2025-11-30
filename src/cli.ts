/**
 * Git Commits 工具集 CLI
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { generateCommitsCLI } from './generate-commits.js';
import { createBranchesCLI, deleteBranchesCLI } from './batch-branch-operations.js';

import { listBranchesCLI, listAllCommitsCLI } from './list-commits.js';

const program = new Command();

program
  .name('git-commits')
  .description('Git commits 管理工具集 - 生成 commit 清單與批次分支操作')
  .version('1.0.0');

// generate 命令 - 生成 commit 清單
program
  .command('generate')
  .alias('gen')
  .description('生成指定分支的 commit 清單（未指定時自動偵測 develop/main/master）')
  .argument('[branch]', '分支名稱（預設自動偵測）')
  .option('-o, --output <file>', '輸出檔案名稱', 'git-commits.log')
  .option('-m, --include-merges', '包含 merge commits', false)
  .action(async (branch: string | undefined, options: { output: string; includeMerges: boolean }) => {
    await generateCommitsCLI({
      branch,
      outputFile: options.output,
      includeMerges: options.includeMerges,
    });
  });

// create 命令 - 批次創建分支
program
  .command('create')
  .description('根據 commit 清單批次創建分支')
  .argument('[file]', 'commit 清單檔案', 'git-commits.log')
  .argument('[start]', '起始序號（例如: 0001 或 1）')
  .argument('[end]', '結束序號（可選）')
  .option('-y, --yes', '跳過確認提示', false)
  .action(
    async (
      file: string,
      start: string | undefined,
      end: string | undefined,
      options: { yes: boolean }
    ) => {
      // 解析序號
      let startSeq: number | undefined;
      let endSeq: number | undefined;

      // 檢查 file 參數是否實際上是序號
      if (file && /^\d+$/.test(file)) {
        startSeq = parseInt(file, 10);
        if (start && /^\d+$/.test(start)) {
          endSeq = parseInt(start, 10);
        }
        file = 'git-commits.log';
      } else {
        if (start) {
          startSeq = parseInt(start, 10);
          if (isNaN(startSeq)) {
            console.error(chalk.red(`錯誤: 無效的起始序號: ${start}`));
            process.exit(1);
          }
        }
        if (end) {
          endSeq = parseInt(end, 10);
          if (isNaN(endSeq)) {
            console.error(chalk.red(`錯誤: 無效的結束序號: ${end}`));
            process.exit(1);
          }
        }
      }

      await createBranchesCLI({
        commitsFile: file,
        startSeq,
        endSeq,
        skipConfirm: options.yes,
      });
    }
  );

// delete 命令 - 批次刪除分支
program
  .command('delete')
  .alias('del')
  .description('根據 commit 清單批次刪除分支（未指定序號時刪除全部）')
  .argument('[file]', 'commit 清單檔案', 'git-commits.log')
  .argument('[start]', '起始序號（例如: 0001 或 1，未指定則刪除全部）')
  .argument('[end]', '結束序號（可選）')
  .option('-y, --yes', '跳過確認提示', false)
  .action(
    async (
      file: string,
      start: string | undefined,
      end: string | undefined,
      options: { yes: boolean }
    ) => {
      // 解析序號
      let startSeq: number | undefined;
      let endSeq: number | undefined;

      // 檢查 file 參數是否實際上是序號
      if (file && /^\d+$/.test(file)) {
        startSeq = parseInt(file, 10);
        if (start && /^\d+$/.test(start)) {
          endSeq = parseInt(start, 10);
        }
        file = 'git-commits.log';
      } else {
        if (start) {
          startSeq = parseInt(start, 10);
          if (isNaN(startSeq)) {
            console.error(chalk.red(`錯誤: 無效的起始序號: ${start}`));
            process.exit(1);
          }
        }
        if (end) {
          endSeq = parseInt(end, 10);
          if (isNaN(endSeq)) {
            console.error(chalk.red(`錯誤: 無效的結束序號: ${end}`));
            process.exit(1);
          }
        }
      }

      await deleteBranchesCLI({
        commitsFile: file,
        startSeq,
        endSeq,
        skipConfirm: options.yes,
      });
    }
  );

// list 命令 - 列出已 checkout 的分支
program
  .command('list')
  .description('列出目前已經 checkout 的分支（只包含此工具 checkout 出來的分支）')
  .action(async () => {
    await listBranchesCLI();
  });

// list-all 命令 - 列出所有 commit 內容
program
  .command('list-all')
  .description('列出 git-commits 的所有分支內容')
  .argument('[file]', 'commit 清單檔案', 'git-commits.log')
  .action(async (file: string) => {
    await listAllCommitsCLI(file);
  });

// 顯示使用範例
program.on('--help', () => {
  console.log('');
  console.log('範例:');
  console.log('  $ git-commits generate develop');
  console.log('  $ git-commits generate main -o my-commits.txt');
  console.log('  $ git-commits create git-commits.log 0001 0010');
  console.log('  $ git-commits create 0080');
  console.log('  $ git-commits delete git-commits.log 0001 0010');
  console.log('  $ git-commits delete 0080');
  console.log('  $ git-commits list');
  console.log('  $ git-commits list-all');
});

program.parse();


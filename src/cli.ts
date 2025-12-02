/**
 * Git Commits 工具集 CLI
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { generateCommitsCLI } from './generate-commits.js';
import { createBranchesCLI, deleteBranchesCLI } from './batch-branch-operations.js';
import { listBranchesCLI, listAllCommitsCLI } from './list-commits.js';
import { t, setLocale, detectLocale } from './i18n/index.js';

// Detect locale from CLI flags
const args = process.argv;
let detectedLocale: string | undefined;
if (args.includes('--CHT')) {
  detectedLocale = 'CHT';
} else if (args.includes('--CHS')) {
  detectedLocale = 'CHS';
}

// Set locale
setLocale(detectLocale(detectedLocale));

const program = new Command();

program
  .name('git-commits')
  .description(t('cli.description'))
  .version('1.0.0')
  .option('--CHT', 'Use Traditional Chinese')
  .option('--CHS', 'Use Simplified Chinese');

// generate 命令 - 生成 commit 清單
program
  .command('generate')
  .alias('gen')
  .description(t('cli.generateDesc'))
  .argument('[branch]', t('cli.branchArg'))
  .option('-o, --output <file>', t('cli.outputOpt'), 'git-commits.log')
  .option('-m, --include-merges', t('cli.mergesOpt'), false)
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
  .description(t('cli.createDesc'))
  .argument('[file]', t('cli.fileArg'), 'git-commits.log')
  .argument('[start]', t('cli.startArg'))
  .argument('[end]', t('cli.endArg'))
  .option('-y, --yes', t('cli.yesOpt'), false)
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
            console.error(chalk.red(`${t('common.error')}: ${t('cli.invalidStartSeq', { seq: start })}`));
            process.exit(1);
          }
        }
        if (end) {
          endSeq = parseInt(end, 10);
          if (isNaN(endSeq)) {
            console.error(chalk.red(`${t('common.error')}: ${t('cli.invalidEndSeq', { seq: end })}`));
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
  .description(t('cli.deleteDesc'))
  .argument('[file]', t('cli.fileArg'), 'git-commits.log')
  .argument('[start]', t('cli.startArg'))
  .argument('[end]', t('cli.endArg'))
  .option('-y, --yes', t('cli.yesOpt'), false)
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
            console.error(chalk.red(`${t('common.error')}: ${t('cli.invalidStartSeq', { seq: start })}`));
            process.exit(1);
          }
        }
        if (end) {
          endSeq = parseInt(end, 10);
          if (isNaN(endSeq)) {
            console.error(chalk.red(`${t('common.error')}: ${t('cli.invalidEndSeq', { seq: end })}`));
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
  .description(t('cli.listDesc'))
  .action(async () => {
    await listBranchesCLI();
  });

// list-all 命令 - 列出所有 commit 內容
program
  .command('list-all')
  .description(t('cli.listAllDesc'))
  .argument('[file]', t('cli.fileArg'), 'git-commits.log')
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


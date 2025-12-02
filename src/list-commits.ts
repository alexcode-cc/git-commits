import chalk from 'chalk';
import { getLocalBranches } from './utils/git.js';
import { parseCommitsFile } from './utils/file.js';
import { t } from './i18n/index.js';

/**
 * 列出此工具創建的分支
 */
export async function listBranchesCLI(): Promise<void> {
    try {
        const branches = await getLocalBranches();

        // 過濾出符合 NNNN-hash 格式的分支
        const toolBranches = branches.filter(branch => /^\d{4}-[a-f0-9]+$/.test(branch));

        if (toolBranches.length === 0) {
            console.log(chalk.yellow(t('git.noBranches')));
            return;
        }

        console.log(chalk.cyan.bold(t('list.checkedOutBranches')));
        console.log(chalk.gray('----------------------------------------'));
        console.log(chalk.bold(t('list.seqHashBranch')));
        console.log(chalk.gray('----------------------------------------'));

        for (const branch of toolBranches) {
            const parts = branch.split('-');
            const seq = parts[0];
            const hash = parts[1];

            console.log(`${chalk.green(seq)}  ${chalk.yellow(hash)}  ${branch}`);
        }
        console.log(chalk.gray('----------------------------------------'));
        console.log(chalk.blue(`${t('common.total')}: ${toolBranches.length} ${t('common.branches')}\n`));

    } catch (error: unknown) {
        const err = error as Error;
        console.error(chalk.red(`${t('common.error')}: ${err.message}`));
        process.exit(1);
    }
}

/**
 * 列出 git-commits 檔案的所有內容
 * @param file 檔案路徑
 */
export async function listAllCommitsCLI(file: string = 'git-commits.log'): Promise<void> {
    try {
        let commits;
        try {
            commits = await parseCommitsFile(file);
        } catch (e) {
            // 如果是預設檔案且找不到，嘗試讀取 .txt
            if (file === 'git-commits.log') {
                try {
                    commits = await parseCommitsFile('git-commits.txt');
                    file = 'git-commits.txt';
                } catch (innerE) {
                    // 如果兩個都找不到，拋出原始錯誤
                    throw e;
                }
            } else {
                throw e;
            }
        }

        if (commits.length === 0) {
            console.log(chalk.yellow(t('file.noData', { file })));
            return;
        }

        console.log(chalk.cyan.bold(t('list.commitList', { file })));
        console.log(chalk.gray('------------------------------------------------------------'));
        console.log(chalk.bold(t('list.seqHashMessage')));
        console.log(chalk.gray('------------------------------------------------------------'));

        for (const commit of commits) {
            console.log(
                `${chalk.green(commit.seq)}  ${chalk.yellow(commit.hash)}  ${commit.message || ''}`
            );
        }
        console.log(chalk.gray('------------------------------------------------------------'));
        console.log(chalk.blue(`${t('common.total')}: ${commits.length} ${t('common.commits')}\n`));

    } catch (error: unknown) {
        const err = error as Error;
        console.error(chalk.red(`${t('common.error')}: ${err.message}`));
        process.exit(1);
    }
}

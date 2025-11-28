/**
 * 終端機互動工具函數
 */

import * as readline from 'readline';

/**
 * 詢問使用者確認
 * @param message 提示訊息
 * @returns 使用者是否確認
 */
export async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

/**
 * 列印分隔線
 * @param length 分隔線長度
 */
export function printSeparator(length = 50): void {
  console.log('-'.repeat(length));
}


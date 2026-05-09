import { access, mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { afterEach, describe, expect, it } from 'vitest';
import { createBranch, execGit, getCurrentBranch } from '../src/utils/git.js';

const execFileAsync = promisify(execFile);
const originalCwd = process.cwd();
const tempDirs: string[] = [];

async function createTempGitRepo(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'git-commits-git-'));
  tempDirs.push(dir);

  await execFileAsync('git', ['init'], { cwd: dir });
  await writeFile(join(dir, 'README.md'), '# test\n', 'utf-8');
  await execFileAsync('git', ['add', 'README.md'], { cwd: dir });
  await execFileAsync(
    'git',
    ['-c', 'user.name=Test User', '-c', 'user.email=test@example.com', 'commit', '-m', 'Initial commit'],
    { cwd: dir }
  );

  return dir;
}

afterEach(async () => {
  process.chdir(originalCwd);
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('execGit', () => {
  it('passes arguments without invoking a shell', async () => {
    const marker = join(tmpdir(), `git-commits-injection-${Date.now()}.txt`);

    await execGit(['--version', '&', 'echo', 'injected', '>', marker]);

    await expect(access(marker)).rejects.toThrow();
  });
});

describe('createBranch', () => {
  it('creates a branch without changing the current branch', async () => {
    const repo = await createTempGitRepo();
    process.chdir(repo);
    const currentBranch = await getCurrentBranch();

    const result = await createBranch('0001-abcdef1', 'HEAD');

    await expect(execGit(['show-ref', '--verify', '--quiet', 'refs/heads/0001-abcdef1'])).resolves.toMatchObject({
      exitCode: 0,
    });
    await expect(getCurrentBranch()).resolves.toBe(currentBranch);
    expect(result).toEqual({ success: true });
  });
});

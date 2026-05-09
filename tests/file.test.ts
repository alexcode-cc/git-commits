import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { filterCommitsByRange, formatCommits, parseCommitsFile } from '../src/utils/file.js';

const tempDirs: string[] = [];

async function tempFile(content: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'git-commits-file-'));
  tempDirs.push(dir);
  const file = join(dir, 'git-commits.log');
  await writeFile(file, content, 'utf-8');
  return file;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('parseCommitsFile', () => {
  it('parses valid commit lines and normalizes hashes', async () => {
    const file = await tempFile('0001 ABCDEF1 Initial commit\n0002 1234567890abcdef Fix bug\n');

    await expect(parseCommitsFile(file)).resolves.toEqual([
      {
        seq: '0001',
        hash: 'abcdef1',
        message: 'Initial commit',
        branchName: '0001-abcdef1',
      },
      {
        seq: '0002',
        hash: '1234567890abcdef',
        message: 'Fix bug',
        branchName: '0002-1234567890abcdef',
      },
    ]);
  });

  it('rejects malformed lines with filename and line number', async () => {
    const file = await tempFile('0001 abcdef1 OK\nbad-input\n');

    await expect(parseCommitsFile(file)).rejects.toThrow(`${file}:2`);
  });
});

describe('formatCommits', () => {
  it('formats raw git log lines into deterministic branch names', () => {
    expect(formatCommits(['abcdef1 Initial commit'])).toEqual([
      {
        seq: '0001',
        hash: 'abcdef1',
        message: 'Initial commit',
        branchName: '0001-abcdef1',
      },
    ]);
  });
});

describe('filterCommitsByRange', () => {
  it('filters inclusive ranges by numeric sequence', () => {
    const commits = formatCommits(['aaaaaaa first', 'bbbbbbb second', 'ccccccc third']);

    expect(filterCommitsByRange(commits, 2, 3).map((commit) => commit.seq)).toEqual([
      '0002',
      '0003',
    ]);
  });
});

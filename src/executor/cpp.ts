import { spawn } from 'child_process';
import { platform } from 'node:process';
import { join, dirname } from 'node:path';
import * as vscode from 'vscode';
import { v4 } from 'uuid';

const cpp = vscode.workspace
  .getConfiguration('algorithm-helper')
  .get<string>('filepath-cpp');

async function checkEnvironment(): Promise<boolean> {
  if (cpp === undefined) {
    return false;
  }

  const executor = spawn(cpp, ['--version']);

  const exitCode = await new Promise<number>((resolve) => {
    executor.on('close', (code) => {
      resolve(code ?? 0);
    });
  });

  if (exitCode !== 0) {
    return false;
  }
  return true;
}

export async function getExecutor(source: string): Promise<Executor> {
  if ((await checkEnvironment()) === false) {
    throw new Error('C++ 파일 경로가 설정되지 않았습니다');
  }

  let exeFile = '';
  let cmdCompile = '';
  let cmdExecute = '';
  let cmdCleanup = '';

  if (platform === 'win32') {
    exeFile = join(dirname(source), `${v4()}.exe`);
    cmdCompile = cpp!;
    cmdExecute = exeFile;
    cmdCleanup = 'del';
  } else {
    exeFile = join(dirname(source), `${v4()}.out`);
    cmdCompile = cpp!;
    cmdExecute = exeFile;
    cmdCleanup = 'rm';
  }

  return {
    compile: { command: cmdCompile, args: [source, '-o', exeFile] },
    execute: { command: cmdExecute, args: [] },
    cleanup: { command: cmdCleanup, args: [exeFile] },
  };
}

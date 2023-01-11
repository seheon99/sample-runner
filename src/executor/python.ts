import { spawn } from 'child_process';
import * as vscode from 'vscode';
import { runCommand } from '.';

const python = vscode.workspace
  .getConfiguration('algorithm-helper')
  .get<string>('filepath-python');

async function checkEnvironment(): Promise<boolean> {
  if (python === undefined) {
    return false;
  }

  const executor = spawn(python, ['--version']);

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
    throw new Error('파이썬 파일 경로가 설정되지 않았습니다');
  }

  return {
    execute: async (input?: string) =>
      await runCommand(python!, [source], input),
  };
}

import { spawn } from 'child_process';
import * as vscode from 'vscode';

import { RuntimeException } from '.';

const python = vscode.workspace
  .getConfiguration('algorithm-helper')
  .get<string>('filepath-python');

async function checkEnvironment(): Promise<boolean> {
  if (python === undefined) {
    return false;
  }

  const executor = spawn(python, ['--version']);

  let data = '';
  for await (const chunk of executor.stdout) {
    data += chunk;
  }

  const exitCode = await new Promise<number>((resolve) => {
    executor.on('close', (code) => {
      resolve(code ?? 0);
    });
  });

  if (exitCode !== 0 || data.startsWith('Python') === false) {
    return false;
  }

  return true;
}

export default async function executePython(
  filepath: string,
  input: string,
): Promise<string> {
  if ((await checkEnvironment()) === false) {
    throw new Error('파이썬 파일 경로가 설정되지 않았습니다');
  }

  const executor = spawn(python!, [filepath]);

  try {
    executor.stdin.write(input);
    executor.stdin.end();
  } catch {
    throw new RuntimeException('입력 스트림이 닫혀있습니다');
  }

  let data = '';
  for await (const chunk of executor.stdout) {
    data += chunk;
  }

  let error = '';
  for await (const chunk of executor.stderr) {
    error += chunk;
  }

  const exitCode = await new Promise<number>((resolve) => {
    executor.on('close', (code) => {
      resolve(code ?? 0);
    });
  });

  if (exitCode !== 0) {
    throw new RuntimeException(error);
  }
  return data;
}

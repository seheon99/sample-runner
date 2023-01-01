import { spawn } from 'child_process';
import * as vscode from 'vscode';

import { CompileException, RuntimeException } from '.';

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

export async function compileCpp(filepath: string, outputFilename: string) {
  if ((await checkEnvironment()) === false) {
    throw new Error('C++ 파일 경로가 설정되지 않았습니다');
  }

  const executor = spawn(cpp!, [filepath, '-o', outputFilename]);

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
    throw new CompileException(error);
  }
}

export async function executeCpp(filepath: string, input: string) {
  const executor = spawn(filepath);

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

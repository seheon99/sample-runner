import { spawn } from 'child_process';
import { platform } from 'node:process';
import { join, dirname } from 'node:path';
import { unlink } from 'node:fs';
import * as vscode from 'vscode';
import { v4 } from 'uuid';
import { runCommand } from '.';
import { InvalidEnvironmentException } from '../common/exceptions/invalid-environment.exception';

export async function getExecutor(source: string): Promise<Executor> {
  if ((await checkEnvironment()) === false) {
    throw new InvalidEnvironmentException(
      `C++ compiler not available. Please check the configuration "${cppConfigName}" in the settings.`,
    );
  }

  if (platform === 'win32') {
    return getWindowExecutor(source);
  } else {
    return getPosixExecutor(source);
  }
}

function getWindowExecutor(source: string): Executor {
  const exeFile = join(dirname(source), `${v4()}.exe`);

  return {
    compile: async () => await runCommand(cpp!, [source, '-o', exeFile]),
    execute: async (input?: string) => await runCommand(exeFile, [], input),
    cleanup: async () => {
      await new Promise<void>((resolve, reject) => {
        unlink(exeFile, (err) => (err ? reject(err) : resolve()));
      });

      return {
        data: `${exeFile} was deleted`,
        error: '',
        exitCode: 0,
      };
    },
  };
}

function getPosixExecutor(source: string): Executor {
  const exeFile = join(dirname(source), `${v4()}.out`);

  return {
    compile: async () => await runCommand(cpp!, [source, '-o', exeFile]),
    execute: async (input?: string) => await runCommand(exeFile, [], input),
    cleanup: async () => await runCommand('rm', [exeFile]),
  };
}

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

const cppConfigName = 'algorithm-helper.filepath-cpp';

const cpp = vscode.workspace
  .getConfiguration(cppConfigName.split('.')[0])
  .get<string>(cppConfigName.split('.')[1]);

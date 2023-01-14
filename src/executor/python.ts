import { spawn } from 'child_process';
import * as vscode from 'vscode';
import { runCommand } from '.';
import { InvalidEnvironmentException } from '../common/exceptions/invalid-environment.exception';

export async function getExecutor(source: string): Promise<Executor> {
  if ((await checkEnvironment()) === false) {
    throw new InvalidEnvironmentException(
      `Python not available. Please check the configuration "${pythonConfigName}" in the settings.`,
    );
  }

  return {
    execute: async (input?: string) =>
      await runCommand(python!, [source], input),
  };
}

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

const pythonConfigName = 'algorithm-helper.filepath-python';

const python = vscode.workspace
  .getConfiguration(pythonConfigName.split('.')[0])
  .get<string>(pythonConfigName.split('.')[1]);

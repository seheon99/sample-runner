import * as vscode from 'vscode';
import { getExecutor } from './executor';
import { judge } from './judger';
import { findSample } from './sampler';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'sample-runner.checkSamples',
    main,
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {
  // nothing to do
}

async function main() {
  const filename = await findFilename();
  const samples = await findSample();
  const executor = await getExecutor(filename);
  const outputChannel = vscode.window.createOutputChannel('Sample Runner');
  outputChannel.show();

  if (executor.compile) {
    const { error, exitCode } = await executor.compile();
    if (isError(exitCode, outputChannel, error)) {
      return;
    }
  }

  if (executor.execute) {
    await judge(executor.execute, samples, outputChannel);
  }

  if (executor.cleanup) {
    const { error, exitCode } = await executor.cleanup();

    if (isError(exitCode, outputChannel, error)) {
      return;
    }
  }
}

async function findFilename(): Promise<string> {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    throw new Error('No active editor');
  }

  const filename = editor.document.fileName;
  return filename!;
}

function isError(
  exitCode: number,
  outputChannel: vscode.OutputChannel,
  errorMessage: string,
): boolean {
  if (exitCode !== 0) {
    outputChannel.appendLine(errorMessage);
    vscode.window.showErrorMessage('Sample Runner: Error occured');
    return true;
  }
  return false;
}

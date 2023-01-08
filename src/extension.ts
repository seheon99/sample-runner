import * as vscode from 'vscode';
import { getExecutor, runCommand } from './executor';
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
    await runCommand(executor.compile);
  }

  if (executor.execute) {
    await judge(executor.execute, samples, outputChannel);
  }

  if (executor.cleanup) {
    await runCommand(executor.cleanup);
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

import * as vscode from 'vscode';

export async function judge(
  executeCommand: Command,
  samples: Sample[],
  outputChannel: vscode.OutputChannel,
) {
  let success = 0;
  for (const sample of samples) {
    const result = await executeCommand(sample.input);
    printResult(outputChannel, sample.input, sample.output, result);
    if (result.exitCode === 0 && result.data === sample.output) {
      success += 1;
    }
  }
  outputChannel.appendLine('----------------------------------------');
  outputChannel.appendLine(`Correct ${success} / Total ${samples.length}`);
}

function printResult(
  outputChannel: vscode.OutputChannel,
  input: string,
  expect: string,
  result: CommandResult,
) {
  outputChannel.appendLine('----------------------------------------');
  outputChannel.appendLine('INPUT');
  outputChannel.appendLine(input);

  if (result.exitCode !== 0) {
    outputChannel.appendLine('ERROR :(');
    outputChannel.appendLine(result.error);
  } else {
    outputChannel.appendLine('EXPECT');
    outputChannel.appendLine(expect + '\n');
    outputChannel.appendLine('OUTPUT');
    outputChannel.appendLine(result.data + '\n');
    if (result.data === expect) {
      outputChannel.appendLine('CORRECT :)');
    } else {
      outputChannel.appendLine('WRONG :(');
    }
  }
}

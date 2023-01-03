import axios from 'axios';
import { load } from 'cheerio';
import * as vscode from 'vscode';

import {
  CompileException,
  execute,
  RuntimeException,
  TimeoutException,
} from './executor';

interface Sample {
  input: string;
  output: string;
}

async function findProblemID() {
  const query = await vscode.window.showInputBox({
    placeHolder: '문제 번호',
    prompt: '문제 번호를 입력하세요',
  });
  const problemId = parseInt(query!);

  if (Number.isNaN(problemId)) {
    throw new Error('숫자를 입력해주세요');
  }
  return problemId;
}

async function findSample(id: number): Promise<Sample[]> {
  const res = await axios.get(`https://www.acmicpc.net/problem/${id}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const $ = load(res.data);
  const data = $('pre.sampledata');
  const dataCount = data.length / 2;
  const samples: Sample[] = [];

  for (let i = 1; i <= dataCount; i++) {
    const input = $(`#sample-input-${i}`).text();
    const output = $(`#sample-output-${i}`).text().trim();
    samples.push({ input, output });
  }

  return samples;
}

async function testSample(pid: number, samples: Sample[]) {
  const channel = vscode.window.createOutputChannel('Sample Runner');
  channel.show();

  channel.appendLine(`${pid}번 문제의 테스트를 시작합니다`);
  for (const sample of samples) {
    const { input, output } = sample;

    try {
      const result = await execute(input);

      if (result === output) {
        channel.appendLine('정답입니다 :)');
      } else {
        channel.appendLine('오답입니다 :(');
        channel.appendLine('입력');
        channel.appendLine(input);
        channel.appendLine('');
        channel.appendLine('정답');
        channel.appendLine(output);
        channel.appendLine('');
        channel.appendLine('결과');
        channel.appendLine(result);
        channel.appendLine('');
      }
    } catch (error) {
      if (error instanceof CompileException) {
        channel.appendLine('컴파일에 실패했습니다 :(');
        channel.appendLine(error.message);
      } else if (error instanceof RuntimeException) {
        channel.appendLine('실행에 실패했습니다 :(');
        channel.appendLine(error.message);
      } else if (error instanceof TimeoutException) {
        channel.appendLine('시간 초과입니다 :(');
      } else {
        throw error;
      }
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'sample-runner.checkSamples',
    async () => {
      const pid = await findProblemID();
      const samples = await findSample(pid);
      await testSample(pid, samples);
    },
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}

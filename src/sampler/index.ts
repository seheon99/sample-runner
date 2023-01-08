import * as vscode from 'vscode';

import axios from 'axios';
import { load } from 'cheerio';

export async function findSample(): Promise<Sample[]> {
  const problemID = await findProblemID();
  const res = await axios.get(`https://www.acmicpc.net/problem/${problemID}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const $ = load(res.data);
  const data = $('pre.sampledata');
  const dataCount = data.length / 2;
  const samples: Sample[] = [];

  for (let i = 1; i <= dataCount; i++) {
    const input = $(`#sample-input-${i}`).text();
    const output = $(`#sample-output-${i}`).text().trimEnd();
    samples.push({ input, output });
  }

  return samples;
}

async function findProblemID() {
  const query = await vscode.window.showInputBox({
    placeHolder: 'Problem ID',
    prompt: 'Enter problem ID',
  });
  const problemId = parseInt(query!);

  if (Number.isNaN(problemId)) {
    throw new Error('Please enter a number');
  }
  return problemId;
}

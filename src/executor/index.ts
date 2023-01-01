import * as vscode from 'vscode';

import { compileCpp, executeCpp } from './cpp';
import executePython from './python';

export class CompileException extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, CompileException.prototype);
  }
}

export class RuntimeException extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, RuntimeException.prototype);
  }
}

export class TimeoutException extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, TimeoutException.prototype);
  }
}

export async function execute(input: string) {
  const editor = vscode.window.activeTextEditor;
  if (editor === undefined) {
    throw new Error('편집기가 열려있지 않습니다');
  }
  editor.document.save();

  const filename = editor.document.fileName;

  let result = '';
  if (filename.endsWith('.py')) {
    result = await executePython(filename, input);
  } else if (filename.endsWith('.cpp')) {
    await compileCpp(filename, 'a.out');
    result = await executeCpp('a.out', input);
  }

  return result.replace(/\r\n/g, '\n').trim();
}

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

export async function execute(filename: string, input: string) {
  let result = '';
  if (filename.endsWith('.py')) {
    result = await executePython(filename, input);
  } else if (filename.endsWith('.cpp')) {
    await compileCpp(filename, 'a.out');
    result = await executeCpp('a.out', input);
  } else {
    throw new Error('지원하지 않는 확장자입니다');
  }

  return result.replace(/\r\n/g, '\n').trim();
}

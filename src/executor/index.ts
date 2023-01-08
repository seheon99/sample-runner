import { spawn } from 'node:child_process';
import { getExecutor as getPythonExecutor } from './python';
import { getExecutor as getCppExecutor } from './cpp';

export async function getExecutor(filename: string): Promise<Executor> {
  if (filename.endsWith('.py')) {
    return await getPythonExecutor(filename);
  } else if (filename.endsWith('.cpp')) {
    return await getCppExecutor(filename);
  } else {
    throw new Error('Unsupported file type');
  }
}

export async function runCommand(
  command: Command,
  input?: string,
): Promise<CommandResult> {
  const process = spawn(command.command, command.args);

  const sigtermTimer = setTimeout(() => {
    process.kill('SIGTERM');
  }, 10000);

  const sigkillTimer = setTimeout(() => {
    process.kill('SIGKILL');
  }, 20000);

  if (process.stdin.writable) {
    process.stdin.end(input);
  } else if (input !== undefined) {
    throw new Error('STDIN is not writable');
  }

  let data = '';
  for await (const chunk of process.stdout) {
    data += chunk;
  }

  let error = '';
  for await (const chunk of process.stderr) {
    error += chunk;
  }

  const exitCode = await new Promise<number>((resolve) => {
    process.on('close', (code) => {
      clearTimeout(sigtermTimer);
      clearTimeout(sigkillTimer);
      resolve(code ?? 0);
    });
  });

  return {
    data: data.replace(/\s*\r\n/g, '\n').trimEnd(),
    error,
    exitCode,
  };
}

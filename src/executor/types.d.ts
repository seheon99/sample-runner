type Command = {
  command: string;
  args?: string[];
};

type CommandResult = {
  data: string;
  error: string;
  exitCode: number;
};

type Executor = {
  compile?: Command;
  execute: Command;
  cleanup?: Command;
};

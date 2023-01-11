type Executor = {
  compile?: Command;
  execute: Command;
  cleanup?: Command;
};

type Command = (input?: string) => Promise<CommandResult>;

type CommandResult = {
  data: string;
  error: string;
  exitCode: number;
};

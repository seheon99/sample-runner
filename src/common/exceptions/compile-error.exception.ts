import { Exception } from '.';

export class CompileErrorException extends Exception {
  constructor(
    description = 'Compile error occurred',
    private readonly errorMessage: string,
  ) {
    super(description);
  }

  public initMessage() {
    this.message = `${this.description}\n\n${this.errorMessage})`;
  }
}

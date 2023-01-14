import { Exception } from '.';

export class InvalidUserInputException extends Exception {
  constructor(
    description = 'Invalid user input',

    private expected?: string,
    private actual?: string,
  ) {
    super(description);
  }

  public initMessage() {
    this.message = `${this.description} (Expected: ${this.expected}, Actual: ${this.actual})`;
  }
}

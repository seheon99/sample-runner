export * from './invalid-user-input.exception';
export * from './runtime-error.exception';

export class Exception extends Error {
  constructor(protected readonly description?: string) {
    super(description);
    this.initMessage();
    this.initName();
  }

  public initMessage(): void {
    if (this.description) {
      this.message = this.description;
    } else if (this.constructor) {
      this.message = this.constructor.name
        .match(/[A-Z][a-z]+|[0-9]+/g)!
        .join(' ');
    }
  }

  public initName(): void {
    this.name = this.constructor.name;
  }
}

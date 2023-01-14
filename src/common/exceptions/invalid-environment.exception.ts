import { Exception } from '.';

export class InvalidEnvironmentException extends Exception {
  constructor(description?: string) {
    super(description);
  }
}

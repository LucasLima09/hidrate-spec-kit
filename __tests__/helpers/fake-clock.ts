export class FakeClock {
  private current: Date;

  constructor(start: Date) {
    this.current = new Date(start.getTime());
  }

  readonly now = (): Date => new Date(this.current.getTime());

  set(date: Date): void {
    this.current = new Date(date.getTime());
  }

  advance(milliseconds: number): void {
    this.current = new Date(this.current.getTime() + milliseconds);
  }
}

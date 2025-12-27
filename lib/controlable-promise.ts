/**
 * A promise class whose state can be inspected, and can be directly resolved or rejected on the same instance.
 */
export default class ControlablePromise<T> {
  private promise: Promise<T>;
  private resolver: (value: T | PromiseLike<T>) => void = () => {};
  private rejecter: (reason?: any) => void = () => {};
  private isRejected: boolean = false;
  private isInFlight: boolean = true;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolver = resolve;
      this.rejecter = reject;
    });
  }

  public resolve(val: T): typeof this {
    this.isInFlight = false;
    this.resolver(val);

    return this;
  }

  public reject(reason?: any): typeof this {
    this.isRejected = true;
    this.isInFlight = false;
    this.rejecter(reason);

    return this;
  }

  public get rejected(): boolean {
    return this.isRejected;
  }

  public get inFlight(): boolean {
    return this.isInFlight;
  }

  public nativePromise(): Promise<T> {
    return this.promise;
  }
}
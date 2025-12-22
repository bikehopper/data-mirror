const MIN_KEYS = 3;

export class ApiKeyPool {
  private lastidx: number | null = null;
  
  constructor(
    private keys: string[]
  ){
    if (this.keys.length < MIN_KEYS) {
      throw new Error(`Passed ${this.keys.length} keys into ApiKeyPool. Minimum ${MIN_KEYS} keys required`);
    }
  }

  public getKey(): string {
    const key = this.keys[this.randomIdxNoRepeat()];

    if (key == null) {
      throw new Error('Generated invalid random idx');
    }

    return key;
  }

  private randomIdxNoRepeat(): number {
    let idx = this.randomIdx();
    while (idx === this.lastidx) {
      idx = this.randomIdx();
    }

    this.lastidx = idx;
    return idx;
  }

  private randomIdx(): number {
    return Math.round(Math.random() * (this.keys.length - 1));
  }
};

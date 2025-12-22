const MIN_KEYS = 6;
const HISTORY_LENGTH = 3;

const MAX_ITER = 100;

export class ApiKeyPool {
  private history = new Int32Array(HISTORY_LENGTH).fill(-1);
  private historyTop = -1;

  private keys: string[];

  constructor(
    keys: string[] | undefined
  ){
    this.keys = keys || [];
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

    let itrCt = 0;
    while (this.isInHistory(idx) && itrCt < MAX_ITER) {
      idx = this.randomIdx();
      itrCt++;
    }

    // Circular buffer to keep track of last HISTORY_LENGTH keys
    this.historyTop = (this.historyTop + 1) % this.history.length;
    this.history[this.historyTop] = idx;
    return idx;
  }

  private isInHistory(idx: number): boolean {
    return this.history.indexOf(idx) !== -1;
  }

  private randomIdx(): number {
    return Math.round(Math.random() * (this.keys.length - 1));
  }
};

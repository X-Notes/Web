export class Letter {
  symbol: string;

  fractionalIndex: number;

  id: string;

  constructor(symbol: string, fractionalIndex: number, id: string = null) {
    this.symbol = symbol;
    this.fractionalIndex = parseFloat(fractionalIndex.toFixed(3));
    this.id = id;
  }

  initId(): void {
    this.id = this.randomIntFromInterval(10000, 99999).toString();
  }

  randomIntFromInterval(min, max): number {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}

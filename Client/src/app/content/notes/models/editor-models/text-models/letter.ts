export class Letter {
  symbol: string;

  fractionalIndex: number;

  id: string;

  constructor(symbol: string, fractionalIndex: number, id: string) {
    this.symbol = symbol;
    this.fractionalIndex = parseFloat(fractionalIndex.toFixed(3));
    this.id = id ?? this.randomIntFromInterval(1000, 9999).toString();
  }

  isEqual(letter: Letter): boolean {
    return (
      this.symbol === letter.symbol &&
      this.fractionalIndex === letter.fractionalIndex &&
      this.id === letter.id
    );
  }

  randomIntFromInterval(min, max): number {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}

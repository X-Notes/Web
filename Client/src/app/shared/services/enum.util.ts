export type EnumValue = string | number;

export class EnumUtil {
  // eslint-disable-next-line @typescript-eslint/ban-types
  public static getEnumValueByKey<E extends EnumValue>(e: object, key: string): E {
    return e[key];
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public static getEnumKeyByValue(e: object, value: EnumValue): string {
    return this.getEnumKeys(e).find((key) => e[key] === value);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public static getEnumKeys(e: object): string[] {
    return Object.keys(e).filter(String);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public static getEnumKeysByPredicate(e: object, func: (e: string) => boolean): string[] {
    return this.getEnumKeys(e).filter(func);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public static getEnumValues(e: object): EnumValue[] {
    return this.getEnumKeys(e).map((key) => e[key]);
  }
}

export type EnumValue = string | number;

export class EnumUtil {

  public static getEnumValueByKey<E extends EnumValue>(e: object, key: string): E {
    return e[key];
  }

  public static getEnumKeyByValue(e: object, value: EnumValue): string {
    return this.getEnumKeys(e).find(key => e[key] === value);
  }

  public static getEnumKeys(e: object): string[] {
    return Object.keys(e).filter(String);
  }

  public static getEnumKeysByPredicate(e: object, func: (e: string) => boolean): string[] {
    return this.getEnumKeys(e).filter(func);
  }

  public static getEnumValues(e: object): EnumValue[] {
    return this.getEnumKeys(e).map(key => e[key]);
  }
}

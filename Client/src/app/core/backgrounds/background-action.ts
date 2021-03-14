export class NewBackground {
  static type = '[Background] New Background';

  constructor(public photo: FormData) {}
}

export class LoadBackgrounds {
  static type = '[Background] Load Backgrounds';
}

export class SetBackground {
  static type = '[Background] Set Background';

  constructor(public id: string) {}
}

export class RemoveBackground {
  static type = '[Background] Remove Background';

  constructor(public id: string) {}
}

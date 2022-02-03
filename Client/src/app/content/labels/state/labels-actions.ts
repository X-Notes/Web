import { Order } from 'src/app/shared/services/order.service';
import { Label } from '../models/label.model';

export class LoadLabels {
  static type = '[Labels] Load Labels';
}

export class AddLabel {
  static type = '[Labels] Add Label';
}

export class SetDeleteLabel {
  static type = '[Labels] SetDelete Label';

  constructor(public label: Label) {}
}

export class DeleteLabel {
  static type = '[Labels] Delete Label';

  constructor(public label: Label) {}
}

export class UpdateLabel {
  static type = '[Labels] Update Label';

  constructor(public label: Label) {}
}

export class UpdateLabelCount {
  static type = '[Labels] Update Label Count';

  constructor(public labelId: string) {}
}

export class PositionLabel {
  static type = '[Labels] Position Label';

  constructor(public deleted: boolean, public id: string, public order: Order) {}
}

export class RestoreLabel {
  static type = '[Labels] Restore Label';

  constructor(public label: Label) {}
}

export class DeleteAllFromBin {
  static type = '[Labels] Delete all from bin';
}

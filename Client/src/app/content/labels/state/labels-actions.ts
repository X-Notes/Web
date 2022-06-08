import { PositionEntityModel } from '../../notes/models/position-note.model';
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

  constructor(public label: Label, public isCallApi = true) {}
}

export class UpdateLabelCount {
  static type = '[Labels] Update Label Count';

  constructor(public labelId: string) {}
}

export class UpdatePositionsLabels {
  static type = '[Labels] Position Label';

  constructor(public positions: PositionEntityModel[]) {}
}

export class RestoreLabel {
  static type = '[Labels] Restore Label';

  constructor(public label: Label) {}
}

export class DeleteAllLabelsFromBin {
  static type = '[Labels] Delete all from bin';
}

export class AddToDomLabels {
  static type = '[Labels] Add to dom labels';

  constructor(public labels: Label[]) {}
}

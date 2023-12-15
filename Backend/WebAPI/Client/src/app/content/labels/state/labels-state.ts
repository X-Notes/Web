import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { patch, updateItem } from '@ngxs/store/operators';
import { LabelsColor } from 'src/app/shared/enums/labels-colors.enum';
import {
  LoadLabels,
  AddLabel,
  SetDeleteLabel,
  UpdateLabel,
  UpdatePositionsLabels,
  DeleteLabel,
  RestoreLabel,
  DeleteAllLabelsFromBin,
  UpdateLabelCount,
  AddToDomLabels,
  ResetLabelsState,
} from './labels-actions';
import { ApiServiceLabels } from '../api-labels.service';
import { Label } from '../models/label.model';
import { PositionEntityModel } from '../../notes/models/position-note.model';
import { SnackbarService } from 'src/app/shared/services/snackbar/snackbar.service';
import { TranslateService } from '@ngx-translate/core';
import { OperationResultAdditionalInfo } from 'src/app/shared/models/operation-result.model';

export interface LabelsForFiltersNotes {
  label: Label;
  selected: boolean;
}

interface LabelState {
  labels: Label[];
  labelsAddToDOM: Label[];
  loaded: boolean;
}

@State<LabelState>({
  name: 'Labels',
  defaults: {
    labels: [],
    labelsAddToDOM: [],
    loaded: false,
  },
})
@Injectable()
export class LabelStore {
  constructor(
    private api: ApiServiceLabels,
    private store: Store,
    private snackbarService: SnackbarService,
    private translate: TranslateService,
  ) {}

  @Selector()
  static countNoDeleted(state: LabelState): number {
    return state.labels.filter((x) => !x.isDeleted).length;
  }

  @Selector()
  static labelsAddingToDOM(state: LabelState): Label[] {
    return state.labelsAddToDOM;
  }

  @Selector()
  static countDeleted(state: LabelState): number {
    return state.labels.filter((x) => x.isDeleted).length;
  }

  @Selector()
  static noDeleted(state: LabelState): Label[] {
    return state.labels.filter((x) => !x.isDeleted).sort((a, b) => a.order - b.order);
  }

  @Selector()
  static deleted(state: LabelState): Label[] {
    return state.labels.filter((x) => x.isDeleted).sort((a, b) => a.order - b.order);
  }

  @Action(LoadLabels)
  // eslint-disable-next-line consistent-return
  loadContent({ getState, patchState }: StateContext<LabelState>) {
    if (!getState().loaded) {
      return this.api.getAll().pipe(
        tap((content) => {
          patchState({
            labels: content.map((x) => new Label(x)),
            loaded: true,
          });
        }),
      );
    }
  }

  @Action(AddLabel)
  async newLabel({ patchState, dispatch, getState }: StateContext<LabelState>) {
    const resp = await this.api.new().toPromise();
    if (resp.success) {
      const id = resp.data;
      const newLabel = new Label({
        name: '',
        color: LabelsColor.Red,
        id,
        isDeleted: false,
        countNotes: 0,
        order: 0,
      });
      patchState({ labels: [newLabel, ...getState().labels] });
      dispatch(new AddToDomLabels([newLabel]));
      return;
    }
    if (!resp.success && resp.status === OperationResultAdditionalInfo.BillingError) {
      const message = this.translate.instant('snackBar.subscriptionCreationError');
      this.snackbarService.openSnackBar(message, null, null, 5000);
    }
  }

  @Action(AddToDomLabels)
  // eslint-disable-next-line class-methods-use-this
  addToDomLabels({ patchState }: StateContext<LabelState>, { labels }: AddToDomLabels) {
    patchState({
      labelsAddToDOM: labels,
    });
  }

  @Action(SetDeleteLabel)
  async setDeletedLabel(
    { getState, dispatch }: StateContext<LabelState>,
    { label }: SetDeleteLabel,
  ) {
    await this.api.setDeleted(label.id).toPromise();

    let deletedLabels = getState()
      .labels.filter((x) => x.isDeleted)
      .map((x) => ({ ...x }));
    deletedLabels.forEach((x) => x.order++);
    deletedLabels.forEach((x) => dispatch(new UpdateLabel(x, false)));

    let newlabel = getState().labels.find((x) => x.id === label.id);
    newlabel = { ...newlabel, isDeleted: true, order: 1 };
    await this.store.dispatch(new UpdateLabel(newlabel)).toPromise();

    deletedLabels = getState().labels.filter((x) => x.isDeleted);
    const positions = deletedLabels.map(
      (x) => ({ entityId: x.id, position: x.order } as PositionEntityModel),
    );
    dispatch(new UpdatePositionsLabels(positions));
  }

  @Action(DeleteLabel)
  async DeleteLabel({ getState, patchState }: StateContext<LabelState>, { label }: DeleteLabel) {
    await this.api.delete(label.id).toPromise();
    patchState({
      labels: getState().labels.filter((x) => x.id !== label.id),
    });
  }

  @Action(UpdateLabel)
  async updateLabels({ setState }: StateContext<LabelState>, { label, isCallApi }: UpdateLabel) {
    if (isCallApi) {
      await this.api.update(label).toPromise();
    }
    setState(
      patch({
        labels: updateItem<Label>((label2) => label2.id === label.id, label),
      }),
    );
  }

  @Action(UpdateLabelCount)
  async updateLabelsCount(
    { setState, getState }: StateContext<LabelState>,
    { labelId }: UpdateLabelCount,
  ) {
    const count = await this.api.getCountNotes(labelId).toPromise();
    const label = getState().labels.find((x) => x.id === labelId);
    if(!label) return;
    setState(
      patch({
        labels: updateItem<Label>((label2) => label2.id === label.id, {
          ...label,
          countNotes: count,
        }),
      }),
    );
  }

  @Action(UpdatePositionsLabels)
  async positionLabel(
    { getState, setState }: StateContext<LabelState>,
    { positions }: UpdatePositionsLabels,
  ) {
    if (!positions || positions.length === 0) {
      return;
    }

    const resp = await this.api.updateOrder(positions).toPromise();
    if (resp.success) {
      positions.forEach((pos) => {
        const label = this.getLabelById(getState, pos.entityId);
        if (label) {
          label.order = pos.position;
          setState(
            patch({
              labels: updateItem<Label>((label2) => label2.id === label.id, label),
            }),
          );
        }
      });
    }
  }

  @Action(RestoreLabel)
  async restoreLabel({ getState, dispatch }: StateContext<LabelState>, { label }: RestoreLabel) {
    await this.api.restore(label.id).toPromise();

    let labels = getState()
      .labels.filter((x) => !x.isDeleted)
      .map((x) => ({ ...x }));
    labels.forEach((x) => x.order++);
    labels.forEach((x) => dispatch(new UpdateLabel(x, false)));

    const labelToRestore = this.getLabelById(getState, label.id);
    labelToRestore.isDeleted = false;
    labelToRestore.order = 1;
    await this.store.dispatch(new UpdateLabel(labelToRestore)).toPromise();

    labels = getState().labels.filter((x) => !x.isDeleted);
    const positions = labels.map(
      (x) => ({ entityId: x.id, position: x.order } as PositionEntityModel),
    );
    dispatch(new UpdatePositionsLabels(positions));
  }

  @Action(DeleteAllLabelsFromBin)
  async deleteAllFromBin({ patchState, getState }: StateContext<LabelState>) {
    await this.api.removeAll().toPromise();
    patchState({
      labels: getState().labels.filter((x) => !x.isDeleted),
    });
  }

  @Action(ResetLabelsState)
  resetLabelsState({ patchState }: StateContext<LabelState>) {
    patchState({
      labels: [],
      labelsAddToDOM: [],
      loaded: false,
    });
  }

  getLabelById = (getState: () => LabelState, id: string): Label => {
    for (let label of getState().labels) {
      label = { ...label };
      if (id === label.id) {
        return label;
      }
    }
    return null;
  };

  getLabelsByIds = (getState: () => LabelState, ids: string[]): Label[] => {
    const result: Label[] = [];
    getState().labels.forEach((x) => {
      const label = { ...x };
      if (ids.some((q) => q === label.id)) {
        result.push(label);
      }
    });
    return result;
  };
}

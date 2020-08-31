import { Label } from '../models/label';
import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ApiServiceLabels } from '../api-labels.service';
import { LoadLabels, AddLabel, SetDeleteLabel, UpdateLabel, PositionLabel, DeleteLabel, RestoreLabel } from './labels-actions';
import { tap } from 'rxjs/operators';
import { patch, append, removeItem, insertItem, updateItem } from '@ngxs/store/operators';
import { OrderService } from 'src/app/shared/services/order.service';
import { LabelsColor } from 'src/app/shared/enums/LabelsColors';
import { UpdateLabelOnNote } from '../../notes/state/notes-actions';

interface LabelState {
    labelsAll: Label[];
    labelsDeleted: Label[];
    CountAll: number;
    CountDeleted: number;
    loaded: boolean;
}

@State<LabelState>({
    name: 'Labels',
    defaults: {
        labelsAll: [],
        labelsDeleted: [],
        CountAll: 0,
        CountDeleted: 0,
        loaded: false
    }
})

@Injectable()
export class LabelStore {


    constructor(private api: ApiServiceLabels,
                private orderService: OrderService,
                private store: Store) {
    }


    @Selector()
    static countAll(state: LabelState): number {
        return state.CountAll;
    }

    @Selector()
    static countDeleted(state: LabelState): number {
        return state.CountDeleted;
    }

    @Selector()
    static all(state: LabelState): Label[] {
        return state.labelsAll;
    }

    @Selector()
    static deleted(state: LabelState): Label[] {
        return state.labelsDeleted;
    }

    @Action(LoadLabels)
    loadContent({ setState, getState, patchState }: StateContext<LabelState>) {
        if (!getState().loaded) {
            return this.api.getAll().pipe(tap(content => { patchState({
            labelsAll: content.labelsAll,
            labelsDeleted: content.labelsDeleted,
            CountAll: content.labelsAll.length,
            CountDeleted: content.labelsDeleted.length,
            loaded: true
         }); }));
        }
    }

    @Action(AddLabel)
    async newLabel({ setState, getState, patchState }: StateContext<LabelState>) {
        const id = await this.api.new().toPromise();
        patchState({
            labelsAll: [{name: '', color: LabelsColor.Red , id, isDeleted: false}, ...getState().labelsAll],
            CountAll: getState().CountAll + 1
        });
    }

    @Action(SetDeleteLabel)
    async setDeletedLabel({setState, getState, patchState}: StateContext<LabelState>, { id }: SetDeleteLabel) {
        await this.api.setDeleted(id).toPromise();
        let labelsAll = getState().labelsAll;
        const label = labelsAll.find(x => x.id === id);
        labelsAll = labelsAll.filter(x => x.id !== id);
        patchState({
            labelsAll,
            labelsDeleted: [{...label}, ...getState().labelsDeleted],
            CountAll: getState().CountAll - 1,
            CountDeleted: getState().CountDeleted + 1
        });
    }

    @Action(DeleteLabel)
    async DeleteLabel({setState, getState, patchState}: StateContext<LabelState>, { id }: DeleteLabel) {
        await this.api.delete(id).toPromise();
        let labelsDeleted = getState().labelsDeleted;
        labelsDeleted = labelsDeleted.filter(x => x.id !== id);
        patchState({
            labelsDeleted,
            CountDeleted: getState().CountDeleted - 1
        });
    }

    @Action(UpdateLabel)
    async updateLabels({ setState}: StateContext<LabelState>, { label }: UpdateLabel) {
        await this.api.update(label).toPromise();
        this.store.dispatch(new UpdateLabelOnNote(label));
        if (label.isDeleted) {
            setState(
                patch({
                    labelsDeleted: updateItem<Label>(label2 => label2.id === label.id , label)
                })
            );
        } else {
            setState(
                patch({
                    labelsAll: updateItem<Label>(label2 => label2.id === label.id , label)
                })
            );
        }
    }

    @Action(PositionLabel)
    async positionLabel({setState, getState, patchState}: StateContext<LabelState>, { deleted, id, order }: PositionLabel) {
        await this.orderService.changeOrder(order).toPromise();
        if (deleted) {
            let labelsDeleted = getState().labelsDeleted;
            const slabel = labelsDeleted.find(x => x.id === id);
            labelsDeleted = labelsDeleted.filter(x => x.id !== id);
            labelsDeleted.splice(order.position - 1, 0 , slabel);
            patchState({labelsDeleted});
        } else {
            let labelsAll = getState().labelsAll;
            const slabel = labelsAll.find(x => x.id === id);
            labelsAll = labelsAll.filter(x => x.id !== id);
            labelsAll.splice(order.position - 1, 0 , slabel);
            patchState({labelsAll});
        }
    }

    @Action(RestoreLabel)
    async restoreLabel({setState, getState, patchState}: StateContext<LabelState>, { id }: RestoreLabel) {
        await this.api.restore(id).toPromise();
        let deletedLables = getState().labelsDeleted;
        const restoreLabel = deletedLables.find(x => x.id === id);
        deletedLables = deletedLables.filter(x => x.id !== id);
        patchState({
            labelsAll: [restoreLabel, ...getState().labelsAll],
            labelsDeleted: deletedLables,
            CountAll: getState().CountAll + 1,
            CountDeleted: getState().CountDeleted - 1
         });
    }
}

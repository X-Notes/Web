import { Label } from '../models/label';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ApiServiceLabels } from '../api.service';
import { LoadLabels, AddLabel, DeleteLabel, UpdateLabel, PositionLabel } from './labels-actions';
import { tap } from 'rxjs/operators';
import { patch, append, removeItem, insertItem, updateItem } from '@ngxs/store/operators';

interface LabelState {
    labelsAll: Label[];
    labelsDeleted: Label[];
}

@State<LabelState>({
    name: 'Labels',
    defaults: {
        labelsAll: [],
        labelsDeleted: []
    }
})

@Injectable()
export class LabelStore {


    constructor(private api: ApiServiceLabels) {
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
        if (getState().labelsAll.length === 0) {
        return this.api.getAll().pipe(tap(content => { patchState({
            labelsAll: content.filter(x => x.isDeleted === false),
            labelsDeleted: content.filter(x => x.isDeleted === true)
         }); }));
        }
    }

    @Action(AddLabel)
    async newLabel({ setState, getState, patchState }: StateContext<LabelState>, { name, color }: AddLabel) {
        const id = await this.api.new(name, color).toPromise();
        const labels = getState().labelsAll;
        patchState({
            labelsAll: [{name, color, id, isDeleted: false, order: 1}, ...labels]
        });
    }

    @Action(DeleteLabel)
    async deleteLabel({setState, getState, patchState}: StateContext<LabelState>, { id }: DeleteLabel) {
        await this.api.delete(id).toPromise();
        let labels = getState().labelsAll;
        labels = labels.filter(x => x.id !== id);
        patchState({labelsAll: labels});
    }

    @Action(UpdateLabel)
    async updateLabels({ setState }: StateContext<LabelState>, { label }: UpdateLabel) {
        await this.api.update(label).toPromise();
        /*
        setState(
            patch({
                labels: updateItem<Label>(label2 => label2.id === label.id , label)
            })
        );*/
    }

    @Action(PositionLabel)
    positionLabel({setState, getState, patchState}: StateContext<LabelState>, { labelOne, labelTwo }: PositionLabel) {
        const labels = getState().labelsAll;
        labels.find(x => x.id = labelOne.id).order = labelTwo.order;
        labels.find(x => x.id = labelTwo.id).order = labelOne.order;
        patchState({labelsAll: labels});
    }
}

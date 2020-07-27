import { Label } from '../models/label';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ApiServiceLabels } from '../api.service';
import { LoadLabels, AddLabel, DeleteLabel, UpdateLabel, PositionLabel } from './labels-actions';
import { tap } from 'rxjs/operators';
import { patch, append, removeItem, insertItem, updateItem } from '@ngxs/store/operators';

interface LabelState {
    labels: Label[];
}

@State<LabelState>({
    name: 'Labels',
    defaults: {
        labels: []
    }
})

@Injectable()
export class LabelStore {


    constructor(private api: ApiServiceLabels) {
    }


    @Selector()
    static all(state: LabelState): Label[] {
        return state.labels;
    }

    @Action(LoadLabels)
    loadContent({ setState, getState }: StateContext<LabelState>) {
        if (getState().labels.length === 0) {
        return this.api.getAll().pipe(tap(content => { setState({ labels: content }); }));
        }
    }

    @Action(AddLabel)
    async newLabel({ setState, getState, patchState }: StateContext<LabelState>, { name, color }: AddLabel) {
        const id = await this.api.new(name, color).toPromise();
        const labels = getState().labels;
        setState({
            labels: [{name, color, id, isDeleted: false, order: 1}, ...labels]
        });
    }

    @Action(DeleteLabel)
    async deleteLabel({setState, getState, patchState}: StateContext<LabelState>, { id }: DeleteLabel) {
        await this.api.delete(id).toPromise();
        let labels = getState().labels;
        labels = labels.filter(x => x.id !== id);
        patchState({labels});
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
        const labels = getState().labels;
        labels.find(x => x.id = labelOne.id).order = labelTwo.order;
        labels.find(x => x.id = labelTwo.id).order = labelOne.order;
        patchState({labels});
    }
}

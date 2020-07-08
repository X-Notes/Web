import { Label } from '../models/label';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { LoadLabels, AddLabel } from './labels-actions';
import { tap } from 'rxjs/operators';

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


    constructor(private api: ApiService) {
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
        labels.push({name, color, id, isDeleted: false});
        setState({
            ...getState(),
            labels
        });
    }
}

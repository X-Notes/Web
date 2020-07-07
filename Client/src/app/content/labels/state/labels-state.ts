import { Label } from '../models/label';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { LoadLabels } from './labels-actions';
import { tap } from 'rxjs/operators';

interface LabelState {
    labels: Label[];
}

@State<LabelState>({
    name: 'Labels',
    defaults: { labels: []
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
loadContent({ patchState }: StateContext<LabelState>) {
    return this.api.getAll().pipe(
    tap(content => {
        patchState({ labels: content });
    })
    );
}

}

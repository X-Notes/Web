import { Injectable } from "@angular/core";
import { State } from "@ngxs/store";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface EditorState { }

@State<EditorState>({
    name: 'Editor',
    defaults: {},
})
@Injectable()
export class EditorStore {}
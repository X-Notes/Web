import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { DeltaConverter } from '../content-editor/converter/delta-converter';
import { DeltaListEnum } from '../content-editor/converter/entities/delta-list.enum';
import { HtmlComponentsFacadeService } from '../content-editor/services/html-facade.service';
import { ProjectBlock } from '../content-editor/text/entities/blocks/projection-block';
import { BlockDiff } from '../content-editor/text/entities/diffs/block-diff';
import { NoteTextTypeENUM } from '../content-editor/text/note-text-type.enum';
import { BaseTextElementComponent, PasteEvent } from './html-components/html-base.component';
import { InputHtmlEvent } from './html-components/models/input-html-event';

@Component({
  template: '',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export abstract class HtmlTextChangesComponent extends BaseTextElementComponent {
  @Output()
  inputHtmlEvent = new EventEmitter<InputHtmlEvent>();

  contentsUI: ProjectBlock[];

  syncUI$: Subject<string> = new Subject();

  viewHtml: string;

  constructor(cdr: ChangeDetectorRef, facade: HtmlComponentsFacadeService) {
    super(cdr, facade);

    this.syncUI$.pipe(takeUntil(this.destroy)).subscribe(() => {
      if (!this.contentHtml) return;
      this.updateUIContents();
      const diffs = this.getApplyDiffsUIandStateDiffs(this.contentsUI);
      console.log('diffs: ', diffs);
      console.log('s: ', this.content);
      if (diffs.some((x) => x.isAnyChanges)) {
        this.inputHtmlEvent.next({ content: this.content, diffs });
      }
    });
  }

  onInput() {
    this.syncHtmlWithLayout();
  }

  syncHtmlWithLayout() {
    this.syncUI$.next();
  }

  getApplyDiffsUIandStateDiffs(uiBlocks: ProjectBlock[]): BlockDiff[] {
    const user = this.facade.store.selectSnapshot(UserStore.getUser);
    return this.facade.crdtDiffsService.getAndApplyBlocksDiffs(
      this.content,
      uiBlocks,
      user.agentId,
    );
  }

  syncContentWithLayout(): void {
    this.saveAndRestoreCursorWrapper(() => this.updateHTML(this.contentsUI));
  }

  syncStateContentWithUI(): void {
    this.saveAndRestoreCursorWrapper(() => this.initBaseHTML(true));
  }

  updateUIContents(): void {
    const html = this.contentHtml.nativeElement.innerHTML;
    const contents = DeltaConverter.convertHTMLToTextBlocks(html);
    this.contentsUI = contents;
  }

  updateHTML(contents: ProjectBlock[]): void {
    this.transformOnUpdate(contents);
    const html = DeltaConverter.convertTextBlocksToHTML(contents);
    this.updateNativeHTML(html);
    this.syncHtmlWithLayout();
  }

  transformOnUpdate(contents: ProjectBlock[]): void {
    const content = contents?.find((x) => x.list !== null);
    if (content?.list) {
      if (content.list === DeltaListEnum.bullet) {
        let type = NoteTextTypeENUM.dotList;
        if (content.getText()?.startsWith('[ ]')) {
          content.content = content.getText().slice(3);
          type = NoteTextTypeENUM.checkList;
        }
        this.transformContent(null, type);
      }
      if (content.list === DeltaListEnum.ordered) {
        this.transformContent(null, NoteTextTypeENUM.numberList);
      }
    }
    const headingType = contents?.find((x) => x.header !== null)?.header;
    if (headingType) {
      this.transformContent(null, NoteTextTypeENUM.heading, this.getHeadingNumber(headingType));
    }
  }

  initBaseHTML(update: boolean = false): void {
    this.contentsUI = this.content.contents?.map((x) => x.getProjection());
    if (this.contentsUI?.length > 0) {
      const html = DeltaConverter.convertTextBlocksToHTML(this.contentsUI);
      const convertedHTML = this.facade.sanitizer.bypassSecurityTrustHtml(html);
      if (update) {
        const html2 = (convertedHTML as any).changingThisBreaksApplicationSecurity ?? '';
        this.updateNativeHTML(html2);
      } else {
        this.viewHtml = convertedHTML as string;
      }
      this.detectChanges();
      this.syncHtmlWithLayout();
    }
  }

  protected updateNativeHTML(html: string): void {
    this.contentHtml.nativeElement.innerHTML = html;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  async pasteCommandHandler(e: ClipboardEvent) {
    const isLink = this.isPasteLink(e.clipboardData.items);
    e.preventDefault();
    if (isLink) {
      this.convertTextToLink(e);
      this.syncUI$.next();
      return;
    }
    const html = e.clipboardData.getData('text/html');
    if (html) {
      this.handleHtmlInserting(html);
      this.syncUI$.next();
      return;
    }
    const text = e.clipboardData.getData('text/plain');
    if (text) {
      this.facade.apiBrowserTextService.pasteOnlyTextHandler(e);
      this.syncUI$.next();
      return;
    }
  }

  private handleHtmlInserting(html: string): void {
    const htmlElements = DeltaConverter.splitDeltaByDividers(html);
    if (htmlElements.length === 0) return;

    const htmlEl = htmlElements[0];
    this.facade.apiBrowserTextService.pasteHTMLHandler(htmlEl); // TODO DONT MUTATE ELEMENT
    const editableEl = this.getEditableNative<HTMLElement>().cloneNode(true) as HTMLElement;
    const resTextBlocks = DeltaConverter.convertHTMLToTextBlocks(editableEl.innerHTML);
    this.updateHTML(resTextBlocks);
    htmlElements.shift(); // remove first element

    if (htmlElements.length > 0) {
      const pasteObject: PasteEvent = {
        element: this,
        htmlElementsToInsert: htmlElements,
      };
      this.pasteEvent.emit(pasteObject);
    }
  }

  private convertTextToLink(e: ClipboardEvent) {
    const json = e.clipboardData.getData('text/link-preview') as any;
    const data = JSON.parse(json);
    const title = data.title;
    const url = data.url;
    const pos = this.facade.apiBrowserTextService.getSelectionCharacterOffsetsWithin(
      this.getEditableNative(),
    );
    const html = DeltaConverter.convertTextBlocksToHTML(this.contentsUI);
    const resultDelta = DeltaConverter.insertLink(html, pos.start, title, url);
    const resTextBlocks = DeltaConverter.convertDeltaToTextBlocks(resultDelta);
    this.updateHTML(resTextBlocks);
  }
}

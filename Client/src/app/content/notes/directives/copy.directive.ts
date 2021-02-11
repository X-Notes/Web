import { Directive, ElementRef, Input, OnDestroy, OnInit, QueryList, Renderer2 } from '@angular/core';
import { ApiBrowserTextService } from '../api-browser-text.service';

@Directive({
  selector: '[appCopy]'
})
export class CopyDirective implements OnDestroy, OnInit {

  copyListener;

  @Input() appCopy: QueryList<ElementRef>;

  constructor(private renderer: Renderer2,
              private apiBrowserFunctions: ApiBrowserTextService, ) { }


  ngOnInit(): void {
    this.copyListener = this.renderer.listen('body', 'copy', (e) => this.customCopy(e));
  }

  customCopy(e)
  {
    let items = this.appCopy.toArray().map(item => (item.nativeElement as HTMLElement).firstChild as HTMLElement);
    items = items.filter(item => item.attributes.getNamedItem('selectedByUser') !== null);
    const texts = items.map(item => item.textContent);
    if (texts.length > 0)
    {
      const resultText = texts.reduce((pv, cv) => pv + '\n' + cv);
      this.apiBrowserFunctions.copyTest(resultText);
    }
  }

  ngOnDestroy(): void {
    this.copyListener();
  }

}

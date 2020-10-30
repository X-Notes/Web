import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';
import { Store, Select } from '@ngxs/store';
import { LabelStore } from '../state/labels-state';
import { Observable } from 'rxjs';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { PaginationService } from 'src/app/shared/services/pagination.service';
import { ShortUser } from 'src/app/core/models/short-user';
import { AppStore } from 'src/app/core/stateApp/app-state';



@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.scss'],
  animations: [ sideBarCloseOpen ],
})
export class LabelsComponent implements OnInit {

  @ViewChild ('scrollMe', { static: true })
  public myScrollContainer: ElementRef;

  @Select(AppStore.spinnerActive)
  public spinnerActive$: Observable<boolean>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  @Select(LabelStore.countAll)
  countAll$: Observable<number>;

  @Select(LabelStore.countDeleted)
  countDeleted$: Observable<number>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  theme = Theme;

  constructor(
    public pService: PersonalizationService,
    private pagService: PaginationService) {}

  async ngOnInit() {

    this.pService.onResize();

    setTimeout(() => {
      (this.myScrollContainer as any).SimpleBar.getScrollElement().addEventListener('scroll',
      (e) => {
        const flag = e.srcElement.scrollHeight - e.srcElement.scrollTop - this.pagService.startPointToGetData <= e.srcElement.clientHeight;
        if (flag && !this.pagService.set.has(e.srcElement.scrollHeight)) {
          this.pagService.set.add(e.srcElement.scrollHeight);
          this.pagService.nextPagination.next();
        }
      }); }, 0);
  }
}

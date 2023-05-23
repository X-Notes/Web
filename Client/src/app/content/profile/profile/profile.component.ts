import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Select, Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Observable, Subject } from 'rxjs';
import {
  ChangeLanguage,
  ChangeEntitiesSize,
  ChangeTheme,
  UpdateUserPhoto,
  SetDefaultBackground,
} from 'src/app/core/stateUser/user-action';
import { ShortUser } from 'src/app/core/models/user/short-user.model';
import { AuthService } from 'src/app/core/auth.service';
import { ShowSnackNotification, UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { takeUntil } from 'rxjs/operators';
import {
  LoadBackgrounds,
  NewBackground,
  RemoveBackground,
  SetBackground,
} from 'src/app/core/backgrounds/background-action';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { EntitiesSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { LanguagesENUM } from 'src/app/shared/enums/languages.enum';
import { PersonalizationSetting } from 'src/app/core/models/personalization-setting.model';
import { PersonalizationEnum } from 'src/app/shared/enums/personalization.enum';
import { byteToMB } from 'src/app/core/defaults/byte-convert';
import { maxBackgroundPhotoSize, maxProfilePhotoSize } from 'src/app/core/defaults/constraints';
import { ResetNotes } from '../../notes/state/notes-actions';
import { ResetFolders } from '../../folders/state/folders-actions';
import { BillingPlanId } from 'src/app/core/models/billing/billing-plan-id.enum';
import { TranslateService } from '@ngx-translate/core';
import { SelectionOption } from 'src/app/shared/custom-components/select-component/entities/select-option';
import { EnumConverterService } from 'src/app/shared/services/enum-converter.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  @Select(UserStore.getUserFontSize)
  public fontSize$: Observable<EntitiesSizeENUM>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<ThemeENUM>;

  @Select(UserStore.getUserBackground)
  public userBackground$: Observable<string>;

  @Select(UserStore.getUserLanguage)
  public language$: Observable<LanguagesENUM>;

  @Select(UserStore.getPersonalizationSettings)
  public pSettings$: Observable<PersonalizationSetting>;

  @ViewChild('uploadFile') uploadPhoto: ElementRef;

  settingsInit: PersonalizationSetting;

  fontSize = EntitiesSizeENUM;

  themes = ThemeENUM;

  pSettings = PersonalizationEnum;

  language = LanguagesENUM;

  billingPlanId = BillingPlanId;

  destroy = new Subject<void>();

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    private authService: AuthService,
    private translateService: TranslateService,
    private enumConverterService: EnumConverterService,
  ) {}

  get options(): SelectionOption[] {
    return Object.values(LanguagesENUM)
      .filter((x) => typeof x === 'number')
      .map((x) =>
        this.enumConverterService.convertEnumToSelectionOption(LanguagesENUM, x, 'languages.'),
      );
  }

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.Profile)).toPromise();

    await this.store.dispatch(new LoadBackgrounds()).toPromise();
    this.settingsInit = this.store.selectSnapshot(UserStore.getPersonalizationSettings);

    this.pService.newButtonSubject
      .pipe(takeUntil(this.destroy))
      .subscribe(() => this.newBackground());
  }

  setLanguage(language: LanguagesENUM): void {
    this.store.dispatch(new ChangeLanguage(language));
  }

  setCurrent(id: string) {
    this.store.dispatch(new SetBackground(id));
  }

  removeBackground(id: string) {
    this.store.dispatch(new RemoveBackground(id));
    const user = this.store.selectSnapshot(UserStore.getUser);
    if (id === user?.currentBackground?.id) {
      this.store.dispatch(new SetDefaultBackground());
    }
  }

  logout() {
    this.authService.logout();
  }

  changeTheme(value: boolean) {
    if (value) {
      this.store.dispatch(new ChangeTheme(ThemeENUM.Light));
    } else {
      this.store.dispatch(new ChangeTheme(ThemeENUM.Dark));
    }
  }

  changeEntitiesSize(value: boolean) {
    if (value) {
      this.store.dispatch(new ChangeEntitiesSize(EntitiesSizeENUM.Big));
    } else {
      this.store.dispatch(new ChangeEntitiesSize(EntitiesSizeENUM.Medium));
    }
  }

  newBackground() {
    this.uploadPhoto.nativeElement.click();
  }

  uploadImage(event) {
    const file = event.target.files[0] as File;
    if (file) {
      if (file.size > maxBackgroundPhotoSize) {
        const message = this.translateService.instant('files.fileTooLarge', {
          sizeMB: byteToMB(maxBackgroundPhotoSize),
        });
        this.store.dispatch(new ShowSnackNotification(message));
      } else {
        const formDate = new FormData();
        formDate.append('photo', file);
        this.store.dispatch(new NewBackground(formDate));
      }
    }
    // eslint-disable-next-line no-param-reassign
    event.target.value = null;
  }

  uploadImageUserPhoto(event) {
    const file = event.target.files[0] as File;
    if (file) {
      if (file.size > maxProfilePhotoSize) {
        const message = this.translateService.instant('files.fileTooLarge', {
          sizeMB: byteToMB(maxProfilePhotoSize),
        });
        this.store.dispatch(new ShowSnackNotification(message));
      } else {
        const formDate = new FormData();
        formDate.append('photo', file);
        this.store.dispatch(new UpdateUserPhoto(formDate));
      }
    }
    // eslint-disable-next-line no-param-reassign
    event.target.value = null;
  }

  ngOnDestroy(): void {
    const lastPs = this.store.selectSnapshot(UserStore.getPersonalizationSettings);

    if (
      lastPs.contentInNoteCount !== this.settingsInit?.contentInNoteCount ||
      lastPs.isViewAudioOnNote !== this.settingsInit?.isViewAudioOnNote ||
      lastPs.isViewDocumentOnNote !== this.settingsInit?.isViewDocumentOnNote ||
      lastPs.isViewTextOnNote !== this.settingsInit?.isViewTextOnNote ||
      lastPs.isViewVideoOnNote !== this.settingsInit?.isViewVideoOnNote ||
      lastPs.isViewPhotosOnNote !== this.settingsInit?.isViewPhotosOnNote
    ) {
      this.store.dispatch(new ResetNotes());
    }

    if (lastPs.notesInFolderCount !== this.settingsInit?.notesInFolderCount) {
      this.store.dispatch(new ResetFolders());
    }

    this.destroy.next();
    this.destroy.complete();
  }
}

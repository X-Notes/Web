import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, Optional } from '@angular/core';
import {
  changeColorLabel,
  PersonalizationService,
} from 'src/app/shared/services/personalization.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { LabelsColor } from 'src/app/shared/enums/labels-colors.enum';
import { EnumUtil } from 'src/app/shared/services/enum.util';
import { MurriService } from 'src/app/shared/services/murri.service';
import { EntitiesSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { updateTitleEntitesDelay } from 'src/app/core/defaults/bounceDelay';
import { Label } from '../models/label.model';

@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
  animations: [changeColorLabel],
})
export class LabelComponent implements OnInit, OnDestroy {
  @Input() label: Label;

  @Input() readonly isSelected: boolean;

  @Output() updateLabel = new EventEmitter<Label>();

  @Output() deleteLabel = new EventEmitter<Label>();

  @Output() restoreLabel = new EventEmitter<Label>();

  @Output() selectLabel = new EventEmitter<boolean>();

  @Input() selectedMode: boolean;

  destroy = new Subject<void>();

  fontSize = EntitiesSizeENUM;

  pallete = EnumUtil.getEnumValues(LabelsColor);

  isUpdate = false;

  title: string;

  nameChanged: Subject<string> = new Subject<string>();

  constructor(
    public pService: PersonalizationService,
    @Optional() private murriService: MurriService,
  ) {}

  ngOnDestroy(): void {
    this.nameChanged.next();
    this.nameChanged.complete();
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.title = this.label.name;
    this.nameChanged
      .pipe(debounceTime(updateTitleEntitesDelay), distinctUntilChanged(), takeUntil(this.destroy))
      .subscribe((name) => {
        if (name) {
          this.label = { ...this.label, name };
          this.updateLabel.emit(this.label);
        }
      });
  }

  select() {
    this.selectLabel.emit(!this.isSelected);
  }

  openColors() {
    this.isUpdate = !this.isUpdate;
    this.timeout(this.isUpdate);
  }

  timeout(flag: boolean) {
    return new Promise((resolve) => {
      let count = 0;
      const timer = setInterval(() => {
        if (count === 60 && flag) {
          clearInterval(timer);
          resolve(null);
        } else if (count === 40 && flag === false) {
          clearInterval(timer);
          resolve(null);
        }
        if (this.murriService) {
          this.murriService.grid.refreshItems().layout();
        }
        count += 1;
      }, 10);
    });
  }

  async changeColor(value: string) {
    this.label = { ...this.label, color: value };
    this.isUpdate = false;
    await this.timeout(this.isUpdate);
    this.updateLabel.emit(this.label);
  }

  changed(text: string) {
    this.nameChanged.next(text);
  }
}

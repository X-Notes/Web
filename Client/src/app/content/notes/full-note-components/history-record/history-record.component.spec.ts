import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryRecordComponent } from './history-record.component';

describe('HistoryRecordComponent', () => {
  let component: HistoryRecordComponent;
  let fixture: ComponentFixture<HistoryRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoryRecordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

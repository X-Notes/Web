import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChangeColorComponent } from './change-color.component';

describe('ChangeColorFolderComponent', () => {
  let component: ChangeColorComponent;
  let fixture: ComponentFixture<ChangeColorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeColorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

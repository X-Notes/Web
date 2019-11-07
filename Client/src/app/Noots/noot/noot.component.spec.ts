import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NootComponent } from './noot.component';

describe('NootComponent', () => {
  let component: NootComponent;
  let fixture: ComponentFixture<NootComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NootComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

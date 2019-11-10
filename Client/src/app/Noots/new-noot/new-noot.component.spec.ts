import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewNootComponent } from './new-noot.component';

describe('NewNootComponent', () => {
  let component: NewNootComponent;
  let fixture: ComponentFixture<NewNootComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewNootComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewNootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

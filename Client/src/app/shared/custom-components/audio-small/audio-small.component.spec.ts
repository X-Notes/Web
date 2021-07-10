import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioSmallComponent } from './audio-small.component';

describe('AudioSmallComponent', () => {
  let component: AudioSmallComponent;
  let fixture: ComponentFixture<AudioSmallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AudioSmallComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioSmallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

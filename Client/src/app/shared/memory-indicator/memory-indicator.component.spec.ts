import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryIndicatorComponent } from './memory-indicator.component';

describe('MemoryIndicatorComponent', () => {
  let component: MemoryIndicatorComponent;
  let fixture: ComponentFixture<MemoryIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MemoryIndicatorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MemoryIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoResultsIllustrationComponent } from './no-results-illustration.component';

describe('NoResultsIllustrationComponent', () => {
  let component: NoResultsIllustrationComponent;
  let fixture: ComponentFixture<NoResultsIllustrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NoResultsIllustrationComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoResultsIllustrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

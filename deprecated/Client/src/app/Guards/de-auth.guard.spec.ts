import { TestBed } from '@angular/core/testing';

import { DeAuthGuard } from './de-auth.guard';

describe('DeAuthGuard', () => {
  let guard: DeAuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(DeAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

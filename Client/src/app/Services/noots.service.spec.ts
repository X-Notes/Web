import { TestBed } from '@angular/core/testing';

import { NootsService } from './noots.service';

describe('NootsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NootsService = TestBed.get(NootsService);
    expect(service).toBeTruthy();
  });
});

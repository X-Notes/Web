import { TestBed } from '@angular/core/testing';

import { PersonalizationService } from './personalization.service';

describe('PersonalizationService', () => {
  let service: PersonalizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonalizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

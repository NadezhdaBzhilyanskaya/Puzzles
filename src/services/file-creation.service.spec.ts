import { TestBed } from '@angular/core/testing';

import { FileCreationService } from './file-creation.service';

describe('FileCreationService', () => {
  let service: FileCreationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileCreationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

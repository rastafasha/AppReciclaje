import { TestBed } from '@angular/core/testing';
import { ConsejoService } from './consejo-service';

describe('ConsejoService', () => {
  let service: ConsejoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsejoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

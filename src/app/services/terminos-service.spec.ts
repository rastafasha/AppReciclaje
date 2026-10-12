import { TestBed } from '@angular/core/testing';
import { TerminosService } from './terminos-service';

describe('TerminosService', () => {
  let service: TerminosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TerminosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

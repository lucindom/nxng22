import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Builderkit } from './builderkit';

describe('Builderkit', () => {
  let component: Builderkit;
  let fixture: ComponentFixture<Builderkit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Builderkit]
    }).compileComponents();

    fixture = TestBed.createComponent(Builderkit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationProcedureComponent } from './registration-procedure.component';

describe('RegistrationProcedureComponent', () => {
  let component: RegistrationProcedureComponent;
  let fixture: ComponentFixture<RegistrationProcedureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistrationProcedureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationProcedureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

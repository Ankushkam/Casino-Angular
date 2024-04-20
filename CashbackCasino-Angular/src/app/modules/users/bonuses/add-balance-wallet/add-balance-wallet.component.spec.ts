import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBalanceWalletComponent } from './add-balance-wallet.component';

describe('AddBalanceWalletComponent', () => {
  let component: AddBalanceWalletComponent;
  let fixture: ComponentFixture<AddBalanceWalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddBalanceWalletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBalanceWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

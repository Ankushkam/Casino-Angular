import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnlockEmailComponent } from './unlock-email.component';

describe('UnlockEmailComponent', () => {
  let component: UnlockEmailComponent;
  let fixture: ComponentFixture<UnlockEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnlockEmailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnlockEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

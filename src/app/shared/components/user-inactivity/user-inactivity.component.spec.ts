import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserInactivityComponent } from './user-inactivity.component';

describe('UserInactivityComponent', () => {
  let component: UserInactivityComponent;
  let fixture: ComponentFixture<UserInactivityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserInactivityComponent]
    });
    fixture = TestBed.createComponent(UserInactivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

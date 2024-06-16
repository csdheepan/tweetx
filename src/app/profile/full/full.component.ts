import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LogoutDialogComponent } from 'src/app/shared/components/logout-dialog/logout-dialog.component';

@Component({
  selector: 'app-full',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss']
})
export class FullComponent {


  constructor(
    private dialog: MatDialog
  ) { }


  logoutDialog() {
    this.dialog.open(LogoutDialogComponent, {
      disableClose: true
    });
  }
}

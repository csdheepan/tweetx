import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { LogoutDialogComponent } from 'src/app/shared/components/logout-dialog/logout-dialog.component';

@Component({
  selector: 'app-full',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss']
})
export class FullComponent implements OnInit {

  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(
    private dialog: MatDialog
  ){}

  ngOnInit(): void {}

  logoutDialog() {
    this.dialog.open(LogoutDialogComponent, {
      disableClose: true
    });
    this.sidenav.close();
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.scss']
})
export class ErrorDialogComponent implements OnInit {


  errorMessage !: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }


  ngOnInit(): void {
    this.errorMessage = this.data.message
  }

}

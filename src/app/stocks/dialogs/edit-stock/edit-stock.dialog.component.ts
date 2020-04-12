import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Component, Inject} from '@angular/core';
import {StocksDataService} from '../../services/stocks-data.service';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-baza.dialog',
  templateUrl: './edit-stock.dialog.html',
  styleUrls: ['./edit-stock.dialog.css']
})
export class EditStockDialogComponent {

  constructor(public dialogRef: MatDialogRef<EditStockDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, public dataService: StocksDataService) { }

  formControl = new FormControl('', [
    Validators.required
    // Validators.email,
  ]);

  getErrorMessage() {
    return this.formControl.hasError('required') ? 'Required field' :
      this.formControl.hasError('email') ? 'Not a valid email' :
        '';
  }

  submit() {
    // emppty stuff
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  stopEdit(): void {
    this.dataService.updateStock(this.data);
  }
}

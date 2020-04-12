import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Component, Inject} from '@angular/core';
import {StocksDataService} from '../../services/stocks-data.service';
import {FormControl, Validators} from '@angular/forms';
import {Stock} from '../../models/stock';

@Component({
  selector: 'app-add.dialog',
  templateUrl: './add-stock.dialog.html',
  styleUrls: ['./add-stock.dialog.css']
})

export class AddStockDialogComponent {
  constructor(public dialogRef: MatDialogRef<AddStockDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Stock,
              public dataService: StocksDataService) { }

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

  public confirmAdd(): void {
    this.dataService.addStock(this.data);
  }
}

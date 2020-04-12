import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Component, Inject} from '@angular/core';
import {StocksDataService} from '../../services/stocks-data.service';


@Component({
  selector: 'app-delete.dialog',
  templateUrl: './delete-stock.dialog.html',
  styleUrls: ['./delete-stock.dialog.css']
})
export class DeleteStockDialogComponent {

  constructor(public dialogRef: MatDialogRef<DeleteStockDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, public dataService: StocksDataService) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  confirmDelete(): void {
    this.dataService.deleteStock(this.data.id);
  }
}

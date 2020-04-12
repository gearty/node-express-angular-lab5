import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Component, Inject} from '@angular/core';
import {BrokersDataService} from '../../services/brokers-data.service';


@Component({
  selector: 'app-delete.dialog',
  templateUrl: './delete-broker.dialog.html',
  styleUrls: ['./delete-broker.dialog.css']
})
export class DeleteBrokerDialogComponent {

  constructor(public dialogRef: MatDialogRef<DeleteBrokerDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, public dataService: BrokersDataService) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  confirmDelete(): void {
    this.dataService.deleteBroker(this.data.id);
  }
}

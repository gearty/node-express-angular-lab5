import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Component, Inject} from '@angular/core';
import {BrokersDataService} from '../../services/brokers-data.service';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-baza.dialog',
  templateUrl: './edit-broker.dialog.html',
  styleUrls: ['./edit-broker.dialog.css']
})
export class EditBrokerDialogComponent {

  constructor(public dialogRef: MatDialogRef<EditBrokerDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, public dataService: BrokersDataService) { }

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
    this.dataService.updateBroker(this.data);
  }
}

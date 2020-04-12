import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Component, Inject} from '@angular/core';
import {BrokersDataService} from '../../services/brokers-data.service';
import {FormControl, Validators} from '@angular/forms';
import {Broker} from '../../models/broker';

@Component({
  selector: 'app-add.dialog',
  templateUrl: './add-broker.dialog.html',
  styleUrls: ['./add-broker.dialog.css']
})

export class AddBrokerDialogComponent {
  constructor(public dialogRef: MatDialogRef<AddBrokerDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Broker,
              public dataService: BrokersDataService) { }

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
    this.dataService.addBroker(this.data);
  }
}

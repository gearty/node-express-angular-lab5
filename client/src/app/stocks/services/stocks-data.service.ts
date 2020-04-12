import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Stock} from '../models/stock';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';

@Injectable()
export class StocksDataService {
  private readonly API_URL = 'http://' + window.location.hostname + '/api/stocks/';

  dataChange: BehaviorSubject<Stock[]> = new BehaviorSubject<Stock[]>([]);
  // Temporarily stores data from dialogs
  dialogData: any;

  constructor (private httpClient: HttpClient) {}

  get data(): Stock[] {
    return this.dataChange.value;
  }

  getDialogData() {
    return this.dialogData;
  }

  /** CRUD METHODS */
  getAllStocks(): void {
    this.httpClient.get<Stock[]>(this.API_URL).subscribe(data => {
        this.dataChange.next(data);
      },
      (error: HttpErrorResponse) => {
      console.log (error.name + ' ' + error.message);
      });
  }

  addStock (stock: Stock): void {
    this.httpClient.post(this.API_URL, stock).subscribe(data => {
        // alert('Successfully added');
      },
      (err: HttpErrorResponse) => {
      alert('Error occurred. Details: ' + err.name + ' ' + err.message);
    });
  }

  updateStock (stock: Stock): void {
    this.httpClient.put(this.API_URL + stock.id, stock).subscribe(data => {
        this.dialogData = stock;
        // alert('Successfully edited');
      },
      (err: HttpErrorResponse) => {
        alert('Error occurred. Details: ' + err.name + ' ' + err.message);
      }
    );
  }

  deleteStock (id: number): void {
    this.httpClient.delete(this.API_URL + id).subscribe(data => {
        // alert('Successfully deleted');
      },
      (err: HttpErrorResponse) => {
        alert('Error occurred. Details: ' + err.name + ' ' + err.message);
      }
    );
  }
}



import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {StocksDataService} from './services/stocks-data.service';
import {HttpClient} from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {Stock} from './models/stock';
import {DataSource} from '@angular/cdk/collections';
import {AddStockDialogComponent} from './dialogs/add-stock/add-stock.dialog.component';
import {EditStockDialogComponent} from './dialogs/edit-stock/edit-stock.dialog.component';
import {DeleteStockDialogComponent} from './dialogs/delete-stock/delete-stock.dialog.component';
import {BehaviorSubject, fromEvent, merge, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})

export class StocksComponent implements OnInit {
  displayedColumns = ['id', 'name', 'price', 'amount', 'actions'];
  exampleDatabase: StocksDataService | null;
  dataSource: StocksDataSource | null;
  index: number;
  id: number;

  constructor(public httpClient: HttpClient,
              public dialog: MatDialog,
              public dataService: StocksDataService) {}

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild('filter',  {static: true}) filter: ElementRef;

  ngOnInit() {
    this.loadData();
    setInterval(() => this.refreshTable(), 1000);
  }

  refresh() {
    this.loadData();
  }

  addNew(stock: Stock) {
    const dialogRef = this.dialog.open(AddStockDialogComponent, {
      data: {issue: stock }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        setTimeout(() => this.refresh(), 500);
      }
    });
  }

  startEdit(i: number, id: number, name: string, price: string, amount: string) {
    this.id = id;
    // index row is used just for debugging proposes and can be removed
    this.index = i;
    console.log(this.index);
    const dialogRef = this.dialog.open(EditStockDialogComponent, {
      data: {id: id, name: name, price: price, amount: amount}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        setTimeout(() => this.refresh(), 500);
      }
    });
  }

  deleteItem(i: number, id: number, name: string, price: string, amount: string) {
    this.index = i;
    this.id = id;
    const dialogRef = this.dialog.open(DeleteStockDialogComponent, {
      data: {id: id, name: name, price: price, amount: amount}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        const foundIndex = this.exampleDatabase.dataChange.value.findIndex(x => x.id === this.id);
        // for delete-stock-stock we use splice in order to remove single object from StocksDataService
        this.exampleDatabase.dataChange.value.splice(foundIndex, 1);
        this.refreshTable();
      }
    });
  }


  private refreshTable() {
    this.exampleDatabase.data.forEach(function (item) {
          let newPrice: string = (parseFloat(item.price) + ((0.5 - Math.random()) * 10)).toFixed(4);
          if (parseFloat(newPrice) < 0) {
            newPrice = '0';
          }
          item.price = newPrice;
        });
    // Refreshing table using paginator
    // Thanks yeager-j for tips
    // https://github.com/marinantonio/angular-mat-table-crud/issues/12
    this.paginator._changePageSize(this.paginator.pageSize);
  }


  /*   // If you don't need a filter or a pagination this can be simplified, you just use code from else block
    // OLD METHOD:
    // if there's a paginator active we're using it for refresh
    if (this.dataSource._paginator.hasNextPage()) {
      this.dataSource._paginator.nextPage();
      this.dataSource._paginator.previousPage();
      // in case we're on last page this if will tick
    } else if (this.dataSource._paginator.hasPreviousPage()) {
      this.dataSource._paginator.previousPage();
      this.dataSource._paginator.nextPage();
      // in all other cases including active filter we do it like this
    } else {
      this.dataSource.filter = '';
      this.dataSource.filter = this.filter.nativeElement.value;
    }*/



  public loadData() {
    this.exampleDatabase = new StocksDataService(this.httpClient);
    this.dataSource = new StocksDataSource(this.exampleDatabase, this.paginator, this.sort);
    fromEvent(this.filter.nativeElement, 'keyup')
      // .debounceTime(150)
      // .distinctUntilChanged()
      .subscribe(() => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }
}

export class StocksDataSource extends DataSource<Stock> {
  _filterChange = new BehaviorSubject('');

  get filter(): string {
    return this._filterChange.value;
  }

  set filter(filter: string) {
    this._filterChange.next(filter);
  }

  filteredData: Stock[] = [];
  renderedData: Stock[] = [];

  constructor(public _exampleDatabase: StocksDataService,
              public _paginator: MatPaginator,
              public _sort: MatSort) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => this._paginator.pageIndex = 0);
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Stock[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this._exampleDatabase.dataChange,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page
    ];

    this._exampleDatabase.getAllStocks();


    return merge(...displayDataChanges).pipe(map( () => {
        // Filter data
        this.filteredData = this._exampleDatabase.data.slice().filter((stock: Stock) => {
          const searchStr = (stock.id + stock.name).toLowerCase();
          return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
        });

        // Sort filtered data
        const sortedData = this.sortData(this.filteredData.slice());

        // Grab the page's slice of the filtered sorted data.
        const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
        this.renderedData = sortedData.splice(startIndex, this._paginator.pageSize);
        return this.renderedData;
      }
    ));
  }

  disconnect() {}


  /** Returns a sorted copy of the database data. */
  sortData(data: Stock[]): Stock[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort.active) {
        case 'id': [propertyA, propertyB] = [a.id, b.id]; break;
        case 'name': [propertyA, propertyB] = [a.name, b.name]; break;
        case 'surname': [propertyA, propertyB] = [a.price, b.price]; break;
        case 'email': [propertyA, propertyB] = [a.amount, b.amount]; break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1);
    });
  }
}

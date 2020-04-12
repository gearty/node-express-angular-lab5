import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BrokersDataService} from './services/brokers-data.service';
import {HttpClient} from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {Broker} from './models/broker';
import {DataSource} from '@angular/cdk/collections';
import {AddBrokerDialogComponent} from './dialogs/add-broker/add-broker.dialog.component';
import {EditBrokerDialogComponent} from './dialogs/edit-broker/edit-broker.dialog.component';
import {DeleteBrokerDialogComponent} from './dialogs/delete-broker/delete-broker.dialog.component';
import {BehaviorSubject, fromEvent, merge, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './brokers.component.html',
  styleUrls: ['./brokers.component.css']
})

export class BrokersComponent implements OnInit {
  displayedColumns = ['id', 'name', 'surname', 'email', 'money', 'actions'];
  exampleDatabase: BrokersDataService | null;
  dataSource: BrokersDataSource | null;
  index: number;
  id: number;

  constructor(public httpClient: HttpClient,
              public dialog: MatDialog,
              public dataService: BrokersDataService) {}

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild('filter',  {static: true}) filter: ElementRef;

  ngOnInit() {
    this.loadData();
  }

  refresh() {
    this.loadData();
  }

  addNew(broker: Broker) {
    const dialogRef = this.dialog.open(AddBrokerDialogComponent, {
      data: {issue: broker }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        setTimeout(() => this.refresh(), 500);
      }
    });
  }

  startEdit(i: number, id: number, name: string, surname: string, email: string, money: number) {
    this.id = id;
    // index row is used just for debugging proposes and can be removed
    this.index = i;
    console.log(this.index);
    const dialogRef = this.dialog.open(EditBrokerDialogComponent, {
      data: {id: id, name: name, surname: surname, email: email, money: money}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        setTimeout(() => this.refresh(), 500);
      }
    });
  }

  deleteItem(i: number, id: number, name: string, surname: string, email: string) {
    this.index = i;
    this.id = id;
    const dialogRef = this.dialog.open(DeleteBrokerDialogComponent, {
      data: {id: id, name: name, surname: surname, email: email}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        const foundIndex = this.exampleDatabase.dataChange.value.findIndex(x => x.id === this.id);
        // for delete-stock-broker we use splice in order to remove single object from StocksDataService
        this.exampleDatabase.dataChange.value.splice(foundIndex, 1);
        this.refreshTable();
      }
    });
  }


  private refreshTable() {
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
    this.exampleDatabase = new BrokersDataService(this.httpClient);
    this.dataSource = new BrokersDataSource(this.exampleDatabase, this.paginator, this.sort);
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

export class BrokersDataSource extends DataSource<Broker> {
  _filterChange = new BehaviorSubject('');

  get filter(): string {
    return this._filterChange.value;
  }

  set filter(filter: string) {
    this._filterChange.next(filter);
  }

  filteredData: Broker[] = [];
  renderedData: Broker[] = [];

  constructor(public _exampleDatabase: BrokersDataService,
              public _paginator: MatPaginator,
              public _sort: MatSort) {
    super();
    // Reset to the first page when the user changes the filter.
    this._filterChange.subscribe(() => this._paginator.pageIndex = 0);
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Broker[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this._exampleDatabase.dataChange,
      this._sort.sortChange,
      this._filterChange,
      this._paginator.page
    ];

    this._exampleDatabase.getAllBrokers();


    return merge(...displayDataChanges).pipe(map( () => {
        // Filter data
        this.filteredData = this._exampleDatabase.data.slice().filter((broker: Broker) => {
          const searchStr = (broker.id + broker.name + broker.email + broker.surname).toLowerCase();
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
  sortData(data: Broker[]): Broker[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';

      switch (this._sort.active) {
        case 'id': [propertyA, propertyB] = [a.id, b.id]; break;
        case 'name': [propertyA, propertyB] = [a.name, b.name]; break;
        case 'surname': [propertyA, propertyB] = [a.surname, b.surname]; break;
        case 'email': [propertyA, propertyB] = [a.email, b.email]; break;
        case 'money': [propertyA, propertyB] = [a.money, b.money]; break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1);
    });
  }
}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {StocksComponent} from './stocks/stocks.component';
import {BrokersComponent} from './brokers/brokers.component';
import {NoPageFoundComponent} from './no-page-found/no-page-found.component';

const routes: Routes = [
  { path: '', redirectTo: '/stocks', pathMatch: 'full' },
  { path: 'stocks', component: StocksComponent },
  { path: 'brokers', component: BrokersComponent },
  { path: '**', component: NoPageFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }

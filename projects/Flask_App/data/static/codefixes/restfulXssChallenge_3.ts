import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { MatTableDataSource } from '@angular/material/table'
import { ProductService } from '../product.service'
import { forkJoin, Observable, Subscription } from 'rxjs'
import { QuantityService } from '../quantity.service'
import { DomSanitizer } from '@angular/platform-browser'
import { Router } from '@angular/router'
import { tap } from 'rxjs/operators'

export interface TableEntry {
  name: string
  price: number
  deluxePrice: number
  id: number
  image: string
  description: any
  quantity?: number
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements AfterViewInit, OnDestroy {
  displayedColumns: string[] = ['image', 'name', 'price', 'deluxePrice', 'quantity']
  dataSource = new MatTableDataSource<TableEntry>()
  gridDataSource: Observable<TableEntry[]> | null = null
  resultsLength = 0
  pageSizeOptions: number[] = []
  tableData: any
  routerSubscription: Subscription

  constructor (
    private productService: ProductService,
    private quantityService: QuantityService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  @ViewChild(MatPaginator) paginator: MatPaginator

  ngAfterViewInit () {
    const products = this.productService.search('')
    const quantities = this.quantityService.getAll()
    forkJoin([quantities, products]).subscribe(([quantities, products]) => {
      const dataTable: TableEntry[] = []
      this.tableData = products
      this.trustProductDescription(products)
      for (const product of products) {
        dataTable.push({
          name: product.name,
          price: product.price,
          deluxePrice: product.deluxePrice,
          id: product.id,
          image: product.image,
          description: product.description
        })
      }
      for (const quantity of quantities) {
        const entry = dataTable.find((dataTableEntry) => {
          return dataTableEntry.id === quantity.ProductId
        })
        if (entry === undefined) {
          continue
        }
        entry.quantity = quantity.quantity
      }
      this.dataSource = new MatTableDataSource<TableEntry>(dataTable)
      for (let i = 1; i <= Math.ceil(this.dataSource.data.length / 12); i++) {
        this.pageSizeOptions.push(i * 12)
      }
      this.paginator.pageSizeOptions = this.pageSizeOptions
      this.dataSource.paginator = this.paginator
      this.gridDataSource = this.dataSource.connect().pipe(
        tap(() => {
          this.filterTable()
        })
      ) // TP: Call filterTable after data is connected to avoid race condition
      this.resultsLength = this.dataSource.data.length
      this.filterTable()
      this.routerSubscription = this.router.events.subscribe(() => {
        this.filterTable()
      })
      this.cdRef.detectChanges()
    }, (err) => { console.log(err) })
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  } // TP: Unsubscribe from routerSubscription to prevent memory leaks

  trustProductDescription (tableData: any[]) {
    for (let i = 0; i < tableData.length; i++) {
      tableData[i].description = this.sanitizer.bypassSecurityTrustHtml(tableData[i].description)
    }
  }
}
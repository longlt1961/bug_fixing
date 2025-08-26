import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { MatTableDataSource } from '@angular/material/table'
import { ProductService } from '../Services/product.service'
import { QuantityService } from '../Services/quantity.service'
import { forkJoin, Subscription } from 'rxjs'
import { Router } from '@angular/router'
import { MatGridList } from '@angular/material/grid-list'

export interface TableEntry {
  name: string
  price: number
  deluxePrice: number
  id: number
  image: string
  description: string
  quantity?: number
}

/**
 * @title Data table with sorting, pagination, and filtering.
 */
@Component({
  selector: 'app-data-table',
  styleUrls: ['data-table.component.css'],
  templateUrl: 'data-table.component.html'
})
export class DataTableComponent implements AfterViewInit, OnDestroy {
  displayedColumns: string[] = ['image', 'name', 'price', 'deluxePrice', 'quantity']
  dataSource = new MatTableDataSource<TableEntry>()
  tableData: any
  routerSubscription: Subscription
  gridDataSource: any
  resultsLength = 0
  isLoadingResults = true
  isRateLimitReached = false
  breakpoint: number
  pageSizeOptions: number[] = []
  @ViewChild(MatPaginator) paginator: MatPaginator
  @ViewChild(MatGridList) grid: MatGridList

  constructor (private productService: ProductService, private quantityService: QuantityService, private router: Router, private cdRef: ChangeDetectorRef) { }

  ngAfterViewInit () {
    const products = this.productService.search('')
    const quantities = this.quantityService.getAll()
    forkJoin([quantities, products]).subscribe(([quantities, products]) => {
      const dataTable: TableEntry[] = []
      this.tableData = products
      this.encodeProductDescription(products)
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
      this.gridDataSource = this.dataSource.connect()
      this.resultsLength = this.dataSource.data.length
      this.filterTable()
      this.routerSubscription = this.router.events.subscribe(() => {
        this.filterTable()
      })
      if (window.innerWidth < 2600) {
        this.breakpoint = 4
        if (window.innerWidth < 1740) {
          this.breakpoint = 3
          if (window.innerWidth < 1280) {
            this.breakpoint = 2
            if (window.innerWidth < 850) {
              this.breakpoint = 1
            }
          }
        }
      } else {
         this.breakpoint = 6
      }
      this.cdRef.detectChanges()
    }, (err) => { console.log(err) })
  }

  encodeProductDescription (tableData: any[]) {
    for (let i = 0; i < tableData.length; i++) {
      // Fix: Encode product description to prevent XSS vulnerabilities.
      // Replaces <, >, ", and ' with their HTML entities.
      tableData[i].description = tableData[i].description
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    }
  }

  filterTable () {
    this.dataSource.filterPredicate = (data: TableEntry, filter: string) => {
      const searchText = this.router.url.substring(this.router.url.lastIndexOf('/') + 1).toLowerCase()
      if (searchText === 'search') {
        return true
      }
      if (data.name.toLowerCase().includes(searchText) || data.description.toLowerCase().includes(searchText)) {
        return true
      } else {
        return false
      }
    }
    this.dataSource.filter = this.router.url
  }

  ngOnDestroy () {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe()
    }
  }
}
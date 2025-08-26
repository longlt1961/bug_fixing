import { AfterViewInit, Component, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { MatTableDataSource } from '@angular/material/table'
import { ProductService } from '../Services/product.service'
import { Router, NavigationEnd } from '@angular/router'
import { QuantityService } from '../Services/quantity.service'
import { forkJoin, Observable, Subscription } from 'rxjs'

export interface TableEntry {
  image: string
  name: string
  price: number
  deluxePrice: number
  quantity?: number
  description: string
  id: number
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements AfterViewInit, OnDestroy {
  tableData: any
  pageSizeOptions: number[] = []
  @ViewChild(MatPaginator) paginator: MatPaginator
  dataSource = new MatTableDataSource<TableEntry>()
  displayedColumns: string[] = ['image', 'name', 'price', 'deluxePrice', 'quantity', 'description']
  gridDataSource: Observable<TableEntry[]>
  resultsLength = 0
  routerSubscription: Subscription
  breakpoint: number
  constructor (private productService: ProductService,
    private quantityService: QuantityService,
    private router: Router,
    private cdRef: ChangeDetectorRef) {
  }

  filterTable () {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const dataStr = JSON.stringify(data).toLocaleLowerCase()
      return dataStr.indexOf(filter) != -1
    }
    this.dataSource.filter = this.router.url
  }

  ngAfterViewInit () {
    const products = this.productService.search('')
    const quantities = this.quantityService.getAll()
    forkJoin([quantities, products]).subscribe(([quantities, products]) => {
      const dataTable: TableEntry[] = []
        this.tableData = products
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

    if(dataTable.length > 0){ // add conditional to check if dataTable has entries before processing quantities
      for (const quantity of quantities) {
        const entry = dataTable.find((dataTableEntry) => {
          return dataTableEntry.id === quantity.ProductId
        })
        if (entry === undefined) {
          continue
        }
        entry.quantity = quantity.quantity
      }
    }
      this.dataSource = new MatTableDataSource<TableEntry>(dataTable)
       for (let i = 1; i <= Math.max(1, Math.ceil(this.dataSource.data.length / 12)); i++) { // Ensure at least one page
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

  ngOnDestroy () {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe() // unsubscribe to prevent memory leaks
    }
  }
}
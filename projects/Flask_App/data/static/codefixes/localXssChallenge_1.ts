import { DomSanitizer } from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router'
import { Subscription } from 'rxjs'

// ... other imports

  searchValue: any
  emptyState: boolean = false
  gridDataSource: any
  subscription: Subscription | undefined

  constructor (private route: ActivatedRoute, private sanitizer: DomSanitizer) {}

  filterTable () {
    let queryParam: string = this.route.snapshot.queryParams.q
    if (queryParam) {
      queryParam = queryParam.trim()
      this.dataSource.filter = queryParam.toLowerCase()
      // Fixed: remove bypassSecurityTrustResourceUrl to avoid potential XSS
      this.searchValue = queryParam
      // this.gridDataSource.subscribe((result: any) => { // Commented out: the subscribe should not happen every filter
      //   if (result.length === 0) {
      //     this.emptyState = true
      //   } else {
      //     this.emptyState = false
      //   }
      // })
    } else {
      this.dataSource.filter = ''
      this.searchValue = undefined
      this.emptyState = false
    }
  }
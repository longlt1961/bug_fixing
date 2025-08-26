import { Subscription } from 'rxjs'; // Import Subscription

  private gridDataSourceSubscription: Subscription | undefined;

filterTable () {
    let queryParam: string = this.route.snapshot.queryParams.q
    if (queryParam) {
      queryParam = queryParam.trim()
      this.dataSource.filter = queryParam.toLowerCase()
      this.searchValue = queryParam
      // Unsubscribe from previous subscription to prevent memory leaks
      if (this.gridDataSourceSubscription) {
        this.gridDataSourceSubscription.unsubscribe();
      }

      // Subscribe to gridDataSource and store the subscription
      this.gridDataSourceSubscription = this.gridDataSource.subscribe((result: any) => {
        if (result.length === 0) {
          this.emptyState = true
        } else {
          this.emptyState = false
        }
      })
    } else {
      this.dataSource.filter = ''
      this.searchValue = undefined
      this.emptyState = false
    }
  }
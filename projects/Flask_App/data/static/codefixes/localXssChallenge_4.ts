import { Subscription } from 'rxjs'; // Import Subscription

// ... other imports

  subscription: Subscription | undefined; // Add a subscription property

  filterTable () {
    let queryParam: string = this.route.snapshot.queryParams.q
    if (queryParam) {
      queryParam = queryParam.trim()
      this.dataSource.filter = queryParam.toLowerCase()
      this.searchValue = this.sanitizer.bypassSecurityTrustStyle(queryParam) 
      // Store the subscription to unsubscribe later.
      this.subscription = this.gridDataSource.subscribe((result: any) => {
        if (result.length === 0) {
          this.emptyState = true
        } else {
          this.emptyState = false
        }
      });
    } else {
      this.dataSource.filter = ''
      this.searchValue = undefined
      this.emptyState = false
    }
  }

  ngOnDestroy() {
    // Unsubscribe from the gridDataSource to prevent memory leaks.
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
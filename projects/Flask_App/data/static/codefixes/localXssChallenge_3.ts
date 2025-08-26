import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OnDestroy } from '@angular/core';

// ... other imports

export class YourComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>(); // Add Subject to manage the unsubscription

  filterTable () {
    let queryParam: string = this.route.snapshot.queryParams.q
    if (queryParam) {
      queryParam = queryParam.trim()
      this.dataSource.filter = queryParam.toLowerCase()
      this.searchValue = this.sanitizer.bypassSecurityTrustHtml(queryParam) // Use bypassSecurityTrustHtml to prevent XSS
      this.gridDataSource.subscribe((result: any) => {
        if (result.length === 0) {
          this.emptyState = true
        } else {
          this.emptyState = false
        }
      }).pipe(takeUntil(this.destroy$)).subscribe(); // Use takeUntil operator to automatically unsubscribe when destroy$ emits
    } else {
      this.dataSource.filter = ''
      this.searchValue = undefined
      this.emptyState = false
    }
  }

  ngOnDestroy(): void { // Implement OnDestroy lifecycle hook to emit a notification on destroy$
    this.destroy$.next();
    this.destroy$.complete();
  }
}
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IsmaCart {
  
  constructor() { }

  getCreditCardMonths(startMonth: number): Observable<number[]> {
    // build an array for "Month" dropdown list 
    let data: number[] = [];
    for (let theMonth = startMonth; theMonth <= 12; theMonth++) {
      data.push(theMonth);
    }
    return of(data);  
  }

  getCreditCardYears(): Observable<number[]> {
    // build an array for "Year" dropdown list 
    let data: number[] = [];
    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear + 10;
    for (let theYear = startYear; theYear <= endYear; theYear++) {
      data.push(theYear);
    }
    return of(data);  
  }
}


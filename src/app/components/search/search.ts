import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  imports: [CommonModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search {

  constructor(private router: Router) {}

  ngOnInit(): void {
    
  }

  // Method to handle search action and navigate to the search results page
  doSearch(value: string): void {
    console.log(`value is ${value}`);
    this.router.navigateByUrl(`/search/${value}`);
  }

}
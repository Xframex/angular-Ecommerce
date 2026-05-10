import { Component, OnInit } from '@angular/core';
import { OrderHistoryService } from '../../services/order-history.service';
import { OrderHistory } from '../../common/order-history';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-history',
  imports: [CommonModule],
  templateUrl: './order-history.html',
  styleUrl: './order-history.css',
})
export class OrderHistoryComponent implements OnInit {

  orderHistoryList: OrderHistory[] = [];
  loading = true;
  error = false;

  constructor(private orderHistoryService: OrderHistoryService) { }

  ngOnInit(): void {
    this.handleOrderHistory();
  }

  handleOrderHistory() {
    const theEmail = localStorage.getItem('email');

    if (!theEmail) {
      this.loading = false;
      this.error = true;
      return;
    }

    this.orderHistoryService.getOrderHistory(theEmail).subscribe({
      next: data => {
        this.orderHistoryList = data._embedded.orders;
        this.loading = false;
      },
      error: err => {
        console.error('Error fetching order history:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
}

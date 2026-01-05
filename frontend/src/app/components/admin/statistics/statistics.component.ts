import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsService } from '../services/statistics.service';

// Chart.js imports
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-statistics',
  standalone: true,
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
  imports: [CommonModule]
})
export class StatisticsComponent implements OnInit {

  // === KPIs ===
  totalOrders = 0;
  totalCustomers = 0;
  monthlyRevenue = 0;

  // === GRAPH ===
  ordersChart: any;
  ordersPerMonth: any[] = [];

  constructor(
    private statsService: StatisticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {

    // ---- TOTAL ORDERS ----
    this.statsService.getTotalOrders().subscribe({
      next: (value) => {
        this.totalOrders = Number(value);
        this.cdr.detectChanges();
      },
      error: err => console.error("Error totalOrders:", err)
    });

    // ---- TOTAL CUSTOMERS ----
    this.statsService.getTotalCustomers().subscribe({
      next: (value) => {
        this.totalCustomers = Number(value);
        this.cdr.detectChanges();
      },
      error: err => console.error("Error totalCustomers:", err)
    });

    // ---- TOTAL REVENUE ----
    this.statsService.getTotalRevenue().subscribe({
      next: (value) => {
        this.monthlyRevenue = Number(value);
        this.cdr.detectChanges();
      },
      error: err => console.error("Error totalRevenue:", err)
    });

    // ---- ORDERS PER MONTH (GRAPH) ----
    this.statsService.getOrdersPerMonth().subscribe({
      next: (data) => {
        console.log("Orders per month =", data);
        this.ordersPerMonth = data;
        this.createOrdersChart();
      },
      error: err => console.error("Error orders-per-month:", err)
    });
  }

  // =======================
  // === CREATE LINE GRAPH ===
  // =======================
  createOrdersChart(): void {

    const labels = this.ordersPerMonth.map(item => item.month);
    const values = this.ordersPerMonth.map(item => item.totalOrders);

    // Si le graph existe déjà → on le détruit (sinon bug)
    if (this.ordersChart) {
      this.ordersChart.destroy();
    }

    this.ordersChart = new Chart("ordersChartCanvas", {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Orders per Month',
          data: values,
          borderColor: 'blue',
          backgroundColor: 'rgba(0, 0, 255, 0.2)',
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
}

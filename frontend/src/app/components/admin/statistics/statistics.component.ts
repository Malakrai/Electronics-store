import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ViewChild, ElementRef, inject, PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { StatisticsService } from '../../../services/statistics.service';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
})
export class StatisticsComponent implements OnInit, AfterViewInit, OnDestroy {

  private platformId = inject(PLATFORM_ID);
  private viewReady = false;
  private chartRegistered = false;

  // canvases (optionnels pour éviter crash si pas encore rendus)
  @ViewChild('ordersCanvas') ordersCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('revenueCanvas') revenueCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryCanvas') categoryCanvas?: ElementRef<HTMLCanvasElement>;

  loading = true;
  error: string | null = null;

  selectedYear = 2025;
  selectedMonth = '';

  totalOrders = 0;
  totalCustomers = 0;
  totalRevenue = 0;
  itemsPerOrder = 0;

  momGrowth = 0;
  yoyGrowth = 0;

  ordersPerMonth: any[] = [];
  revenueByMonth: any[] = [];
  categoryShare: any[] = [];
  categoryMargin: any[] = [];

  topProductsMonth: any[] = [];
  topProductsYear: any[] = [];
  topProductsRevenue: any[] = [];

  productTab: 'month' | 'year' | 'revenue' = 'month';

  private ordersChart?: Chart;
  private revenueChart?: Chart;
  private categoryChart?: Chart;

  constructor(private stats: StatisticsService) {}

  ngOnInit(): void {
    this.reload();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.tryRenderCharts();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  reload(): void {
    this.loading = true;
    this.error = null;

    const year = this.selectedYear;
    const prevYear = year - 1;

    forkJoin({
      totalOrders: this.stats.getTotalOrders(year),
      totalCustomers: this.stats.getTotalCustomers(),
      totalRevenue: this.stats.getTotalRevenue(year),
      totalRevenuePrev: this.stats.getTotalRevenue(prevYear),
      itemsPerOrder: this.stats.getItemsPerOrder(),

      ordersPerMonth: this.stats.getOrdersPerMonth(year),
      revenueByMonth: this.stats.getRevenueByMonth(year),

      categoryShare: this.stats.getCategoryShare(year),
      categoryMargin: this.stats.getCategoryMargin(year),

      topYear: this.stats.getTopProductsYear(year, 10),
      topRevenue: this.stats.getTopProductsByRevenue(10),
    }).subscribe({
      next: (res) => {
        this.totalOrders = Number(res.totalOrders || 0);
        this.totalCustomers = Number(res.totalCustomers || 0);
        this.totalRevenue = Number(res.totalRevenue || 0);
        this.itemsPerOrder = Number(res.itemsPerOrder || 0);

        const prev = Number(res.totalRevenuePrev || 0);
        this.yoyGrowth = prev > 0 ? ((this.totalRevenue - prev) / prev) * 100 : 0;

        this.ordersPerMonth = (res.ordersPerMonth || []).map((r: any) => ({
          month: r.month,
          totalOrders: Number(r.totalOrders ?? 0),
        }));

        this.revenueByMonth = (res.revenueByMonth || []).map((r: any) => ({
          month: r.month,
          revenue: Number(r.revenue ?? 0),
        }));

        this.categoryShare = (res.categoryShare || []).map((r: any) => ({
          category: r.category,
          revenue: Number(r.revenue ?? 0),
          sharePercent: Number(r.sharePercent ?? 0),
        }));

        this.categoryMargin = (res.categoryMargin || []).map((r: any) => ({
          category: r.category,
          margin: Number(r.margin ?? 0),
        }));

        const months = this.revenueByMonth.map((x: any) => x.month);
        const latestMonth = months.length ? months[months.length - 1] : '';
        if (!this.selectedMonth) this.selectedMonth = latestMonth;

        this.topProductsYear = res.topYear || [];
        this.topProductsRevenue = res.topRevenue || [];

        this.momGrowth = this.computeMoMGrowth(this.revenueByMonth);

        // load top month
        if (this.selectedMonth) {
          this.stats.getTopProductsMonth(this.selectedMonth, 10).subscribe({
            next: (list) => {
              this.topProductsMonth = list || [];
              this.loading = false;
              this.tryRenderCharts();
            },
            error: () => {
              this.topProductsMonth = [];
              this.loading = false;
              this.tryRenderCharts();
            }
          });
        } else {
          this.topProductsMonth = [];
          this.loading = false;
          this.tryRenderCharts();
        }
      },
      error: (err) => {
        this.error = err?.message ?? 'Erreur lors du chargement';
        this.loading = false;
        this.destroyCharts();
      }
    });
  }

  onYearChange(): void {
    this.selectedMonth = '';
    this.reload();
  }

  onMonthChange(): void {
    if (!this.selectedMonth) return;
    this.stats.getTopProductsMonth(this.selectedMonth, 10).subscribe({
      next: (list) => (this.topProductsMonth = list || []),
      error: () => (this.topProductsMonth = [])
    });
  }

  private computeMoMGrowth(rows: any[]): number {
    if (!rows || rows.length < 2) return 0;
    const last = Number(rows[rows.length - 1]?.revenue ?? 0);
    const prev = Number(rows[rows.length - 2]?.revenue ?? 0);
    if (prev <= 0) return 0;
    return ((last - prev) / prev) * 100;
  }

  private tryRenderCharts(): void {
    // 1) SSR guard
    if (!this.isBrowser) return;

    // 2) DOM not ready yet
    if (!this.viewReady || this.loading) return;

    // 3) canvases not available yet because of *ngIf rendering timing
    if (!this.ordersCanvas?.nativeElement || !this.revenueCanvas?.nativeElement || !this.categoryCanvas?.nativeElement) {
      // re-try next frame
      requestAnimationFrame(() => this.tryRenderCharts());
      return;
    }

    // Register chart.js once
    if (!this.chartRegistered) {
      Chart.register(...registerables);
      this.chartRegistered = true;
    }

    // render next frame to be safe
    requestAnimationFrame(() => this.renderCharts());
  }

  private renderCharts(): void {
    this.destroyCharts();

    // Orders
    this.ordersChart = new Chart(this.ordersCanvas!.nativeElement, {
      type: 'line',
      data: {
        labels: this.ordersPerMonth.map((x: any) => x.month),
        datasets: [{
          label: 'Orders / Month',
          data: this.ordersPerMonth.map((x: any) => x.totalOrders),
          borderWidth: 2,
          tension: 0.25,
          fill: false
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });

    // Revenue
    this.revenueChart = new Chart(this.revenueCanvas!.nativeElement, {
      type: 'line',
      data: {
        labels: this.revenueByMonth.map((x: any) => x.month),
        datasets: [{
          label: 'Revenue / Month (€)',
          data: this.revenueByMonth.map((x: any) => x.revenue),
          borderWidth: 2,
          tension: 0.25,
          fill: false
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });

    // Category share
    this.categoryChart = new Chart(this.categoryCanvas!.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.categoryShare.map((x: any) => x.category),
        datasets: [{
          label: 'Share (%)',
          data: this.categoryShare.map((x: any) => x.sharePercent),
          borderWidth: 1
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
  }

  private destroyCharts(): void {
    this.ordersChart?.destroy();
    this.revenueChart?.destroy();
    this.categoryChart?.destroy();
    this.ordersChart = undefined;
    this.revenueChart = undefined;
    this.categoryChart = undefined;
  }

  get monthOptions(): string[] {
    return this.revenueByMonth.map((x: any) => x.month);
  }
}

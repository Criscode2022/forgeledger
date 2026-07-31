import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardSummary } from '../../core/models';
import { money, statusClass, statusLabel } from '../../core/utils';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  readonly data = signal<DashboardSummary | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  money = money;
  statusClass = statusClass;
  statusLabel = statusLabel;

  private chart?: Chart;

  ngOnInit() {
    this.api.dashboard().subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
        setTimeout(() => this.renderChart(d), 0);
      },
      error: () => {
        this.error.set('Failed to load dashboard');
        this.loading.set(false);
      },
    });
  }

  private renderChart(d: DashboardSummary) {
    const canvas = document.getElementById('cashflowChart') as HTMLCanvasElement | null;
    if (!canvas) return;
    this.chart?.destroy();
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: d.revenueByMonth.map((m) => m.month),
        datasets: [
          {
            label: 'Revenue',
            data: d.revenueByMonth.map((m) => m.revenue),
            backgroundColor: 'rgba(212, 212, 216, 0.85)',
            borderRadius: 6,
          },
          {
            label: 'Expenses',
            data: d.revenueByMonth.map((m) => m.expenses),
            backgroundColor: 'rgba(113, 113, 122, 0.55)',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#a1a1aa', boxWidth: 12, font: { size: 12 } },
          },
        },
        scales: {
          x: {
            ticks: { color: '#71717a' },
            grid: { color: 'rgba(244,244,245,0.06)' },
          },
          y: {
            ticks: { color: '#71717a' },
            grid: { color: 'rgba(244,244,245,0.06)' },
          },
        },
      },
    };
    this.chart = new Chart(canvas, config);
  }
}

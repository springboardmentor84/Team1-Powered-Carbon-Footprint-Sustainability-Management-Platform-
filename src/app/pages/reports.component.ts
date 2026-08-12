import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { EcoTrackService } from '../data/ecotrack.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-head">
      <div>
        <span class="eyebrow">Reports and exports</span>
        <h2>Convert tracked activity into clear sustainability reports.</h2>
        <p>This frontend prepares the data your Spring Boot backend can export as PDF, Excel, or weekly email summaries.</p>
      </div>
      <button class="button primary" (click)="downloadCsv()">Export CSV</button>
    </section>

    <section class="report-layout">
      <article class="panel report-summary">
        <span class="eyebrow">Monthly report</span>
        <h3>{{ data.profile().name }} sustainability summary</h3>
        <div class="pie-chart" [style.background]="pieBackground" aria-label="Carbon emissions by category"></div>
        <div class="report-metric">
          <span>Total carbon footprint</span>
          <strong>{{ data.totalEmissions() | number:'1.1-1' }} kg CO2e</strong>
        </div>
        <div class="report-metric">
          <span>Sustainability score</span>
          <strong>{{ data.sustainabilityScore() }}/100</strong>
        </div>
        <div class="report-metric">
          <span>Reward balance</span>
          <strong>{{ data.rewardPoints() }} points</strong>
        </div>
      </article>

      <article class="panel wide">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Export preview</span>
            <h3>Carbon activity table</h3>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Activity</th>
                <th>Amount</th>
                <th>CO2e</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let entry of data.entries()">
                <td>{{ entry.date }}</td>
                <td>{{ entry.category }}</td>
                <td>{{ entry.title }}</td>
                <td>{{ entry.amount }} {{ entry.unit }}</td>
                <td>{{ entry.emissionsKg }} kg</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>

    <section class="content-grid">
      <article class="panel wide">
        <div class="panel-header">
          <div>
            <span class="eyebrow">Pie chart data</span>
            <h3>Usage categories</h3>
          </div>
        </div>

        <div class="legend-grid">
          <div class="legend-row" *ngFor="let segment of segments">
            <i [style.background]="segment.color"></i>
            <span>{{ segment.category }}</span>
            <strong>{{ segment.total | number:'1.1-1' }} kg CO2e</strong>
          </div>
        </div>
      </article>

      <article class="panel">
        <span class="eyebrow">Next action</span>
        <h3>Improve your report</h3>
        <p class="muted-copy">Add more usage records from the Carbon Tracker page. The pie chart and report table update automatically from your saved activities.</p>
      </article>
    </section>
  `
})
export class ReportsComponent {
  constructor(readonly data: EcoTrackService) {}

  readonly colors = ['#0f766e', '#65a30d', '#d97706', '#2563eb', '#14b8a6', '#84cc16', '#f59e0b', '#64748b'];

  get segments(): Array<{ category: string; total: number; color: string; start: number; end: number }> {
    const totals = this.data.categories
      .map((category, index) => ({ category, total: this.data.categoryTotal(category), color: this.colors[index] }))
      .filter((item) => item.total > 0);
    const total = totals.reduce((sum, item) => sum + item.total, 0) || 1;
    let start = 0;

    return totals.map((item) => {
      const size = (item.total / total) * 100;
      const segment = { ...item, start, end: start + size };
      start += size;
      return segment;
    });
  }

  get pieBackground(): string {
    if (!this.segments.length) {
      return '#e5ebe8';
    }

    const stops = this.segments
      .map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`)
      .join(', ');
    return `conic-gradient(${stops})`;
  }

  downloadCsv(): void {
    const rows = [
      ['Date', 'Category', 'Activity', 'Amount', 'Unit', 'Emissions kg CO2e'],
      ...this.data.entries().map((entry) => [entry.date, entry.category, entry.title, entry.amount, entry.unit, entry.emissionsKg])
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ecotrack-carbon-report.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }
}

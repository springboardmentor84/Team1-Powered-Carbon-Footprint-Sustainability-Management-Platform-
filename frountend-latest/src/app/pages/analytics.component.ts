import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EcoTrackService } from '../data/ecotrack.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container" style="padding: 24px; max-width: 1200px; margin: 0 auto;">
      <header style="margin-bottom: 2rem;">
        <h1>Analytics Dashboard</h1>
        <p style="color: #666;">View your carbon footprint and sustainability progress.</p>
      </header>

      <div *ngIf="loading" style="text-align: center; padding: 3rem;">
        <p>Loading analytics data...</p>
      </div>

      <div *ngIf="error" style="background: #fee2e2; color: #dc2626; padding: 1rem; border-radius: 8px;">
        <p>{{ error }}</p>
        <button (click)="loadAnalytics()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
      </div>

      <div *ngIf="!loading && !error && isZeroData" style="text-align: center; padding: 4rem; background: #f8fafc; border-radius: 12px;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🌱</div>
        <h2 style="margin-bottom: 0.5rem;">Start your sustainability journey</h2>
        <p style="color: #666; margin-bottom: 1.5rem;">You don't have any data yet. Start tracking your carbon footprint to see your analytics!</p>
      </div>

      <div *ngIf="!loading && !error && !isZeroData">
        
        <!-- Summary Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
          <div class="card" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <p style="color: #666; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; text-transform: uppercase;">Total Emissions</p>
            <p style="font-size: 2rem; font-weight: 700; color: #166534;">{{ data?.totalCarbonEmissions | number:'1.1-1' }} <span style="font-size: 1rem; color: #666; font-weight: normal;">kg CO₂e</span></p>
          </div>
          
          <div class="card" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <p style="color: #666; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; text-transform: uppercase;">Total Activities</p>
            <p style="font-size: 2rem; font-weight: 700; color: #1e40af;">{{ data?.totalActivities }}</p>
          </div>

          <div class="card" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <p style="color: #666; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; text-transform: uppercase;">Highest Emission Area</p>
            <p style="font-size: 1.5rem; font-weight: 700; color: #991b1b;">{{ data?.highestEmissionCategory }}</p>
          </div>
          
          <div class="card" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <p style="color: #666; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; text-transform: uppercase;">Eco Score</p>
            <p style="font-size: 2rem; font-weight: 700; color: #854d0e;">{{ data?.gamificationStats?.ecoScore }}</p>
          </div>
        </div>

        <!-- Charts -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
          
          <div class="chart-container" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <h3 style="margin-bottom: 1rem; font-size: 1.1rem; color: #374151;">Emissions by Category</h3>
            <div style="position: relative; height: 300px; width: 100%;">
              <canvas #doughnutCanvas></canvas>
            </div>
          </div>

          <div class="chart-container" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <h3 style="margin-bottom: 1rem; font-size: 1.1rem; color: #374151;">Emissions Over Time</h3>
            <div style="position: relative; height: 300px; width: 100%;">
              <canvas #lineCanvas></canvas>
            </div>
          </div>

          <div class="chart-container" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); grid-column: 1 / -1;">
            <h3 style="margin-bottom: 1rem; font-size: 1.1rem; color: #374151;">Monthly Emissions Breakdown</h3>
            <div style="position: relative; height: 350px; width: 100%;">
              <canvas #barCanvas></canvas>
            </div>
          </div>

        </div>

      </div>
    </div>
  `
})
export class AnalyticsComponent implements OnInit {
  data: any = null;
  loading = true;
  error = '';
  isZeroData = false;

  @ViewChild('doughnutCanvas') doughnutCanvas!: ElementRef;
  @ViewChild('lineCanvas') lineCanvas!: ElementRef;
  @ViewChild('barCanvas') barCanvas!: ElementRef;

  doughnutChart: any;
  lineChart: any;
  barChart: any;

  constructor(private ecoTrack: EcoTrackService) {}

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.loading = true;
    this.error = '';
    
    this.ecoTrack.getAnalyticsFromBackend().subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
        
        if (!res || res.totalActivities === 0) {
          this.isZeroData = true;
        } else {
          this.isZeroData = false;
          // Wait for DOM to update and render canvases
          setTimeout(() => {
            this.initCharts();
          }, 0);
        }
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load analytics data. Please try again.';
        this.loading = false;
      }
    });
  }

  initCharts() {
    this.initDoughnutChart();
    this.initLineChart();
    this.initBarChart();
  }

  initDoughnutChart() {
    if (this.doughnutChart) this.doughnutChart.destroy();
    
    const categories = Object.keys(this.data.emissionsByCategory || {});
    const values = Object.values(this.data.emissionsByCategory || {});

    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: values,
          backgroundColor: [
            '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', 
            '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' }
        }
      }
    });
  }

  initLineChart() {
    if (this.lineChart) this.lineChart.destroy();

    const months = Object.keys(this.data.emissionTrends || {});
    const values = Object.values(this.data.emissionTrends || {});

    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Emissions (kg CO₂e)',
          data: values,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  initBarChart() {
    if (this.barChart) this.barChart.destroy();

    const months = Object.keys(this.data.monthlyEmissions || {});
    const values = Object.values(this.data.monthlyEmissions || {});

    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Emissions (kg CO₂e)',
          data: values,
          backgroundColor: '#22c55e',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
}

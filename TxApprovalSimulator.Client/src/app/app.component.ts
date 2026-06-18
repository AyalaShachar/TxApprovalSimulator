import { Component, OnInit, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { RegionSelectComponent } from './components/region-select/region-select.component';
import { ApprovedTransactionsComponent } from './components/approved-transactions/approved-transactions.component';
import { TransactionService } from './services/transaction.service';
import { LanguageService, Lang } from './services/language.service';
import { TransactionResult } from './models/transaction.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RegionSelectComponent, ApprovedTransactionsComponent, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private readonly service = inject(TransactionService);
  readonly language = inject(LanguageService);

  // ----- State -----
  readonly regions = signal<string[]>([]);
  readonly selectedRegion = signal<string | null>(null);
  readonly hour = signal(8);
  readonly minute = signal(0);

  readonly approved = this.service.approved;
  readonly result = signal<TransactionResult | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.service.getRegions().subscribe({
      next: regions => this.regions.set(regions),
      error: () => this.error.set('errors.loadRegions')
    });
    this.service.loadApproved();
  }

  setHour(value: string): void {
    this.hour.set(this.clamp(value, 23));
  }

  setMinute(value: string): void {
    this.minute.set(this.clamp(value, 59));
  }

  cancel(): void {
    this.hour.set(8);
    this.minute.set(0);
    this.result.set(null);
    this.error.set(null);
  }

  private clamp(value: string, max: number): number {
    const n = Number.parseInt(value, 10);
    if (Number.isNaN(n)) return 0;
    return Math.min(Math.max(n, 0), max);
  }

  get pad() {
    return (n: number) => n.toString().padStart(2, '0');
  }

  submit(): void {
    const region = this.selectedRegion();
    if (!region) {
      this.error.set('errors.selectRegion');
      return;
    }

    // Build the exact instant from today's date + the chosen time, in the user's local zone.
    const now = new Date();
    const moment = new Date(now.getFullYear(), now.getMonth(), now.getDate(), this.hour(), this.minute(), 0);

    this.loading.set(true);
    this.error.set(null);
    this.result.set(null);

    this.service.simulate({ region, timestamp: moment.toISOString() }).subscribe({
      next: result => {
        this.result.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('errors.submitFailed');
        this.loading.set(false);
      }
    });
  }
}

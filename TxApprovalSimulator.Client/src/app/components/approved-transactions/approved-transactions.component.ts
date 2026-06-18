import { Component, ElementRef, input, viewChild } from '@angular/core';
import { TransactionResult } from '../../models/transaction.model';

@Component({
  selector: 'app-approved-transactions',
  standalone: true,
  imports: [],
  templateUrl: './approved-transactions.component.html',
  styleUrl: './approved-transactions.component.scss'
})
export class ApprovedTransactionsComponent {
  readonly transactions = input<TransactionResult[]>([]);

  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

  scroll(direction: -1 | 1): void {
    const el = this.track()?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: direction * 260, behavior: 'smooth' });
  }
}

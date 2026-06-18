import { Component, ElementRef, input, viewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TransactionResult } from '../../models/transaction.model';

@Component({
  selector: 'app-approved-transactions',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './approved-transactions.component.html',
  styleUrl: './approved-transactions.component.scss'
})
export class ApprovedTransactionsComponent {
  readonly transactions = input<TransactionResult[]>([]);

  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

  scroll(direction: -1 | 1): void {
    const el = this.track()?.nativeElement;
    if (!el) return;
    // Page by the full visible width so the arrows land on whole cards.
    const target = el.scrollLeft + direction * el.clientWidth;
    this.animateScroll(el, el.scrollLeft, target, 450);
  }

  /** Smoothly animate scrollLeft with an easeInOutCubic curve. */
  private animateScroll(el: HTMLElement, from: number, to: number, duration: number): void {
    const start = performance.now();
    const easeInOutCubic = (t: number): number =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now: number): void => {
      const progress = Math.min((now - start) / duration, 1);
      el.scrollLeft = from + (to - from) * easeInOutCubic(progress);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }
}

import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  model,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-region-select',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './region-select.component.html',
  styleUrl: './region-select.component.scss'
})
export class RegionSelectComponent {
  /** Available regions to choose from. */
  readonly regions = input<string[]>([]);
  /** Two-way bound selected region. */
  readonly value = model<string | null>(null);
  readonly label = input<string>('Region');
  readonly placeholder = input<string>('search');

  private readonly host = inject(ElementRef<HTMLElement>);

  readonly open = signal(false);
  readonly query = signal('');

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const all = this.regions();
    return q ? all.filter(r => r.toLowerCase().includes(q)) : all;
  });

  toggle(): void {
    this.open.update(o => !o);
  }

  selectRegion(region: string): void {
    this.value.set(region);
    this.query.set('');
    this.open.set(false);
  }

  clear(event: MouseEvent): void {
    event.stopPropagation();
    this.value.set(null);
    this.query.set('');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}

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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-region-select',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './region-select.component.html',
  styleUrl: './region-select.component.scss'
})
export class RegionSelectComponent {
  /** Available regions to choose from (canonical English values). */
  readonly regions = input<string[]>([]);
  /** Two-way bound selected region — always the canonical English value sent to the API. */
  readonly value = model<string | null>(null);
  readonly label = input<string>('Region');
  readonly placeholder = input<string>('search');

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly translate = inject(TranslateService);

  readonly open = signal(false);
  readonly query = signal('');

  /** Translated label for display; falls back to the raw value if no translation exists. */
  displayLabel(region: string): string {
    const key = `regions.${region}`;
    const translated = this.translate.instant(key);
    return translated === key ? region : translated;
  }

  /** What the input shows: the live query while open, otherwise the selected region's label. */
  readonly inputDisplay = computed(() => {
    this.translate.currentLang(); // dependency: refresh on language switch
    if (this.open()) return this.query();
    const v = this.value();
    return v ? this.displayLabel(v) : '';
  });

  readonly filtered = computed(() => {
    this.translate.currentLang(); // dependency: re-filter on language switch
    const q = this.query().trim().toLowerCase();
    const all = this.regions();
    if (!q) return all;
    // Match against both the translated label and the canonical value.
    return all.filter(
      r => this.displayLabel(r).toLowerCase().includes(q) || r.toLowerCase().includes(q)
    );
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

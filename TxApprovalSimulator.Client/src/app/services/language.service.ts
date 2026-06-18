import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Lang = 'en' | 'he';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);

  /** The currently active language. */
  readonly current = signal<Lang>('en');

  /** Switch language and update document direction (RTL for Hebrew, LTR otherwise). */
  use(lang: Lang): void {
    this.translate.use(lang);
    this.current.set(lang);

    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'he' ? 'rtl' : 'ltr';
  }
}

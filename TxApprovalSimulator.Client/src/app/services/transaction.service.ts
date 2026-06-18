import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { SimulationRequest, TransactionResult } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /** Approved transactions shown in the bottom cards. Managed as signal state. */
  readonly approved = signal<TransactionResult[]>([]);

  getRegions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/regions`);
  }

  simulate(request: SimulationRequest): Observable<TransactionResult> {
    return this.http
      .post<TransactionResult>(`${this.baseUrl}/transactions`, request)
      .pipe(tap(() => this.loadApproved()));
  }

  loadApproved(): void {
    this.http
      .get<TransactionResult[]>(`${this.baseUrl}/transactions/approved`)
      .subscribe(list => this.approved.set(list));
  }
}

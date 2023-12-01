import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BillingPlan } from './models/billing/billing-plan';
import { map } from 'rxjs/operators';

@Injectable()
export class ApiBillingService {
  constructor(private httpClient: HttpClient) {}

  public getBillingPlans(): Observable<BillingPlan[]> {
    return this.httpClient
      .get<BillingPlan[]>(`${environment.api}/api/billing`)
      .pipe(map((x) => x.map((q) => new BillingPlan(q))));
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseUrlType, getInternautaUrl } from '@bds/internauta-model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImportaOrdiniInEconomiaService {
  private baseURL: string;
  private AOVRURL: string = "http://localhost:10005/internauta-api/resources/scripta/";

  constructor(protected _http: HttpClient) {
    this.baseURL = getInternautaUrl(BaseUrlType.Lotti);
   }

   // Chiamata GET per ottenere la lista degli ordini in un dato periodo di tempo da AOVR
  getOrdersInPeriod(startDate: Date, endDate: Date): Observable<any> {
    const params = { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
    return this._http.get<any>(`${this.AOVRURL}/ordini`, { params });
  }

  // Chiamata GET per ottenere i lotti degli ordini in economia selezionati dall'utente da AOVR
  getSelectedLotti(orderIds: number[]): Observable<any> {
    const params = { orderIds: orderIds.join(',') };
    return this._http.get<any>(`${this.AOVRURL}/lots/economy`, { params });
  }

  // Chiamata POST per scrivere i lotti su BABEL
  importaLotti(lotsData: any[]): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.post<any>(`${this.baseURL}/lots`, lotsData, { headers });
  }
  
}

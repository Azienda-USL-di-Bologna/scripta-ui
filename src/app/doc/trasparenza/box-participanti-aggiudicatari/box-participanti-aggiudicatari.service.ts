import { DatePipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  BaseUrlType,
  Componente,
  getInternautaUrl,
} from "@bds/internauta-model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class BoxParticipantiAggiudicatariService {
  private baseUrl: string;

  constructor(protected _http: HttpClient, protected _fatepipe: DatePipe) {
    this.baseUrl = getInternautaUrl(BaseUrlType.Lotti);
  }

  public getRuoloComponente(): Observable<any> {
    const url = this.baseUrl + "/ruolocomponente";
    return this._http.get(url);
  }
}

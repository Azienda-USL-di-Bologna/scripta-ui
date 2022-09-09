import { DatePipe } from '@angular/common';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Archivio, ArchivioDetail, ArchivioService } from '@bds/internauta-model';
import { getInternautaUrl, BaseUrlType } from "@bds/internauta-model";
import { AdditionalDataDefinition } from '@bds/next-sdr';
import { catchError, Observable } from 'rxjs';
import { ErrorManager } from '../utilities/error-manager';

@Injectable({
  providedIn: 'root'
})
export class ExtendedArchivioService extends ArchivioService {
  
  constructor(protected _http: HttpClient, protected _datepipe: DatePipe) {
    super(_http, _datepipe);
  }

  public updateArchivio<K extends keyof Archivio>(archivio: Archivio, fields: K[], projection?: string, additionalData?: AdditionalDataDefinition[]): Observable<Archivio> {
    const archivioToSave: Archivio = new Archivio();
    fields.forEach(
      field => {
        archivioToSave[field] = archivio[field];
      }
    );
    archivioToSave.version = archivio.version;
    return this.patchHttpCall(archivioToSave, archivio.id, projection, additionalData);
  }

  public numeraArchivio(archivio: Archivio | ArchivioDetail, requestedProjection: string): Observable<any> {
    const url = getInternautaUrl(BaseUrlType.Scripta) + "/numeraArchivio";
    console.log(url);
    let formData: FormData = new FormData();
    formData.append("idArchivio", archivio.id.toString());
    formData.append("projection", requestedProjection);
    return this._http.post(url, formData);
  }

  public calcolaPermessiEspliciti(idArchivio: number) {
    const apiUrl = getInternautaUrl(BaseUrlType.Scripta) + "/" + "calcolaPermessiEspliciti";
    let formData: FormData = new FormData();
    formData.append("idArchivio", idArchivio.toString());
    this._http.post(apiUrl, formData).subscribe();
  }

  public uploadDocument(formData: FormData) {
    const apiUrl = getInternautaUrl(BaseUrlType.Scripta) + "/" + "uploadDocument";
    console.log(apiUrl);
    return this._http.post(apiUrl, formData/* , { reportProgress: true, observe: "events" } */)
        .pipe(catchError(ErrorManager.errorMgmt));
  }
}

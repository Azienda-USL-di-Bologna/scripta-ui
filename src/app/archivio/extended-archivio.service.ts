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

  /**
   * Scarica l'archivio con tutto il suo contenuto in formato zip.
   * @param archivio L'archivio da scaricare.
   * @returns Il file zip.
   */
  public downloadArchivioZip(archivio: Archivio | ArchivioDetail): Observable<any> {
    const url = getInternautaUrl(BaseUrlType.Scripta) + `/downloadArchivioZip/${archivio.id}`;
    console.log(url);
    return this._http.get(url, {observe: 'response', responseType: "blob"});
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
    const formData: FormData = new FormData();
    formData.append("idArchivio", archivio.id.toString());
    formData.append("projection", requestedProjection);
    return this._http.post(url, formData);
  }

  public calcolaPermessiEspliciti(idArchivioRadice: number) {
    const apiUrl = getInternautaUrl(BaseUrlType.Scripta) + "/" + "calcolaPermessiEspliciti";
    const formData: FormData = new FormData();
    formData.append("idArchivioRadice", idArchivioRadice.toString());
    this._http.post(apiUrl, formData).subscribe();
  }

  public uploadDocument(formData: FormData) {
    const apiUrl = getInternautaUrl(BaseUrlType.Scripta) + "/" + "uploadDocument";
    console.log(apiUrl);
    return this._http.post(apiUrl, formData/* , { reportProgress: true, observe: "events" } */)
        .pipe(catchError(ErrorManager.errorMgmt));
  }

  public aggiungiArchivioRecente(idArchivioRadice: number) {
    const apiUrl = getInternautaUrl(BaseUrlType.Scripta) + "/" + "aggiungiArchivioRecente";
    const formData: FormData = new FormData();
    formData.append("idArchivio", idArchivioRadice.toString());
    this._http.post(apiUrl, formData).subscribe();
  }

  public archivioHasDoc(idArchivio: number) : Observable<any> {
    const apiUrl = getInternautaUrl(BaseUrlType.Scripta) + "/" + "archivioHasDoc";
    const formData: FormData = new FormData();
    formData.append("idArchivio", idArchivio.toString());
    return this._http.post(apiUrl, formData);
  }

  public deleteArchivio(idArchivio: number){
    const apiUrl = getInternautaUrl(BaseUrlType.Scripta) + "/" + "deleteArchivio";
    const formData: FormData = new FormData();
    formData.append("idArchivio", idArchivio.toString());
    return this._http.post(apiUrl, formData);
  }

  public spostaArchivio(idArchivio: number, idArchivioDestinazione: number, fascicolo: boolean, contenuto: boolean){
    const apiUrl = getInternautaUrl(BaseUrlType.Scripta) + "/" + "spostaArchivio";
    const formData: FormData = new FormData();
    formData.append("idArchivio", idArchivio.toString());
    formData.append("idArchivioDestinazione", idArchivioDestinazione.toString());
    formData.append("fascicolo", fascicolo.toString());
    formData.append("contenuto", contenuto.toString());
    return this._http.post(apiUrl, formData);
  }

  public copiaArchivio(idArchivio: number, idArchivioDestinazione: number, fascicolo: boolean, contenuto: boolean){
    const apiUrl = getInternautaUrl(BaseUrlType.Scripta) + "/" + "copiaArchivio";
    const formData: FormData = new FormData();
    formData.append("idArchivio", idArchivio.toString());
    formData.append("idArchivioDestinazione", idArchivioDestinazione.toString());
    formData.append("fascicolo", fascicolo.toString());
    formData.append("contenuto", contenuto.toString());
    return this._http.post(apiUrl, formData);
  }

  public duplicaArchivio(idArchivio: number, fascicolo: boolean, contenuto: boolean){
    const apiUrl = getInternautaUrl(BaseUrlType.Scripta) + "/" + "duplicaArchivio";
    const formData: FormData = new FormData();
    formData.append("idArchivio", idArchivio.toString());
    formData.append("fascicolo", fascicolo.toString());
    formData.append("contenuto", contenuto.toString());
    return this._http.post(apiUrl, formData);
  }

  public rendiFascicolo(idArchivio: number){
    const apiUrl = getInternautaUrl(BaseUrlType.Scripta) + "/" + "rendiFascicolo";
    const formData: FormData = new FormData();
    formData.append("idArchivio", idArchivio.toString());
    return this._http.post(apiUrl, formData);
  }
}

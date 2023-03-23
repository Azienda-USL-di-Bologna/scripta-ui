import { Injectable } from "@angular/core";
import { Archivio } from "@bds/internauta-model";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ArchivioUtilsService {
  private _updateArchivioField = new Subject<ArchivioFieldUpdating>();
  private _deletedArchive = new Subject<number>();

  constructor() {  }

  /******************************************************************
   * GETTER DEGLI OBSERVABLE
   */
  public get updateArchivioFieldEvent(): Observable<ArchivioFieldUpdating> {
    return this._updateArchivioField.asObservable();
  }

  public get deletedArchiveEvent(): Observable<number> {
    return this._deletedArchive.asObservable();
  }

  /******************************************************************
   * SETTER DEGLI OBSERVABLE
   */
  public updateArchivioFieldSelection(updateArchivioField: ArchivioFieldUpdating) {
    this._updateArchivioField.next(updateArchivioField);
  }

  public deletedArchiveSelection(idArchivioDeleted: number) {
    this._deletedArchive.next(idArchivioDeleted);
  }
}

export interface ArchivioFieldUpdating {
  field: string,
  archivio: Archivio
}
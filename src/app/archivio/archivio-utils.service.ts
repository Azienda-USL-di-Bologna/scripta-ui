import { Injectable } from "@angular/core";
import { Archivio } from "@bds/internauta-model";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ArchivioUtilsService {
  private _updateArchivioField = new Subject<ArchivioFieldUpdating>();
  private _deletedArchive = new Subject<number>();
  private _updatedArchive = new Subject<Archivio>();

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

  public get updatedArchiveEvent(): Observable<Archivio> {
    return this._updatedArchive.asObservable();
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

  public updatedArchiveSelection(updateArchivio: Archivio) {
    this._updatedArchive.next(updateArchivio);
  }
}

export interface ArchivioFieldUpdating {
  field: string,
  archivio: Archivio
}
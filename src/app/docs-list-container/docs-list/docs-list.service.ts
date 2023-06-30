import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Injectable({
    providedIn: "root"
  })
  export class DocListService {
    private _refreshDocs: Subject<boolean> = new Subject<boolean>();
    constructor(private _http: HttpClient) {
    }

    public get refreshDocs$(): Observable<boolean> {
        return this._refreshDocs.asObservable();
    }

    /**
     * chiamando questa funzione viene ricaricato l'elenco documenti
     */
    public refreshDocs() {
        this._refreshDocs.next(true);
    }
}
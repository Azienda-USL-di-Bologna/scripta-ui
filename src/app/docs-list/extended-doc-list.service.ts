import { DatePipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DocListService } from "@bds/ng-internauta-model";


@Injectable({
  providedIn: "root"
})
export class ExtendedDocListService extends DocListService {

  constructor(protected _http: HttpClient, protected _datepipe: DatePipe) {
    super(_http, _datepipe);
  }

}

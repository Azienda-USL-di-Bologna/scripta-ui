import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {RelatedService} from "@bds/ng-internauta-model";
import {DatePipe} from "@angular/common";


@Injectable()
export class ExtendedDestinatariService extends RelatedService {

  constructor(protected _http: HttpClient, protected _datepipe: DatePipe) {
    super(_http, _datepipe);
  }
}

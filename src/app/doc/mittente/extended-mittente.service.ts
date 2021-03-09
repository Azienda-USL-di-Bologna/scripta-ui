import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {RelatedService} from "@bds/ng-internauta-model";
import {DatePipe} from "@angular/common";


@Injectable()
export class ExtendedMittenteService extends RelatedService {

  constructor(protected _http: HttpClient, protected _datepipe: DatePipe) {
    super(_http, _datepipe);
  }

  getSuggeretionMittente() {
    return this.http.get<any>("assets/countries.json")
                .toPromise()
                .then(resMit => <any[]>resMit.data)
                .then(dataMit => dataMit);
  }

  getSuggeretionTipo() {
    return this.http.get<any>("assets/tipo.json")
        .toPromise()
        .then(resTipo => <any[]>resTipo.data)
        .then(dataTipo => dataTipo);
  }

  getSuggeretionMezzo() {
    return this.http.get<any>("assets/mezzo.json")
        .toPromise()
        .then(resMezzo => <any[]>resMezzo.data)
        .then(dataMezzo => dataMezzo);
  }
}

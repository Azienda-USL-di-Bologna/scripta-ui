import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";


@Injectable()
export class MittenteService {

  constructor(private http: HttpClient) { }

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

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseUrlType, CUSTOM_SERVER_METHODS, getInternautaUrl } from '@bds/internauta-model';

@Component({
  selector: 'app-lotti-list',
  templateUrl: './lotti-list.component.html',
  styleUrls: ['./lotti-list.component.scss']
})
export class LottiListComponent implements OnInit {

  public idEsterno: string = "";
  
  public dialogDisplay: boolean = false;
  listaLotti: LottiList[] = [{cig: "first", oggetto: "Oggetto", cf_struttura_proponente: 1, denominazione_struttura: "demo"}];

  public cols: any[] = [
    { field: "cig", header: "CIG", tooltip: "" },
    { field: "oggetto", header: "Oggetto", tooltip: "" },
    { field: "cf_struttura_proponente", header: "CF STRUTTURA PROPONENTE", tooltip: "" },
    { field: "denominazione_struttura", header: "DENOMINAZIONE STRUTTURA", tooltip: "" },
    ];


  constructor(
    protected _http: HttpClient,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const queryParams = this.route.snapshot.queryParamMap;
    this.idEsterno = queryParams.get('guid');

  }

  onRowEditInit() {
    this.dialogDisplay = true;
  }

  deleteRow(rowData: any): void {
    const index = this.listaLotti.indexOf(rowData);
    if (index !== -1) {
      this.listaLotti.splice(index, 1);
    }
  }
  
  aggiungiLotto(): void {
    this.dialogDisplay = true;
    this.listaLotti.push({cig: "second", oggetto: "Oggetto", cf_struttura_proponente: 1, denominazione_struttura: "demo"});
  }

  public cancelDialog() {
    this.dialogDisplay = false;
  }

  public chiudiLottoList(): void {
    const apiUrl = getInternautaUrl(BaseUrlType.Lotti) + "/refreshLotti" + "?guid=" + this.idEsterno ;
    this._http.get(apiUrl).subscribe(
      res => {
        window.close();
      }
    );
  }
}

export class LottiList {
  public cig: string;
  public oggetto: string;
  public cf_struttura_proponente: number;
  public denominazione_struttura: string;
  }
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-lotti-list',
  templateUrl: './lotti-list.component.html',
  styleUrls: ['./lotti-list.component.scss']
})
export class LottiListComponent implements OnInit {
  
  public dialogDisplay: boolean = false;
  listaLotti: LottiList[] = [{cig: "first", oggetto: "Oggetto", cf_struttura_proponente: 1, denominazione_struttura: "demo"}];

  public cols: any[] = [
    { field: "cig", header: "CIG", tooltip: "" },
    { field: "oggetto", header: "Oggetto", tooltip: "" },
    { field: "cf_struttura_proponente", header: "CF STRUTTURA PROPONENTE", tooltip: "" },
    { field: "denominazione_struttura", header: "DENOMINAZIONE STRUTTURA", tooltip: "" },
    ];


  constructor() { }

  ngOnInit(): void {
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
}

export class LottiList {
  public cig: string;
  public oggetto: string;
  public cf_struttura_proponente: number;
  public denominazione_struttura: string;
  }
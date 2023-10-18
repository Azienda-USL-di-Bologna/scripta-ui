import { Component, OnInit, Output } from '@angular/core';

interface Tipologia {
  name: string
}
interface Contraente {
  name: string
}

@Component({
  selector: 'app-lotti-detail',
  templateUrl: './lotti-detail.component.html',
  styleUrls: ['./lotti-detail.component.scss']
})

export class LottiDetailComponent implements OnInit {
  public display: boolean;
  public tipologia: Tipologia[];
  public selectTipologia: Tipologia;
  public contraente: Contraente[];
  public selectContraente: Contraente;
  public oggetto: string;
  public dataIniziale: Date;
  public dataCompletamento: Date;

  constructor() { 
    this.tipologia = [
      {name: "Aggiudicata"},
      {name: "In corso"},
      {name: "Annullata"},
      {name: "Sospesa"},
      {name: "Deserta"}
    ];

    this.contraente = [
      {name: "test"},
      {name: "test"},
      {name: "test"},
      {name: "test"},
      {name: "test"}
    ];
  }

  ngOnInit(): void {
    this.oggetto = 'Oggetto compilata dal loggetto della deti e deli';
  }
}


import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Doc } from '@bds/internauta-model';

@Component({
  selector: 'dati-pubblicazione',
  templateUrl: './dati-pubblicazione.component.html',
  styleUrls: ['./dati-pubblicazione.component.scss']
})
export class DatiPubblicazioneComponent implements OnInit {

  @Input() set doc(value: Doc) {
    this._doc = value;
  }
  get doc(): Doc {
    return this._doc;
  } 

  private _doc: Doc;
  public hasPubblicazioni: boolean;  
  public datiPubblicazione: any;

  public numeroAnnoPubblicazione: string;
  public data_esecutivita: string;
  public fine_pubblicazione: string;
  public inizio_pubblicazione: Date;
  public controllo_regionale: boolean;
  public periodoPubblicazione: string;
  constructor(    protected datepipe: DatePipe
    ) {
    
   }

  ngOnInit(): void {
    console.log(this.doc.additionalData);
    if(this.doc.additionalData['dati_pubblicazione'] != null) {
      this.hasPubblicazioni = false;
      this.datiPubblicazione = this.doc.additionalData['dati_pubblicazione'];
      this.data_esecutivita = this.datepipe.transform(this.datiPubblicazione['data_esecutivita'].toString(), 'dd/MM/yyyy');
      this.inizio_pubblicazione = this.datiPubblicazione['inizio_pubblicazione'].toString();
      this.fine_pubblicazione = this.datiPubblicazione['fine_pubblicazione'].toString();
      this.numeroAnnoPubblicazione = "n° "+  this.datiPubblicazione['numero'].toString() + " anno " + this.datiPubblicazione['anno'].toString();
      this.periodoPubblicazione = "da " + this.datepipe.transform(this.inizio_pubblicazione, 'dd/MM/yyyy') + " a " + this.datepipe.transform(this.fine_pubblicazione, 'dd/MM/yyyy') 
      this.controllo_regionale =  this.doc.additionalData['controllo_regionale'];
    }
    
  }

}

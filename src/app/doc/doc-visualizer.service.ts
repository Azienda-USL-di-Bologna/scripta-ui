import { Injectable } from '@angular/core';
import { Doc, DocDetailView, RegistroDoc, TipologiaDoc, VisibilitaDoc } from '@bds/internauta-model';
import { ExtendedDocDetailView } from '../docs-list-container/docs-list/extended-doc-detail-view';

@Injectable({
  providedIn: 'root'
})
export class DocVisualizerService {
  //blocco 0 funzionalita peis
  private _numera: boolean = false;
  private _editing: boolean = false;
  
  //blocco 1 di intestazione
  private _oggetto: boolean = true;
  private _datiDoc: boolean = true;
  private _dataRegistrazione = false;
  private _numeroProposta = false;
  private _numeroRegistrazione = false;
  private _datePubbicazione: boolean = false;
  private _note: boolean = true;
  private _dataProtEsterno = false;
  private _protocolloEsterno = false;
  private _dataInvioConservazine = false;
  private _dataAnnullamento = false;
  private _noteAnnullamento = false;
  private _propostoDa = false;
  private _creatoDa = false;
  private _adottatoDa = false;

  //blocco 2 di attori 
  private _attori: boolean = false;
  private _mittenti: boolean = false;
  private _firmatari: boolean = false;
  private _pareratori: boolean = false;
  private _vistatori: boolean = false;
  private _redattore: boolean = false;

  //blocco 3 di destinatari 
  private _destinatari: boolean = false;

  //blocco 4 di dati di archivio 
  private _pubblicazioni: boolean = false;
  public get pubblicazioni(): boolean {
    return this._pubblicazioni;
  }
  public set pubblicazioni(value: boolean) {
    this._pubblicazioni = value;
  }
  private _datiDiArchivio: boolean = false;
  private _collegamentoPrecedente: boolean = false;
  private _fascicolo: boolean = false;
  private _codiceTitolo: boolean = false;
  private _allegatiPeis: boolean = true;
  private _allegatiPreg: boolean = true;
  
  
  //blocco 5 particolarita del doc
  private _riservato: boolean = false;
  private _visibilitaLimitata: boolean = false;
  private _annullato: boolean = false;
  private _normale: boolean = false;
  private _docsCollegati: boolean = false;
  
  

  constructor(private doc: Doc) {
    //blocco 0 
    this.numera = (this.doc.tipologia === TipologiaDoc.DETERMINA ||
                   this.doc.tipologia === TipologiaDoc.DELIBERA ||
                   this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA ||
                   this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA) && !this.doc.pregresso;
    this.editing = (this.doc.tipologia === TipologiaDoc.DETERMINA ||
                    this.doc.tipologia === TipologiaDoc.DELIBERA ||
                    this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA ||
                    this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA) && !this.doc.pregresso;
    
    //blocco 1
    this.dataRegistrazione = this.doc.tipologia === TipologiaDoc.DETERMINA ||
                             this.doc.tipologia === TipologiaDoc.DELIBERA ||
                             this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA ||
                             this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA || this.doc.pregresso;
    this.numeroProposta = (this.doc.tipologia === TipologiaDoc.DETERMINA ||
                           this.doc.tipologia === TipologiaDoc.DELIBERA ||
                           this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA ||
                           this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA) && !this.doc.pregresso;
    this.numeroRegistrazione = this.doc.tipologia === TipologiaDoc.DETERMINA ||
                                this.doc.tipologia === TipologiaDoc.DELIBERA ||
                                this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA ||
                                this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA || this.doc.pregresso;
    this.datePubbicazione = this.doc.tipologia === TipologiaDoc.DETERMINA ||
                            this.doc.tipologia === TipologiaDoc.DELIBERA ||
                            this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA ||
                            this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA && this.doc.pregresso;
    this.note = (this.doc.tipologia === TipologiaDoc.DETERMINA ||
                this.doc.tipologia === TipologiaDoc.DELIBERA ||
                this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA ||
                this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA) && this.doc.pregresso;

    this.propostoDa = this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA;
    this.adottatoDa = this.doc.tipologia === TipologiaDoc.DETERMINA ;

    this.dataProtEsterno = (this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA || 
                            this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA) && this.doc.pregresso;
    this.protocolloEsterno = (this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA ||
                              this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA) && this.doc.pregresso;
    this.dataInvioConservazine = (this.doc.tipologia === TipologiaDoc.DETERMINA ||
                                 this.doc.tipologia === TipologiaDoc.DELIBERA ||
                                 this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA ||
                                 this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA) && this.doc.pregresso;
    this.dataAnnullamento = (this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA || 
                             this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA) && this.doc.pregresso;
    this.noteAnnullamento = (this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA || 
                             this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA) && this.doc.pregresso;
    //blocco2
    this.attori = this.doc.tipologia === TipologiaDoc.DETERMINA ||
                  this.doc.tipologia === TipologiaDoc.DELIBERA ||
                  this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA;
    this.mittenti = this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA;
    this.firmatari = this.doc.tipologia === TipologiaDoc.DELIBERA || this.doc.tipologia === TipologiaDoc.DETERMINA;
    this.pareratori = this.doc.tipologia === TipologiaDoc.DELIBERA || this.doc.tipologia === TipologiaDoc.DETERMINA;
    this.vistatori = this.doc.tipologia === TipologiaDoc.DELIBERA || this.doc.tipologia === TipologiaDoc.DETERMINA;
    this.redattore = this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA;
    this.adottatoDa = this.doc.tipologia === TipologiaDoc.DETERMINA;
    this.creatoDa = this.doc.tipologia === TipologiaDoc.DETERMINA ||
                    this.doc.tipologia === TipologiaDoc.DELIBERA ||
                    this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA ||
                    this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA
    this.allegatiPeis = (this.doc.tipologia === TipologiaDoc.DETERMINA ||
                    this.doc.tipologia === TipologiaDoc.DELIBERA ||
                    this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA ||
                    this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA) && !doc.pregresso;
    this.allegatiPreg = (this.doc.tipologia === TipologiaDoc.DETERMINA ||
                    this.doc.tipologia === TipologiaDoc.DELIBERA ||
                    this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA ||
                    this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA) && doc.pregresso;
    //blocco 3 
    this.destinatari = this.doc.tipologia === TipologiaDoc.DETERMINA ||
                       this.doc.tipologia === TipologiaDoc.DELIBERA ||
                       this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA ||
                       this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA;
    //blocco 4 
    this.pubblicazioni = this.doc.tipologia !== TipologiaDoc.PROTOCOLLO_IN_ENTRATA && this.doc.additionalData && this.doc.additionalData['dati_pubblicazione']
    this.datiDiArchivio = this.doc.tipologia === TipologiaDoc.DETERMINA ||
                          this.doc.tipologia === TipologiaDoc.DELIBERA ||
                          this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA ||
                          this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA;

    this.collegamentoPrecedente = this.doc.tipologia === TipologiaDoc.DETERMINA ||
                                  this.doc.tipologia === TipologiaDoc.DELIBERA ||
                                  this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA ||
                                  this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA;

    this.fascicolo = this.doc.tipologia === TipologiaDoc.DETERMINA ||
                     this.doc.tipologia === TipologiaDoc.DELIBERA ||
                     this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA ||
                     this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA;

    this.codiceTitolo = this.doc.tipologia === TipologiaDoc.DETERMINA ||
                        this.doc.tipologia === TipologiaDoc.DELIBERA ||
                        this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_USCITA ||
                        this.doc.tipologia === TipologiaDoc.PROTOCOLLO_IN_ENTRATA;

   //blocco 5
   this.normale = this.doc.visibilita === VisibilitaDoc.NORMALE;
   this.riservato = this.doc.visibilita === VisibilitaDoc.RISERVATO;
   this.visibilitaLimitata = this.doc.visibilita === VisibilitaDoc.LIMITATA;
   this.annullato = this.doc.annullato;
   this.docsCollegati = this.doc.docsCollegati.length > 0;
                       
  }
  public get editing(): boolean {
    return this._editing;
  }
  public set editing(value: boolean) {
    this._editing = value;
  }
  public get numera(): boolean {
    return this._numera;
  }
  public set numera(value: boolean) {
    this._numera = value;
  }
  public get oggetto(): boolean {
    return this._oggetto;
  }
  public set oggetto(value: boolean) {
    this._oggetto = value;
  }
  public get dataRegistrazione() {
    return this._dataRegistrazione;
  }
  public get creatoDa() {
    return this._creatoDa;
  }
  public set creatoDa(value) {
    this._creatoDa = value;
  }
  public get numeroProposta() {
    return this._numeroProposta;
  }
  public set numeroProposta(value) {
    this._numeroProposta = value;
  }
  public set dataRegistrazione(value) {
    this._dataRegistrazione = value;
  }
  public get numeroRegistrazione() {
    return this._numeroRegistrazione;
  }
  public set numeroRegistrazione(value) {
    this._numeroRegistrazione = value;
  }
  public get datePubbicazione(): boolean {
    return this._datePubbicazione;
  }
  public set datePubbicazione(value: boolean) {
    this._datePubbicazione = value;
  }
  public get note(): boolean {
    return this._note;
  }
  public set note(value: boolean) {
    this._note = value;
  }
  public get dataProtEsterno() {
    return this._dataProtEsterno;
  }
  public set dataProtEsterno(value) {
    this._dataProtEsterno = value;
  }
  public get protocolloEsterno() {
    return this._protocolloEsterno;
  }
  public set protocolloEsterno(value) {
    this._protocolloEsterno = value;
  }
  public get dataInvioConservazine() {
    return this._dataInvioConservazine;
  }
  public set dataInvioConservazine(value) {
    this._dataInvioConservazine = value;
  }
  public get dataAnnullamento() {
    return this._dataAnnullamento;
  }
  public set dataAnnullamento(value) {
    this._dataAnnullamento = value;
  }
  public get noteAnnullamento() {
    return this._noteAnnullamento;
  }
  public set noteAnnullamento(value) {
    this._noteAnnullamento = value;
  }
  public get propostoDa() {
    return this._propostoDa;
  }
  public set propostoDa(value) {
    this._propostoDa = value;
  }
  public get attori(): boolean {
    return this._attori;
  }
  public set attori(value: boolean) {
    this._attori = value;
  }
  public get mittenti(): boolean {
    return this._mittenti;
  }
  public set mittenti(value: boolean) {
    this._mittenti = value;
  }
  public get firmatari(): boolean {
    return this._firmatari;
  }
  public set firmatari(value: boolean) {
    this._firmatari = value;
  }
  public get pareratori(): boolean {
    return this._pareratori;
  }
  public set pareratori(value: boolean) {
    this._pareratori = value;
  }
  public get vistatori(): boolean {
    return this._vistatori;
  }
  public set vistatori(value: boolean) {
    this._vistatori = value;
  }
  public get adottatoDa(): boolean {
    return this._adottatoDa;
  }
  public set adottatoDa(value: boolean) {
    this._adottatoDa = value;
  }
  public get redattore(): boolean {
    return this._redattore;
  }
  public set redattore(value: boolean) {
    this._redattore = value;
  }
  public get destinatari(): boolean {
    return this._destinatari;
  }
  public set destinatari(value: boolean) {
    this._destinatari = value;
  }
  public get datiDiArchivio(): boolean {
    return this._datiDiArchivio;
  }
  public set datiDiArchivio(value: boolean) {
    this._datiDiArchivio = value;
  }
  public get collegamentoPrecedente(): boolean {
    return this._collegamentoPrecedente;
  }
  public set collegamentoPrecedente(value: boolean) {
    this._collegamentoPrecedente = value;
  }
  public get fascicolo(): boolean {
    return this._fascicolo;
  }
  public set fascicolo(value: boolean) {
    this._fascicolo = value;
  }
  public get codiceTitolo(): boolean {
    return this._codiceTitolo;
  }
  public set codiceTitolo(value: boolean) {
    this._codiceTitolo = value;
  }
  public get allegatiPeis(): boolean {
    return this._allegatiPeis;
  }
  public set allegatiPeis(value: boolean) {
    this._allegatiPeis = value;
  }
  public get allegatiPreg(): boolean {
    return this._allegatiPreg;
  }
  public set allegatiPreg(value: boolean) {
    this._allegatiPreg = value;
  }
  public get riservato(): boolean {
    return this._riservato;
  }
  public set riservato(value: boolean) {
    this._riservato = value;
  }
  public get visibilitaLimitata(): boolean {
    return this._visibilitaLimitata;
  }
  public set visibilitaLimitata(value: boolean) {
    this._visibilitaLimitata = value;
  }
  public get annullato(): boolean {
    return this._annullato;
  }
  public set annullato(value: boolean) {
    this._annullato = value;
  }
  public get normale(): boolean {
    return this._normale;
  }
  public set normale(value: boolean) {
    this._normale = value;
  }
  public get datiDoc(): boolean {
    return this._datiDoc;
  }
  public set datiDoc(value: boolean) {
    this._datiDoc = value;
  }
  public get docsCollegati(): boolean {
    return this._docsCollegati;
  }
  public set docsCollegati(value: boolean) {
    this._docsCollegati = value;
  }
}

import { DocList, Fascicolazione, TipologiaDoc } from "@bds/ng-internauta-model";

export class ExtendedDocList extends DocList {
  private _tipologiaVisualizzazione: string;
  private _registrazioneVisualizzazione: string;
  private _propostaVisualizzazione: string;
  private _statoVisualizzazione: string;
  private _codiceRegistro: string;
  private _fascicolazioniVisualizzazione: string[];

  constructor() {super();}

  public get tipologiaVisualizzazione(): string {
    return this._tipologiaVisualizzazione;
  }

  public set tipologiaVisualizzazione(tipologiaVisualizzazione: string) {
    this._tipologiaVisualizzazione = tipologiaVisualizzazione;
  }

  public get registrazioneVisualizzazione(): string {
    return this._registrazioneVisualizzazione;
  }

  public set registrazioneVisualizzazione(registrazioneVisualizzazione: string) {
    const pad: string = "0000000";
    this._registrazioneVisualizzazione = 
      this.codiceRegistro + 
      pad.substring(0, pad.length - this.numeroRegistrazione.toString().length) + this.numeroRegistrazione + 
      "/" + 
      this.annoRegistrazione;
  }

  public get propostaVisualizzazione(): string {
    return this._propostaVisualizzazione;
  }

  public set propostaVisualizzazione(propostaVisualizzazione: string) {
    this._propostaVisualizzazione = this.annoProposta + "-" + this.numeroProposta;
  }

  public get statoVisualizzazione(): string {
    return this._statoVisualizzazione;
  }

  public set statoVisualizzazione(statoVisualizzazione: string) {
    this._statoVisualizzazione = statoVisualizzazione.charAt(0) + statoVisualizzazione.substring(1).toLowerCase();;
  }

  public get codiceRegistro(): string {
    return this._codiceRegistro;
  }

  public set codiceRegistro(codiceRegistro: string) {
    this._codiceRegistro = codiceRegistro;
  }

  public get tipologiaVisualizzazioneAndCodiceRegistro() {
    return new ExtendedDocList();
}

  public set tipologiaVisualizzazioneAndCodiceRegistro(doc: ExtendedDocList) {
    switch (doc.tipologia) {
      case TipologiaDoc.PROTOCOLLO_IN_USCITA:
        this.tipologiaVisualizzazione = "Protocollo in uscita";
        this.codiceRegistro = "PG";
        break;
      case TipologiaDoc.PROTOCOLLO_IN_ENTRATA:
        this.tipologiaVisualizzazione = "Protocollo in uscita";
        this.codiceRegistro = "PG";
        break;
      case TipologiaDoc.DETERMINA:
        this.tipologiaVisualizzazione = "Determina";
        this.codiceRegistro = "DELI";
        break;
      case TipologiaDoc.DELIBERA:
        this.tipologiaVisualizzazione = "Delibera";
        this.codiceRegistro = "DETE";
        break;
      default:
        this.tipologiaVisualizzazione = "Errore";
        this.codiceRegistro = "Err";
    }
  }

  public get fascicolazioniVisualizzazione(): string[] {
    return this._fascicolazioniVisualizzazione;
  }

  public set fascicolazioniVisualizzazione(notUsedButNecessary: string[]) {
    this._fascicolazioniVisualizzazione = [];
    this.fascicolazioni.forEach(f => {
      this._fascicolazioniVisualizzazione.push("[" + f.numerazione + "] " + f.nome);
    });
  }
}
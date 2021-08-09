import { DocList, Fascicolazione, TipologiaDoc } from "@bds/ng-internauta-model";
import { StatoDocTraduzioneVisualizzazione } from "./docs-list-constants";

export class ExtendedDocList extends DocList {
  private _oggettoVisualizzazione: string;
  private _tipologiaVisualizzazione: string;
  private _registrazioneVisualizzazione: string;
  private _propostaVisualizzazione: string;
  private _statoVisualizzazione: string;
  private _codiceRegistro: string;
  private _fascicolazioniVisualizzazione: string[];

  constructor() {super();}

  public get oggettoVisualizzazione(): string {
    return this._oggettoVisualizzazione;
  }

  public set oggettoVisualizzazione(oggettoVisualizzazione: string) {
    if (this.annullato) {
      if (oggettoVisualizzazione && oggettoVisualizzazione != "") {
        this._oggettoVisualizzazione = "ANNULLATO - " + oggettoVisualizzazione;
      } else {
        this._oggettoVisualizzazione = "ANNULLATO";
      }
    } else {
      this._oggettoVisualizzazione = oggettoVisualizzazione;
    }
  }

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
    if (this.numeroRegistrazione) {
      const pad: string = "0000000";
      this._registrazioneVisualizzazione = 
        this.codiceRegistro + 
        pad.substring(0, pad.length - this.numeroRegistrazione.toString().length) + this.numeroRegistrazione + 
        "/" + 
        this.annoRegistrazione;
    }
    
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
    if (statoVisualizzazione) {
      this._statoVisualizzazione = StatoDocTraduzioneVisualizzazione.find(e => e.value === statoVisualizzazione).nome;
    }
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
        this.tipologiaVisualizzazione = "Protocollo in entrata";
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
    if (this.fascicolazioni) {
      this.fascicolazioni.forEach(f => {
        this._fascicolazioniVisualizzazione.push("[" + f.numerazione + "] " + f.nome);
      });
    }
  }
}
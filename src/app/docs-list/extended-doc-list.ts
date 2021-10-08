import { DocList, Fascicolazione, Persona, TipologiaDoc } from "@bds/ng-internauta-model";
import { StatoDocTraduzioneVisualizzazione, StatoUfficioAttiTraduzioneVisualizzazione } from "./docs-list-constants";

export class ExtendedDocList extends DocList {
  private _oggettoVisualizzazione: string;
  private _tipologiaVisualizzazione: string;
  private _registrazioneVisualizzazione: string;
  private _propostaVisualizzazione: string;
  private _statoVisualizzazione: string;
  private _statoUfficioAttiVisualizzazione: string;
  private _codiceRegistro: string;
  private _fascicolazioniVisualizzazione: string[];
  private _destinatariVisualizzazione: string[];
  private _firmatariVisualizzazione: string[];
  private _sullaScrivaniaDiVisualizzazione: string[];
  private _idPersonaResponsabileProcedimentoVisualizzazione: string;
  private _idPersonaRedattriceVisualizzazione: string;
  private _eliminabile: boolean;

  constructor() {super();}

  public get oggettoVisualizzazione(): string {
    return this._oggettoVisualizzazione;
  }

  public set oggettoVisualizzazione(oggettoVisualizzazione: string) {
    this._oggettoVisualizzazione = "";
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
    this._registrazioneVisualizzazione = "";
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
    this._propostaVisualizzazione = "";
    if (this.numeroProposta) {
      this._propostaVisualizzazione = this.annoProposta + "-" + this.numeroProposta;
    }
  }

  public get statoVisualizzazione(): string {
    return this._statoVisualizzazione;
  }

  public set statoVisualizzazione(statoVisualizzazione: string) {
    this._statoVisualizzazione = "";
    if (statoVisualizzazione) {
      this._statoVisualizzazione = StatoDocTraduzioneVisualizzazione.find(e => e.value === statoVisualizzazione).nome;
    }
  }

  public get statoUfficioAttiVisualizzazione(): string {
    return this._statoUfficioAttiVisualizzazione;
  }

  public set statoUfficioAttiVisualizzazione(statoUfficioAttiVisualizzazione: string) {
    this._statoUfficioAttiVisualizzazione = "";
    if (statoUfficioAttiVisualizzazione) {
      this._statoUfficioAttiVisualizzazione = StatoUfficioAttiTraduzioneVisualizzazione.find(e => e.value === statoUfficioAttiVisualizzazione).nome;
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
        this.codiceRegistro = "DETE";
        break;
      case TipologiaDoc.DELIBERA:
        this.tipologiaVisualizzazione = "Delibera";
        this.codiceRegistro = "DELI";
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

  public get destinatariVisualizzazione(): string[] {
    return this._destinatariVisualizzazione;
  }

  public set destinatariVisualizzazione(notUsedButNecessary: string[]) {
    this._destinatariVisualizzazione = [];
    if (this.destinatari) {
      this.destinatari.forEach(f => {
        this._destinatariVisualizzazione.push(f.nome);
      });
    }
  }

  public get firmatariVisualizzazione(): string[] {
    return this._firmatariVisualizzazione;
  }

  public set firmatariVisualizzazione(notUsedButNecessary: string[]) {
    this._firmatariVisualizzazione = [];
    if (this.firmatari) {
      this.firmatari.forEach(f => {
        this._firmatariVisualizzazione.push(f.descrizione);
      });
    }
  }

  public get sullaScrivaniaDiVisualizzazione(): string[] {
    return this._sullaScrivaniaDiVisualizzazione;
  }

  public set sullaScrivaniaDiVisualizzazione(notUsedButNecessary: string[]) {
    this._sullaScrivaniaDiVisualizzazione = [];
    if (this.sullaScrivaniaDi) {
      this.sullaScrivaniaDi.forEach(f => {
        this._sullaScrivaniaDiVisualizzazione.push(f.descrizione);
      });
    }
  }

  public get idPersonaResponsabileProcedimentoVisualizzazione(): string {
    return this._idPersonaResponsabileProcedimentoVisualizzazione;
  }

  public set idPersonaResponsabileProcedimentoVisualizzazione(idPersonaResponsabileProcedimentoVisualizzazione: string) {
    this._idPersonaResponsabileProcedimentoVisualizzazione = "";
    if (this.idPersonaResponsabileProcedimento) {
      this._idPersonaResponsabileProcedimentoVisualizzazione = this.calcDescrizioneVisualizzazionePerPersona(this.idPersonaResponsabileProcedimento);
    }
  }

  public get idPersonaRedattriceVisualizzazione(): string {
    return this._idPersonaRedattriceVisualizzazione;
  }

  public set idPersonaRedattriceVisualizzazione(idPersonaRedattriceVisualizzazione: string) {
    this._idPersonaRedattriceVisualizzazione = "";
    if (this.idPersonaRedattrice) {
      this._idPersonaRedattriceVisualizzazione = this.calcDescrizioneVisualizzazionePerPersona(this.idPersonaRedattrice);
    }
  }

  public get eliminabile(): boolean {
    return this._eliminabile;
  }

  public set eliminabile(eliminabile: boolean) {
    if(this.numeroRegistrazione){
      this._eliminabile = false;
    }else{
      this._eliminabile = true;
    }
  }


  private calcDescrizioneVisualizzazionePerPersona(persona: Persona): string {
    return persona.descrizione + (persona.idSecondario ? " (" + persona.idSecondario + ")" : "");
  }
}
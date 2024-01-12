import { DecimaleAnomaliaArchivioDetail } from "@bds/internauta-model";
import { ArchivioDetailView, Persona, TipoArchivio } from "@bds/internauta-model";
import { StatoArchivioTraduzioneVisualizzazione, TipoArchivioTraduzioneVisualizzazione } from "./archivi-list-constants";

export class ExtendedArchiviView extends ArchivioDetailView {
  private _tipoVisualizzazione: string;
  private _statoVisualizzazione: string;
  private _vicariVisualizzazione: string[];
  private _idPersonaResponsabileVisualizzazione: string;
  private _idPersonaCreazioneVisualizzazione: string;
  // private riservato: boolean;
  private _idTitoloVisualizzazione: string;
  private _idMassimarioVisualizzazione: string;
  private _anomalieVisualizzazione: string;

  constructor() { super(); }

  public get tipoVisualizzazione(): string {
    return this._tipoVisualizzazione;
  }

  public set tipoVisualizzazione(tipoVisualizzazione: string) {
    this._tipoVisualizzazione = "";
    if (tipoVisualizzazione) {
      if(TipoArchivioTraduzioneVisualizzazione.find(e => e.value === tipoVisualizzazione))
        this._tipoVisualizzazione = TipoArchivioTraduzioneVisualizzazione.find(e => e.value === tipoVisualizzazione).nome;
    }

  }

  public get statoVisualizzazione(): string {
    return this._statoVisualizzazione;
  }

  public set statoVisualizzazione(statoVisualizzazione: string) {
    this._statoVisualizzazione = "";
    if (statoVisualizzazione) {
      this._statoVisualizzazione = StatoArchivioTraduzioneVisualizzazione.find(e => e.value === statoVisualizzazione).nome;
    }
  }

  public get vicariVisualizzazione(): string[] {
    return this._vicariVisualizzazione;
  }

  public set vicariVisualizzazione(vicariVisualizzazione: string[]) {
    this._vicariVisualizzazione = [];
    if (this.descrizionePersonaVicarioList) {
      this.descrizionePersonaVicarioList.forEach(v => {
        this._vicariVisualizzazione.push(v);
      })
    }
  }

  public get idPersonaResponsabileVisualizzazione(): string {
    return this._idPersonaResponsabileVisualizzazione;
  }

  public set idPersonaResponsabileVisualizzazione(idPersonaResponsabileVisualizzazione: string) {
    this._idPersonaResponsabileVisualizzazione;
    if (this.idPersonaResponsabile) {
      this._idPersonaResponsabileVisualizzazione = this.calcDescrizioneVisualizzazionePerPersona(this.idPersonaResponsabile);
    }
  }

  public get idPersonaCreazioneVisualizzazione(): string {
    return this._idPersonaCreazioneVisualizzazione;
  }

  public set idPersonaCreazioneVisualizzazione(idPersonaCreazioneVisualizzazione: string) {
    this._idPersonaCreazioneVisualizzazione;
    if (this.idPersonaCreazione) {
      this._idPersonaCreazioneVisualizzazione = this.calcDescrizioneVisualizzazionePerPersona(this.idPersonaCreazione);
    }
  }

  private calcDescrizioneVisualizzazionePerPersona(persona: Persona): string {
    return persona.descrizione + (persona.idSecondario ? " (" + persona.idSecondario + ")" : "");
  }

  public get idTitoloVisualizzazione(): string {
    return this._idTitoloVisualizzazione;
  }

  public set idTitoloVisualizzazione(idTitoloVisualizzazione: string) {
    this._idTitoloVisualizzazione = "";
    if (this.idTitolo) {
      this._idTitoloVisualizzazione = `[${this.idTitolo.classificazione}] ${this.idTitolo.nome}`;
    }
  }

  public get idMassimarioVisualizzazione(): string {
    return this._idMassimarioVisualizzazione;
  }

  public set idMassimarioVisualizzazione(idMassimarioVisualizzazione: string) {
    this._idMassimarioVisualizzazione = "";
    if (this.idMassimario) {
      this._idMassimarioVisualizzazione = `${this.idMassimario.nome}`;
    }
  }

  public get anomalieVisualizzazione(): string {
    return this._anomalieVisualizzazione;
  }

  public set anomalieVisualizzazione(anomalieVisualizzazione: string) {
    this._anomalieVisualizzazione = "";
    if (this.bitAnomalie) {
      if (this.bitAnomalie & DecimaleAnomaliaArchivioDetail.RESPONSABILE_DISATTIVO) {
        this._anomalieVisualizzazione += "Responsabile disattivo. ";
      }
      if (this.bitAnomalie & DecimaleAnomaliaArchivioDetail.VICARI_ATTIVI_NON_PRESENTI) {
        this._anomalieVisualizzazione += "Vicari attivi non presenti. ";
      }
      if (this.bitAnomalie & DecimaleAnomaliaArchivioDetail.INCOERENZA_STRUTTURA) {
        this._anomalieVisualizzazione += "Incoerenza struttura. ";
      }
      if (this.bitAnomalie & DecimaleAnomaliaArchivioDetail.CHIUSI_INVISIBILI) {
        this._anomalieVisualizzazione += "Chiuso senza accesso. ";
      }
    }
  }
}

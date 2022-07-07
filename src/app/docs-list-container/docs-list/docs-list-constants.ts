import { StatoDoc, StatoUfficioAtti, TipologiaDoc } from "@bds/ng-internauta-model";
import { ColonnaBds } from "@bds/primeng-plugin";
import { FILTER_TYPES, NextSDRDateTypes } from "@nfa/next-sdr";
import { Utils } from "src/app/utilities/utils";
import { ExtendedDocDetailView } from "./extended-doc-detail-view";


export const cols: ColonnaBds[] = [
  /* {
    field: "eliminabile",
    header: "",
    filterField: "eliminabile",
    style: {},
    headerClass: ["header-column", "eliminabile-column"],
    filterClass: ["filter-column", "eliminabile-column"],
    bodyClass: ["eliminabile-column"],
    fieldType: "boolean",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: false,
    default: true
  }, */
  {
    field: "idAzienda",
    header: "Ente",
    filterField: "idAzienda.id",
    // sortField: "idAzienda.nome",
    style: {},
    headerClass: ["header-column", "ente-column"],
    filterClass: ["filter-column", "ente-column"],
    bodyClass: ["ente-column"],
    fieldType: "object",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: true
  },
  {
    field: "tipologia",
    header: "Tipologia",
    filterField: "tipologia",
    // sortField: "tipologia",
    style: {},
    headerClass: ["header-column", "tipologia-column"],
    filterClass: ["filter-column", "tipologia-column"],
    bodyClass: ["tipologia-column"],
    fieldType: "string",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: true
  },
  {
    field: "registrazione",
    header: "N° registrazione",
    filterField: "numeroRegistrazione",
    // sortField: ["annoRegistrazione", "numeroRegistrazione"],
    style: {},
    headerClass: ["header-column", "registrazione-column"],
    filterClass: ["filter-column", "registrazione-column"],
    bodyClass: ["registrazione-column"],
    fieldType: "number",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: true
  },
  {
    field: "proposta",
    header: "Proposta",
    filterField: "numeroProposta",
    // sortField: ["annoProposta", "numeroProposta"],
    style: {},
    headerClass: ["header-column", "proposta-column"],
    filterClass: ["filter-column", "proposta-column"],
    bodyClass: ["proposta-column"],
    fieldType: "",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: true
  },
  {
    field: "dataCreazione",
    header: "Creazione",
    filterField: "dataCreazione",
    sortField: "dataCreazione",
    style: {},
    headerClass: ["header-column", "data-creazione-column"],
    filterClass: ["filter-column", "data-creazione-column"],
    bodyClass: ["data-creazione-column"],
    fieldType: NextSDRDateTypes.ZonedDateTime,
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: true
  },
  {
    field: "dataRegistrazione",
    header: "Registrazione",
    filterField: "dataRegistrazione",
    sortField: "dataRegistrazione",
    style: {},
    headerClass: ["header-column", "data-registrazione-column"],
    filterClass: ["filter-column", "data-registrazione-column"],
    bodyClass: ["data-registrazione-column"],
    fieldType: NextSDRDateTypes.ZonedDateTime,
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: true
  },
  {
    field: "dataPubblicazione",
    header: "Pubblicazione",
    filterField: "dataPubblicazione",
    // sortField: "dataPubblicazione",
    style: {},
    headerClass: ["header-column", "data-pubblicazione-column"],
    filterClass: ["filter-column", "data-pubblicazione-column"],
    bodyClass: ["data-pubblicazione-column"],
    fieldType: NextSDRDateTypes.ZonedDateTime,
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: false
  },
  {
    field: "oggetto",
    header: "Oggetto",
    filterField: "oggettoTscol",
    // sortField: "oggetto",
    autoSortingField: "rankingOggetto",
    style: {},
    headerClass: ["header-column", "oggetto-column"],
    filterClass: ["filter-column", "oggetto-column"],
    bodyClass: ["scrollable-column", "oggetto-column"],
    fieldType: "string",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: true
  },
  {
    field: "stato",
    header: "Stato",
    filterField: "stato",
    // sortField: "stato",
    style: {},
    headerClass: ["header-column", "stato-column"],
    filterClass: ["filter-column", "stato-column"],
    bodyClass: ["stato-column"],
    fieldType: "object",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: true
  },
  {
    field: "fascicolazioni",
    header: "Fascicolazioni",
    filterField: "fascicolazioniTscol",
    // sortField: "rankingFascicolazioni",
    autoSortingField: "rankingFascicolazioni",
    style: {},
    headerClass: ["header-column", "fascicolazioni-column"],
    filterClass: ["filter-column", "fascicolazioni-column"],
    bodyClass: ["scrollable-column", "fascicolazioni-column"],
    fieldType: "",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: true
  },
  {
    field: "statoUfficioAtti",
    header: "Stato ufficio atti",
    filterField: "statoUfficioAtti",
    // sortField: "statoUfficioAtti",
    style: {},
    headerClass: ["header-column", "stato-ufficio-atti-column"],
    filterClass: ["filter-column", "stato-ufficio-atti-column"],
    bodyClass: ["stato-ufficio-atti-column"],
    fieldType: "string",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: false
  },
  {
    field: "idPersonaResponsabileProcedimento",
    header: "Responsabile",
    filterField: "idPersonaResponsabileProcedimento.id",
    // sortField: "idPersonaResponsabileProcedimento.descrizione",
    style: {},
    headerClass: ["header-column", "responsabile-column"],
    filterClass: ["filter-column", "responsabile-column"],
    bodyClass: ["responsabile-column"],
    fieldType: "object",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: false
  },
  {
    field: "idPersonaRedattrice",
    header: "Redattore",
    filterField: "idPersonaRedattrice.id",
    // sortField: "idPersonaRedattrice.descrizione",
    style: {},
    headerClass: ["header-column", "redattore-column"],
    filterClass: ["filter-column", "redattore-column"],
    bodyClass: ["redattore-column"],
    fieldType: "object",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: false
  },
  {
    field: "idStrutturaRegistrazione",
    header: "Adottato da",
    filterField: "idStrutturaRegistrazione.id",
    // sortField: "idStrutturaRegistrazione.nome",
    style: {},
    headerClass: ["header-column", "adottato-da-column"],
    filterClass: ["filter-column", "adottato-da-column"],
    bodyClass: ["scrollable-column", "adottato-da-column"],
    fieldType: "object",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: false
  },
  {
    field: "mittente",
    header: "Mittente",
    filterField: "mittenteTscol",
    // sortField: "mittente",
    autoSortingField: "rankingMittente",
    style: {},
    headerClass: ["header-column", "mittente-column"],
    filterClass: ["filter-column", "mittente-column"],
    bodyClass: ["scrollable-column", "mittente-column"],
    fieldType: "string",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: false
  },
  {
    field: "destinatari",
    header: "Destinatari",
    filterField: "destinatariTscol",
    // sortField: "destinatari",
    autoSortingField: "rankingDestinatari",
    style: {},
    headerClass: ["header-column", "destinatari-column"],
    filterClass: ["filter-column", "destinatari-column"],
    bodyClass: ["scrollable-column", "destinatari-column"],
    fieldType: "string",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: false
  },
  {
    field: "firmatari",
    header: "Firmatari",
    filterField: "firmatari",
    // sortField: "",
    style: {},
    headerClass: ["header-column", "firmatari-column"],
    filterClass: ["filter-column", "firmatari-column"],
    bodyClass: ["scrollable-column", "firmatari-column"],
    fieldType: "object",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: false
  },
  {
    field: "sullaScrivaniaDi",
    header: "Sulla scrivania di",
    filterField: "sullaScrivaniaDi",
    // sortField: "sullaScrivaniaDi.descrizione",
    style: {},
    headerClass: ["header-column", "sulla-scrivania-di-column"],
    filterClass: ["filter-column", "sulla-scrivania-di-column"],
    bodyClass: ["scrollable-column", "sulla-scrivania-di-column"],
    fieldType: "object",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: false
  },
  {
    field: "protocolloEsterno",
    header: "Protocollo esterno",
    filterField: "protocolloEsterno",
    // sortField: "sullaScrivaniaDi.descrizione",
    style: {},
    headerClass: ["header-column", "protocollo-esterno-column"],
    filterClass: ["filter-column", "protocollo-esterno-column"],
    bodyClass: ["protocollo-esterno-column"],
    fieldType: "string",
    filterMatchMode: FILTER_TYPES.string.containsIgnoreCase,
    useFilterMatchMode: true,
    default: false
  },
  {
    field: "conservazione",
    header: "In conservazione",
    filterField: "conservazione",
    // sortField: "sullaScrivaniaDi.descrizione",
    style: {},
    headerClass: ["header-column", "conservazione-column"],
    filterClass: ["filter-column", "conservazione-column"],
    bodyClass: ["conservazione-column"],
    fieldType: "boolean",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: false
  }
];
// SPOSTATA IN PRIMENG PLUGIN
// export interface ColonnaBds {
//   field: string;
//   header: string;
//   filterField: string;
//   sortField?: string | string[];
//   autoSortingField?: string;
//   style: any;
//   headerClass: string[];
//   filterClass: string[];
//   bodyClass: string[];
//   fieldType: any;
//   filterMatchMode: string;
//   useFilterMatchMode: boolean;
//   default: boolean;
//   additionalData?: any;
//   selectionDisabled?: boolean;
// }

export const TipologiaDocTraduzioneVisualizzazione = [
  { value: TipologiaDoc.PROTOCOLLO_IN_USCITA, nome: "Protocollo in uscita" },
  { value: TipologiaDoc.PROTOCOLLO_IN_ENTRATA, nome: "Protocollo in entrata" },
  { value: TipologiaDoc.DETERMINA, nome: "Determina" },
  { value: TipologiaDoc.DELIBERA, nome: "Delibera" },
  { value: TipologiaDoc.DOCUMENT_PEC, nome: "Pec" },
  { value: TipologiaDoc.DOCUMENT_REGISTRO, nome: "Registro giornaliero" },
  { value: TipologiaDoc.DOCUMENT_UTENTE, nome: "Document" }
]

export const StatoDocTraduzioneVisualizzazione = [
  { value: StatoDoc.CLASSIFICAZIONE, nome: "Classificazione" },
  { value: StatoDoc.DA, nome: "DA" },
  { value: StatoDoc.DG, nome: "DG" },
  { value: StatoDoc.DS, nome: "DS" },
  { value: StatoDoc.DSC, nome: "DSC" },
  { value: StatoDoc.FINE, nome: "Fine" },
  { value: StatoDoc.FIRMA, nome: "Firma" },
  { value: StatoDoc.PARERE, nome: "Parere" },
  { value: StatoDoc.REDAZIONE, nome: "Redazione" },
  { value: StatoDoc.SMISTAMENTO, nome: "Smistamento" },
  { value: StatoDoc.SPEDIZIONE, nome: "Spedizione" },
  { value: StatoDoc.UFFICIO_ATTI, nome: "Ufficio atti" },
  { value: StatoDoc.VISTA, nome: "Vista" },
  { value: StatoDoc.NUMERAZIONE, nome: "Numerazione" },
  { value: StatoDoc.REGISTRAZIONE_PROTOCOLLO, nome: "Registrazione protocollo" },
  { value: StatoDoc.AVVIA_SPEDIZIONI, nome: "Avvia spedizioni" },
  { value: StatoDoc.ASPETTA_SPEDIZIONI, nome: "Aspetto spedizioni" },
  { value: StatoDoc.ATTENDI_JOBS, nome: "Attendi jobs" },
  { value: StatoDoc.CONTROLLO_SEGRETERIA, nome: "Controllo segreteria" },
  { value: StatoDoc.SPEDIZIONE_MANUALE, nome: "Spedizione manuale" },
  { value: StatoDoc.APPROVAZIONE, nome: "Approvazione" },
  { value: StatoDoc.ANNULLATO, nome: "Annullato" },
]

export const StatoDocDetailPerFiltro = [
  {
    value: [
      StatoDoc.CLASSIFICAZIONE,
      StatoDoc.CONTROLLO_SEGRETERIA
    ], nome: "Classificazione"
  },
  {
    value: [
      StatoDoc.DA,
      StatoDoc.DG,
      StatoDoc.DS,
      StatoDoc.DSC
    ], nome: "Direttori"
  },
  {
    value: [
      StatoDoc.FIRMA,
      StatoDoc.APPROVAZIONE
    ], nome: "Firma"
  },
  { value: [StatoDoc.PARERE], nome: "Parere"},
  { value: [StatoDoc.REDAZIONE], nome: "Redazione"},
  {
    value: [
      StatoDoc.SMISTAMENTO,
      StatoDoc.SPEDIZIONE_MANUALE,
      StatoDoc.SPEDIZIONE,
      StatoDoc.FINE,
      StatoDoc.NUMERAZIONE,
      StatoDoc.REGISTRAZIONE_PROTOCOLLO,
      StatoDoc.AVVIA_SPEDIZIONI,
      StatoDoc.ASPETTA_SPEDIZIONI
    ], nome: "Registrati"
  },
  { value: [StatoDoc.UFFICIO_ATTI], nome: "Ufficio atti"},
  { value: [StatoDoc.VISTA], nome: "Vista"},
  { value: [StatoDoc.ANNULLATO], nome: "Annullato"}
]

export const StatoUfficioAttiTraduzioneVisualizzazione = [
  { value: StatoUfficioAtti.DA_VALUTARE, nome: "Da valutare"},
  { value: StatoUfficioAtti.ELABORATA, nome: "Elaborata"},
  { value: StatoUfficioAtti.SOSPESA, nome: "Sospesa"},
  { value: StatoUfficioAtti.NON_RILEVANTE, nome: "Non rilevante"},
]

export enum DocsListMode {
  NUOVO = "NUOVO",
  MIEI_DOCUMENTI = "MIEI_DOCUMENTI",
  DOCUMENTI_VISIBILI = "DOCUMENTI_VISIBILI",
  IFIRMARIO = "IFIRMARIO",
  IFIRMATO = "IFIRMATO",
  REGISTRAZIONI = "REGISTRAZIONI"
}

export const colsCSV: any[] = [
  {
    field: "idAzienda.nome",
    header: "Ente",
    fieldType: "object",
    fieldId: "idAzienda"
  },
  {
    field: "tipologiaVisualizzazione",
    header: "Tipologia",
    fieldType: "string",
    fieldId: "tipologia"
  },
  {
    field: "registrazioneVisualizzazione",
    header: "N° Registrazione",
    fieldType: "string",
    fieldId: "registrazione"
  },
  {
    field: "propostaVisualizzazione",
    header: "Proposta",
    fieldType: "string",
    fieldId: "proposta"
  },
  {
    field: (doc: ExtendedDocDetailView) => {
      return doc.dataCreazione ? Utils.dateFormatter(doc.dataCreazione) : "";
    },
    header: "Creazione",
    fieldType: "date",
    fieldId: "dataCreazione"
  },
  {
    field: (doc: ExtendedDocDetailView) => {
      return doc.dataRegistrazione ? Utils.dateFormatter(doc.dataRegistrazione) : "";
    },
    header: "Registrazione",
    fieldType: "date",
    fieldId: "dataRegistrazione"
  },
  {
    field: (doc: ExtendedDocDetailView) => {
      return doc.dataPubblicazione ? Utils.dateFormatter(doc.dataPubblicazione) : "";
    },
    header: "Pubblicazione",
    fieldType: "date",
    fieldId: "dataPubblicazione"
  },
  {
    field: "oggettoVisualizzazione",
    header: "Oggetto",
    fieldType: "string",
    fieldId: "oggetto"
  },
  {
    field: "statoVisualizzazione",
    header: "Stato",
    fieldType: "string",
    fieldId: "stato"
  },
  {
    field: (doc: ExtendedDocDetailView) => {
      let fascicolazioniString = "";
      if (doc.fascicolazioni) {
        doc.fascicolazioni.forEach(fascicolazione => {
          fascicolazioniString += "[" + fascicolazione.numerazione + "] " + fascicolazione.nome + ", ";
        });
      }
      return fascicolazioniString !== "" ? fascicolazioniString.substr(0, fascicolazioniString.length - 2) : "";
    },
    header: "Fascicolazioni",
    fieldType: "date",
    fieldId: "fascicolazioni"
  },
  {
    field: "statoUfficioAttiVisualizzazione",
    header: "Stato ufficio atti",
    fieldType: "string",
    fieldId: "statoUfficioAtti"
  },
  {
    field: "idPersonaResponsabileProcedimentoVisualizzazione",
    header: "Responsabile",
    fieldType: "date",
    fieldId: "idPersonaResponsabileProcedimento"
  },
  {
    field: "idPersonaRedattriceVisualizzazione",
    header: "Redattore",
    fieldType: "date",
    fieldId: "idPersonaRedattrice"
  },
  {
    field: "idStrutturaRegistrazione.nome",
    header: "Adottato da",
    fieldType: "object",
    fieldId: "idStrutturaRegistrazione"
  },
  {
    field: "mittente",
    header: "Mittente",
    fieldType: "string",
    fieldId: "mittente"
  },
  {
    field: (doc: ExtendedDocDetailView) => {
      let destinatariString = "";
      if (doc.destinatari) {
        doc.destinatari.forEach(destinatario => {
          destinatariString += destinatario.nome + ", ";
        });
      }
      return destinatariString !== "" ? destinatariString.substr(0, destinatariString.length - 2) : "";
    },
    header: "Destinatari",
    fieldType: "object",
    fieldId: "destinatari"
  },
  {
    field: (doc: ExtendedDocDetailView) => {
      let firmatariString = "";
      if (doc.firmatari) {
        doc.firmatari.forEach(firmatario => {
          firmatariString += firmatario.descrizione + ", ";
        });
      }
      return firmatariString !== "" ? firmatariString.substr(0, firmatariString.length - 2) : "";
    },
    header: "Firmatari",
    fieldType: "object",
    fieldId: "firmatari"
  },
  {
    field: (doc: ExtendedDocDetailView) => {
      let sullaScrivaniaDiString = "";
      if (doc.sullaScrivaniaDi) {
        doc.sullaScrivaniaDi.forEach(usante => {
          sullaScrivaniaDiString += usante.descrizione + ", ";
        });
      }
      return sullaScrivaniaDiString !== "" ? sullaScrivaniaDiString.substr(0, sullaScrivaniaDiString.length - 2) : "";
    },
    header: "Sulla scrivania di",
    fieldType: "object",
    fieldId: "sullaScrivaniaDi"
  },
  {
    field: "protocolloEsterno",
    header: "Protocollo esterno",
    fieldType: "string",
    fieldId: "protocolloEsterno"
  },
  {
    field: "conservazione",
    header: "In conservazione",
    fieldType: "boolean",
    fieldId: "conservazione"
  }
]

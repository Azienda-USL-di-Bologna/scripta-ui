import { StatoDoc, TipologiaDoc } from "@bds/ng-internauta-model";
import { FILTER_TYPES, NextSDRDateTypes } from "@nfa/next-sdr";

export const cols: ColonnaBds[] = [
  {
    field: "idAzienda.nome", 
    header: "Ente", 
    filterField: "idAzienda.id", 
    sortField: "idAzienda.nome", 
    style: {},
    headerClass: ["header-column","ente-column"],
    filterClass: ["filter-column","ente-column"],
    bodyClass: ["ente-column"],
    fieldType: "object",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true
  },
  {
    field: "tipologia", 
    header: "Tipologia", 
    filterField: "tipologia", 
    sortField: "tipologia", 
    style: {},
    headerClass: ["header-column","tipologia-column"],
    filterClass: ["filter-column","tipologia-column"],
    bodyClass: ["tipologia-column"],
    fieldType: "string",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true
  },
  {
    field: "registrazione", 
    header: "Registrazione", 
    filterField: "numeroRegistrazione", 
    sortField: ["annoRegistrazione","numeroRegistrazione"], 
    style: {},
    headerClass: ["header-column","registrazione-column"],
    filterClass: ["filter-column","registrazione-column"],
    bodyClass: ["registrazione-column"],
    fieldType: "number",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true
  },
  {
    field: "proposta", 
    header: "Proposta", 
    filterField: "numeroProposta", 
    sortField: ["annoProposta","numeroProposta"],
    style: {},
    headerClass: ["header-column","proposta-column"],
    filterClass: ["filter-column","proposta-column"],
    bodyClass: ["proposta-column"],
    fieldType: "",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true
  },
  {
    field: "dataCreazione", 
    header: "Data creazione", 
    filterField: "dataCreazione", 
    sortField: "dataCreazione", 
    style: {},
    headerClass: ["header-column","data-creazione-column"],
    filterClass: ["filter-column","data-creazione-column"],
    bodyClass: ["data-creazione-column"],
    fieldType: NextSDRDateTypes.ZonedDateTime,
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true
  },
  {
    field: "dataRegistrazione", 
    header: "Data registrazione", 
    filterField: "dataRegistrazione", 
    sortField: "dataRegistrazione", 
    style: {},
    headerClass: ["header-column","data-registrazione-column"],
    filterClass: ["filter-column","data-registrazione-column"],
    bodyClass: ["data-registrazione-column"],
    fieldType: NextSDRDateTypes.ZonedDateTime,
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true
  },
  {
    field: "oggetto", 
    header: "Oggetto", 
    filterField: "oggettoTscol", 
    sortField: "rankingOggetto", 
    autoSorting: true,
    style: {},
    headerClass: ["header-column", "oggetto-column"],
    filterClass: ["filter-column", "oggetto-column"],
    bodyClass: ["scrollable-column", "oggetto-column"],
    fieldType: "string",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true
  },
  {
    field: "stato", 
    header: "Stato", 
    filterField: "stato", 
    sortField: "stato", 
    style: {},
    headerClass: ["header-column", "stato-column"],
    filterClass: ["filter-column", "stato-column"],
    bodyClass: ["stato-column"],
    fieldType: "string",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true
  },
  {
    field: "fascicolazioni", 
    header: "Fascicolazioni", 
    filterField: "fascicolazioniTscol", 
    sortField: "rankingFascicolazioni", 
    autoSorting: true,
    style: {},
    headerClass: ["header-column", "fascicolazioni-column"],
    filterClass: ["filter-column", "fascicolazioni-column"],
    bodyClass: ["scrollable-column", "fascicolazioni-column"],
    fieldType: "",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true
  }
];

export interface ColonnaBds {
  field: string;
  header: string;
  filterField: string;
  sortField: any;
  autoSorting?: boolean;
  style: any,
  headerClass: string[];
  filterClass: string[];
  bodyClass: string[];
  fieldType: any;
  filterMatchMode: string;
  useFilterMatchMode: boolean;
}

export const TipologiaDocTraduzioneVisualizzazione = [
  { value: TipologiaDoc.PROTOCOLLO_IN_USCITA, nome: "Protocollo in uscita"},
  { value: TipologiaDoc.PROTOCOLLO_IN_ENTRATA, nome: "Protocollo in entrata"},
  { value: TipologiaDoc.DETERMINA, nome: "Determina"},
  { value: TipologiaDoc.DELIBERA, nome: "Delibera"}
]

export const StatoDocTraduzioneVisualizzazione = [
  { value: StatoDoc.CLASSIFICAZIONE, nome: "Classificazione"},
  { value: StatoDoc.DA, nome: "DA"},
  { value: StatoDoc.DG, nome: "DG"},
  { value: StatoDoc.DS, nome: "DS"},
  { value: StatoDoc.DSC, nome: "DSC"},
  { value: StatoDoc.FINE, nome: "Fine"},
  { value: StatoDoc.FIRMA, nome: "Firma"},
  { value: StatoDoc.PARERE, nome: "Parere"},
  { value: StatoDoc.REDAZIONE, nome: "Redazione"},
  { value: StatoDoc.SMISTAMENTO, nome: "Smistamento"},
  { value: StatoDoc.SPEDIZIONE, nome: "Spedizione"},
  { value: StatoDoc.UFFICIO_ATTI, nome: "Ufficio atti"},
  { value: StatoDoc.VISTA, nome: "Vista"},
  { value: StatoDoc.NUMERAZIONE, nome: "Numerazione"},
  { value: StatoDoc.REGISTRAZIONE_PROTOCOLLO, nome: "Registrazione protocollo"},
  { value: StatoDoc.AVVIA_SPEDIZIONI, nome: "Avvia spedizioni"},
  { value: StatoDoc.ASPETTA_SPEDIZIONI, nome: "Aspetto spedizioni"},
  { value: StatoDoc.ATTENDI_JOBS, nome: "Attendi jobs"},
  { value: StatoDoc.CONTROLLO_SEGRETERIA, nome: "Controllo segreteria"},
  { value: StatoDoc.SPEDIZIONE_MANUALE, nome: "Spedizione manuale"},
]

export enum DocsListMode {
  NUOVO = "NUOVO",
  ELENCO_DOCUMENTI = "ELENCO_DOCUMENTI",
  IFIRMARIO = "IFIRMARIO",
  IFIRMATO = "IFIRMATO",
  REGISTRAZIONI = "REGISTRAZIONI"
}
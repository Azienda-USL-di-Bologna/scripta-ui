import { StatoArchivio, TipoArchivio } from "@bds/ng-internauta-model";
import { ColonnaBds } from "@bds/primeng-plugin";
import { FILTER_TYPES, NextSDRDateTypes } from "@nfa/next-sdr";

export enum ArchiviListMode {
    NUOVO = "NUOVO",
    RECENTI = "RECENTI",
    VISIBILI = "VISIBILI",
    FREQUENTI = "FREQUENTI",
    PREFERITI = "PREFERITI"
}


export const cols: ColonnaBds[] = [
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
    field: "tipo",
    header: "Tipo",
    filterField: "tipo",
    // sortField: "tipologia",
    style: {},
    headerClass: ["header-column", "tipo-column"],
    filterClass: ["filter-column", "tipo-column"],
    bodyClass: ["tipo-column"],
    fieldType: "string",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: false
  },
  {
    field: "numerazioneGerarchica",
    header: "Numerazione Gerarchica",
    filterField: "numerazioneGerarchica",
    style: {},
    headerClass: ["header-column", "numerazione-gerarchica-column"],
    filterClass: ["filter-column", "numerazione-gerarchica-column"],
    bodyClass: ["numerazione-gerarchica-column"],
    fieldType: "string",
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
    field: "idPersonaResponsabile",
    header: "Responsabile",
    filterField: "idPersonaResponsabile",
    sortField: "idPersonaResponsabile",
    style: {},
    headerClass: ["header-column", "responsabile-column"],
    filterClass: ["filter-column", "responsabile-column"],
    bodyClass: ["responsabile-column"],
    fieldType: "",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: true
  },
  {
    field: "idPersonaCreazione",
    header: "Creatore",
    filterField: "idPersonaCreazione",
    // sortField: "dataPubblicazione",
    style: {},
    headerClass: ["header-column", "creatore-column"],
    filterClass: ["filter-column", "creatore-column"],
    bodyClass: ["creatore-column"],
    fieldType: "",
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
    field: "idStruttura",
    header: "Struttura",
    filterField: "idStruttura.id",
    style: {},
    headerClass: ["header-column", "struttura-column"],
    filterClass: ["filter-column", "struttura-column"],
    bodyClass: ["scrollable-column", "struttura-column"],
    fieldType: "object",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: true
  },
  {
    field: "vicari",
    header: "Vicari",
    filterField: "vicari",
    style: {},
    headerClass: ["header-column", "vicari-column"],
    filterClass: ["filter-column", "vicari-column"],
    bodyClass: ["scrollable-column", "vicari-column"],
    fieldType: "string",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: true
  }
];

export const TipoArchivioTraduzioneVisualizzazione = [
  { value: TipoArchivio.PROCEDIMENTO, nome: "Procedimento"},
  { value: TipoArchivio.SPECIALE, nome: "Speciale"},
  { value: TipoArchivio.ATTIVITA, nome: "Attività"},
  { value: TipoArchivio.AFFARE, nome: "Affare"}
];


export const StatoArchivioTraduzioneVisualizzazione = [
  { value: StatoArchivio.BOZZA, nome: "Bozza"},
  { value: StatoArchivio.PRECHIUSO, nome: "Prechiuso"},
  { value: StatoArchivio.APERTO, nome: "Aperto"},
  { value: StatoArchivio.CHIUSO, nome: "Chiuso"}
];
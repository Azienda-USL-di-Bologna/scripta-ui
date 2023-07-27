import { ColonnaBds } from "@bds/common-tools";
import { StatoArchivio, TipoArchivio } from "@bds/internauta-model";
import { FILTER_TYPES, NextSDRDateTypes } from "@bds/next-sdr";
import { Utils } from "../../utilities/utils";
import { ExtendedArchiviView } from "./extendend-archivi-view";

export enum ArchiviListMode {
  NUOVO = "NUOVO",
  RECENTI = "RECENTI",
  VISIBILI = "VISIBILI",
  FREQUENTI = "FREQUENTI",
  PREFERITI = "PREFERITI",
  TUTTI = "TUTTI"
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
    filterMatchMode: FILTER_TYPES.string.startsWith,
    useFilterMatchMode: false,
    default: true
  },
  {
    field: "dataCreazione",
    header: "Anno creazione",
    filterField: "dataCreazione",
    sortField: "dataCreazione",
    style: {},
    headerClass: ["header-column", "data-creazione-column", "sort-column"],
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
    // sortField: "idPersonaResponsabile",
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
    sortField: "oggetto",
    autoSortingField: "rankingOggetto",
    style: {},
    headerClass: ["header-column", "oggetto-column", "sort-column"],
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
    field: "idVicari",
    header: "Vicari",
    filterField: "idVicari",
    style: {},
    headerClass: ["header-column", "vicari-column"],
    filterClass: ["filter-column", "vicari-column"],
    bodyClass: ["scrollable-column", "vicari-column"],
    fieldType: "string",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: true,
    default: true
  },
  /* {
    field: "eliminazione",
    header: "",
    filterField: "",
    style: {},
    headerClass: ["header-column", "eliminazione-column"],
    filterClass: ["filter-column", "eliminazione-column"],
    bodyClass: ["scrollable-column", "eliminazione-column"],
    fieldType: "string",
    filterMatchMode: FILTER_TYPES.not_string.equals,
    useFilterMatchMode: false,
    default: false
  } */
];

export const TipoArchivioTraduzioneVisualizzazione = [
  { value: TipoArchivio.PROCEDIMENTO, nome: "Procedimento" },
  { value: TipoArchivio.ATTIVITA, nome: "Attività" },
  { value: TipoArchivio.AFFARE, nome: "Affare" },
  { value: TipoArchivio.SOGGETTO_FISICO, nome: "Soggetto fisico" },
  { value: TipoArchivio.SOGGETTO_GIURIDICO, nome: "Soggetto giuridico" },
  { value: TipoArchivio.SPECIALE, nome: "Speciale" }
];


export const StatoArchivioTraduzioneVisualizzazione = [
  { value: StatoArchivio.PRECHIUSO, nome: "Prechiuso" },
  { value: StatoArchivio.APERTO, nome: "Aperto" },
  { value: StatoArchivio.CHIUSO, nome: "Chiuso" },
  { value: StatoArchivio.BOZZA, nome: "Bozza" },
];

export const colsCSV: any[] = [
  {
    field: "idAzienda.nome",
    header: "Ente",
    fieldType: "object",
    fieldId: "idAzienda"
  },
  {
    field: "tipoVisualizzazione",
    header: "Tipo",
    fieldType: "string",
    fieldId: "tipo"
  },
  {
    field: "numerazioneGerarchica",
    header: "Numerazione Gerarchica",
    fieldType: "string",
    fieldId: "numerazioneGerarchica"
  },
  {
    field: (arch: ExtendedArchiviView) => {
      return arch.dataCreazione ? Utils.dateFormatter(arch.dataCreazione) : "";
    },
    header: "Creazione",
    fieldType: "date",
    fieldId: "dataCreazione"
  },
  {
    field: "oggetto",
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
    field: "idPersonaResponsabileVisualizzazione",
    header: "Responsabile",
    fieldType: "date",
    fieldId: "idPersonaResponsabile"
  },
  {
    field: "idPersonaCreazioneVisualizzazione",
    header: "Redattore",
    fieldType: "date",
    fieldId: "idPersonaCreazione"
  },
  {
    field: "idStruttura.nome",
    header: "Struttura",
    fieldType: "object",
    fieldId: "idStruttura"
  },
  {
    field: (arch: ExtendedArchiviView) => {
      let vicariString = "";
      if (arch.descrizionePersonaVicarioList) {
        arch.descrizionePersonaVicarioList.forEach(vicario => {
          vicariString += vicario + ", ";
        });
      }
      return vicariString !== "" ? vicariString.substr(0, vicariString.length - 2) : "";
    },
    header: "Vicari",
    fieldType: "object",
    fieldId: "idVicari"
  }
]
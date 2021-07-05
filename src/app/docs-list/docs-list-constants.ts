import { FILTER_TYPES } from "@nfa/next-sdr";

export const cols = [
  {
    field: "idAzienda.nome", 
    header: "Ente", 
    filterField: "idAzienda.id", 
    sortField: "idAzienda.nome", 
    style: {},
    headerClass: [""],
    filterClass: [""],
    bodyClass: [""],
    fieldType: "object",
    filterMatchMode: FILTER_TYPES.not_string.equals,
  },
  {
    field: "tipologia", 
    header: "Tipologia", 
    filterField: "", 
    sortField: "", 
    style: {},
    headerClass: [""],
    filterClass: [""],
    bodyClass: [""],
    fieldType: "",
    filterMatchMode: null,
  },
  {
    field: "registrazione", 
    header: "Registrazione", 
    filterField: "", 
    sortField: "", 
    style: {},
    headerClass: [""],
    filterClass: [""],
    bodyClass: [""],
    fieldType: "",
    filterMatchMode: null,
  },
  {
    field: "proposta", 
    header: "Proposta", 
    filterField: "", 
    sortField: "", 
    style: {},
    headerClass: [""],
    filterClass: [""],
    bodyClass: [""],
    fieldType: "",
    filterMatchMode: null,
  },
  {
    field: "dataCreazione", 
    header: "Data creazione", 
    filterField: "", 
    sortField: "", 
    style: {},
    headerClass: [""],
    filterClass: [""],
    bodyClass: [""],
    fieldType: "",
    filterMatchMode: null,
  },
  {
    field: "dataRegistrazione", 
    header: "Data registrazione", 
    filterField: "", 
    sortField: "", 
    style: {},
    headerClass: [""],
    filterClass: [""],
    bodyClass: [""],
    fieldType: "",
    filterMatchMode: null,
  },
  {
    field: "oggetto", 
    header: "Oggetto", 
    filterField: "", 
    sortField: "", 
    style: {},
    headerClass: [""],
    filterClass: [""],
    bodyClass: [""],
    fieldType: "",
    filterMatchMode: null,
  },
  {
    field: "stato", 
    header: "Stato", 
    filterField: "", 
    sortField: "", 
    style: {},
    headerClass: [""],
    filterClass: [""],
    bodyClass: [""],
    fieldType: "",
    filterMatchMode: null,
  },
  {
    field: "fascicolazioni", 
    header: "Fascicolazioni", 
    filterField: "", 
    sortField: null, 
    style: {},
    headerClass: [""],
    filterClass: [""],
    bodyClass: ["scrollable-column"],
    fieldType: "",
    filterMatchMode: null,
  }
];
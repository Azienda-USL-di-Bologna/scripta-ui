import {
  DocDetailView,
  PersonaVedenteService,
  UrlsGenerationStrategy,
  Utente,
} from "@bds/internauta-model";
import { ExtendedDocDetailView } from "../docs-list-container/docs-list/extended-doc-detail-view";
import { FILTER_TYPES, FilterDefinition, FiltersAndSorts } from "@bds/next-sdr";
import { JwtLoginService, UtenteUtilities } from "@bds/jwt-login";
import { MessageService } from "primeng/api";
import { NavigationTabsService } from "../navigation-tabs/navigation-tabs.service";
import { AppService } from "../app.service";

export class Utils {
  constructor() {}
  public static dateFormatter(date: Date) {
    return (
      date.getDate().toString().padStart(2, "0") +
      "/" +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      "/" +
      date.getFullYear()
    );
  }
}

export interface ImpostazioniDocList {
  mieiDocumenti: boolean;
  selectedColumn: string[];
  lastIdAziendaLogin: number;
}

export interface ImpostazioniArchiviList {
  selectedColumn: string[];
  lastIdAziendaLogin: number;
}
export interface Impostazioni {
  "scripta.docList"?: ImpostazioniDocList;
  "scripta.archiviList": ImpostazioniArchiviList;
}

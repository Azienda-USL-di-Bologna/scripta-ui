import { Injectable } from '@angular/core';
import { Doc, DocDetailView, PersonaVedenteService, TipologiaDoc, UrlsGenerationStrategy, Utente } from '@bds/internauta-model';
import { ExtendedDocDetailView } from '../docs-list-container/docs-list/extended-doc-detail-view';
import { FILTER_TYPES, FilterDefinition, FiltersAndSorts } from '@bds/next-sdr';
import { MessageService } from 'primeng/api';
import { NavigationTabsService } from '../navigation-tabs/navigation-tabs.service';
import { JwtLoginService } from '@bds/jwt-login';
import { AppService } from '../app.service';


/**
 * questa classi si prefigge l'obbiettivo di raggruppare tutte le funzioni che servono al documento
 * e che vengono chiamate in 2 o piu posti.
 */
@Injectable({
  providedIn: 'root'
})
export class DocUtilsService {

  constructor(
    private messageService: MessageService,
    private personaVedenteService: PersonaVedenteService,
    private loginService: JwtLoginService,
    private navigationTabsService: NavigationTabsService,
    private appService: AppService,
  ) { }


  public isDocApribile(doc: DocDetailView | Doc): boolean {
    return doc.tipologia != TipologiaDoc.DOCUMENT_PEC &&
      doc.tipologia != TipologiaDoc.DOCUMENT_REGISTRO &&
      doc.tipologia != TipologiaDoc.DOCUMENT_UTENTE;
  }
  /**
   * L'utente ha cliccato per aprire un documento.
   * Gestisco l'evento
   * @param doc
   */
  public openDoc(doc: DocDetailView, utente: Utente) {
    if (doc.pregresso) {
      this.openPregresso(doc as ExtendedDocDetailView);
    } else {
      const filtersAndSorts = new FiltersAndSorts();
      filtersAndSorts.addFilter(new FilterDefinition("idPersona.id", FILTER_TYPES.not_string.equals, utente.idPersona.id));
      filtersAndSorts.addFilter(new FilterDefinition("idDocDetail.id", FILTER_TYPES.not_string.equals, doc.id));
      this.personaVedenteService.getData("PersonaVedenteWithPlainFields", filtersAndSorts, null)
        .subscribe(res => {
          if (res && res.results) {
            if (res.results.length > 0) {
              const encodeParams = doc.idApplicazione.urlGenerationStrategy === UrlsGenerationStrategy.TRUSTED_URL_WITH_CONTEXT_INFORMATION ||
                doc.idApplicazione.urlGenerationStrategy === UrlsGenerationStrategy.TRUSTED_URL_WITHOUT_CONTEXT_INFORMATION;
              const addRichiestaParam = true;
              const addPassToken = true;
              this.loginService.buildInterAppUrl(doc.urlComplete, encodeParams, addRichiestaParam, addPassToken, true).subscribe((url: string) => {
              });
            } else {
              this.messageService.add({
                severity: "info",
                summary: "Attenzione",
                key: "docsListToast",
                detail: `Apertura del documento non consentita`
              });
            }
          }
        });
    }
  }

  private openPregresso(doc: ExtendedDocDetailView) {
    this.navigationTabsService.addTabDoc(doc);
    this.appService.appNameSelection(`${doc.codiceRegistro === 'PG' ? "Protocollo generale" : doc.tipologiaVisualizzazione} pregresso ${doc.registrazioneVisualizzazione} [${doc.idAzienda.aoo}]`);
  }
}

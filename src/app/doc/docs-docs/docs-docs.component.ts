import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocDocService } from '@bds/internauta-model';
import { ENTITIES_STRUCTURE } from '@bds/internauta-model';
import { Doc } from '@bds/internauta-model';
import { DocDetail } from '@bds/internauta-model';
import { DocDetailView } from '@bds/internauta-model';
import { DocDetailViewService } from '@bds/internauta-model';
import { Azienda } from '@bds/internauta-model';
import { TipoCollegamentoDoc } from '@bds/internauta-model';
import { Persona } from '@bds/internauta-model';
import { DocDetailService } from '@bds/internauta-model';
import { DocDoc } from '@bds/internauta-model';
import { JwtLoginService, UtenteUtilities } from '@bds/jwt-login';
import { AdditionalDataDefinition, FilterDefinition, FiltersAndSorts, FILTER_TYPES, SortDefinition, SORT_MODES } from '@bds/next-sdr';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { ExtendedDocDetailView } from 'src/app/docs-list-container/docs-list/extended-doc-detail-view';
import { ExtendedDocDetailService } from 'src/app/docs-list-container/docs-list/extended-doc-detail.service';
import { ExtendedAllegatoService } from '../allegati/extended-allegato.service';
import { AttachmentsBoxConfig } from "@bds/common-components";



@Component({
  selector: 'app-docs-docs',
  templateUrl: './docs-docs.component.html',
  styleUrls: ['./docs-docs.component.scss'],
  
})
export class DocsDocsComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  private idDocSorgente: number;
  public docDocCollegati: DocDoc[] = [];
  public docSorgente: ExtendedDocDetailView;
  public utenteUtilitiesLogin: UtenteUtilities;
  public cercaAncheTraPregressi: boolean = true;
  public docDaCollegare: ExtendedDocDetailView;
  public filteredDocumenti: DocDetailView[] = [];
  public placeholder: "Cerca tra i documenti .."
  public label: string;
  public idAzienda: Azienda;
  public documentiCollegatiList: ExtendedDocDetailView[] = [];
  public documentiNodi: TreeNode[] = [];
  public selectedNode: TreeNode = null;
  public childrenNodes: TreeNode<any>[] = [];
  public selectedDocId: number = null;
  public attachmentsBoxConfig: AttachmentsBoxConfig;
  public solaLettura: boolean = true;
  public openedFrom: string;


  

  constructor(
    private docDocService: DocDocService,
    private route: ActivatedRoute,
    private loginService: JwtLoginService,
    private appService: AppService,
    private extendedDocDetailService: ExtendedDocDetailService,
    private docDetailViewService: DocDetailViewService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { 
    this.attachmentsBoxConfig = new AttachmentsBoxConfig();
    this.attachmentsBoxConfig.showPreview = true;
    this.attachmentsBoxConfig.showInfoVersamento = false;
    this.attachmentsBoxConfig.showHeader = false;
  }

  /**
   * Nell'oninit vengono caricati subito i documenti collegati (documentiCollegatiList) al documento di partenza(docSorgente), tramite i docdoc(docDocCollegati).
   * Viene anche inizializzato l'albero con il nodo iniziale del documento sorgente e sotto i documenti collegati
   */
  ngOnInit(): void {
    
    this.idDocSorgente = Number(this.route.snapshot.queryParamMap.get('idDoc')) as number;
    this.openedFrom = this.route.snapshot.queryParamMap.get('from');
    this.subscriptions.push(
      this.loginService.loggedUser$.subscribe(
        (utenteUtilities: UtenteUtilities) => {
          if (utenteUtilities) {
            this.utenteUtilitiesLogin = utenteUtilities;
          }
          this.docDetailViewService.getByIdHttpCall(this.idDocSorgente,"CustomDocDetailViewForDocList").subscribe(
            (docSorgente: DocDetailView) => {
              this.docSorgente = this.setCustomProperties(docSorgente);
              this.appService.appNameSelection(`${this.docSorgente.codiceRegistro} ${this.docSorgente.numeroRegistrazione}/${this.docSorgente.annoRegistrazione} [${this.docSorgente.idAzienda.descrizione}] - Documenti Collegati`);
              this.idAzienda = this.docSorgente.idAzienda;
              this.buildTreeNode(this.docSorgente);
              this.isSolaLettura();
              this.docDocService.getDocsDocsByIdDocSorgente(this.idDocSorgente).subscribe(
                (res: DocDoc[]) => {
                  res.forEach(r => this.docDocCollegati.push(r));
                  this.docDocCollegati.forEach(docDoc => {
                    this.docDetailViewService.getByIdHttpCall(docDoc.fk_idDocDestinazione.id,"CustomDocDetailViewForDocList").subscribe(
                      (res: DocDetailView) => {
                        const docNuovo: ExtendedDocDetailView = this.setCustomProperties(res);
                        this.documentiCollegatiList.push(docNuovo);
                        this.childrenNodes.push(this.buildTreeNode(docNuovo))
                      }
                    )
                  });
                  this.documentiNodi.push(this.buildTreeNode(this.docSorgente, this.childrenNodes));
                }
              )
          })
        }  
      )
    )
  }

  /**
   * Questo serve per settare dei campi che servono ad una corretta visualizzazione
   * @param doc 
   * @returns 
   */
  private setCustomProperties(doc: DocDetailView): ExtendedDocDetailView {
    const extendedDoc: ExtendedDocDetailView = doc as ExtendedDocDetailView;
    Object.setPrototypeOf(extendedDoc, ExtendedDocDetailView.prototype);
    extendedDoc.oggettoVisualizzazione = extendedDoc.oggettoVisualizzazione;
    extendedDoc.tipologiaVisualizzazioneAndCodiceRegistro = extendedDoc;
    extendedDoc.registrazioneVisualizzazione = null; // Qui sto passando null. Ma è un trucco, in realtà sto settando i valori.
    extendedDoc.propostaVisualizzazione = null;
    extendedDoc.idPersonaResponsabileProcedimentoVisualizzazione = null;
    extendedDoc.idPersonaRedattriceVisualizzazione = null;
    extendedDoc.fascicolazioniVisualizzazione = null; // vale per il campo archiviDocList
    extendedDoc.destinatariVisualizzazione = null;
    return extendedDoc
  }

  /**
   * Metodo che scatta alla selezione di un documento da collegare. 
   * Una volta costruito l'oggetto docdoc e fatta la chiamata per l'inserimento, viene creato il nodo sull'albero
   */
  public selectDocumentToAdd() {
    this.confirmationService.confirm({
      key: "confirm-dialog",
      message: "Stai aggiungendo il " + this.docDaCollegare.codiceRegistro + " " + this.docDaCollegare.numeroRegistrazione + "/" + this.docDaCollegare.annoRegistrazione  + "[" + this.docDaCollegare.oggetto + "] "+ "  ai documenti collegati, vuoi proseguire?",
      accept: () => {
        const docDocDaAggiungere: DocDoc = new DocDoc();
        docDocDaAggiungere.idDocSorgente = {
          id: this.idDocSorgente
        } as Doc;
        docDocDaAggiungere.idDocDestinazione = {
          id: this.docDaCollegare.id
        } as Doc;
        docDocDaAggiungere.idPersonaCollegante = {
          id: this.utenteUtilitiesLogin.getUtente().idPersona.id
        } as Persona;
        docDocDaAggiungere.tipoCollegamento = TipoCollegamentoDoc.PRECEDENTE;
        this.docDocService.postHttpCall(docDocDaAggiungere).subscribe({
          next: (docDocRes: DocDoc) => {
            this.documentiCollegatiList.push(this.docDaCollegare);
            this.documentiNodi[0].children.push(this.buildTreeNode(this.docDaCollegare));
            this.messageService.add({
              severity: "success",
              summary: "Attenzione",
              detail: `Documento aggiunto con successo`
            });
          },
          error: () => {
            this.messageService.add({
              severity: "error",
              summary: "Attenzione",
              detail: `Si è verificato un errore nell'aggiunta del doc collegato, contattare Babelcare`
            });
          }
        });
      },
      reject: () => {
          //reject action
      }
    });
  }


 /**
  * @param tscol 
  * Funzione dell'autocomplete che filtra il documento per il testo cercato, azienda, persona
    ordina per ranking
    filtra per i non pregressi se non è valorizzato il checkbox apposito
    ha un'operation request per filtrare solo i documenti registrati
    quando arriva il risultato della chiamata sistema l'etichetta da mostrare
  */
  public filterDocumento(tscol: string) {
    const filterAndSort = new FiltersAndSorts();
    filterAndSort.addFilter(new FilterDefinition("idPersona.id", FILTER_TYPES.not_string.equals, this.utenteUtilitiesLogin.getUtente().idPersona.id));
    filterAndSort.addFilter(new FilterDefinition("idAzienda.id", FILTER_TYPES.not_string.equals, this.idAzienda.id));
    filterAndSort.addFilter(new FilterDefinition("tscol", FILTER_TYPES.not_string.equals, tscol));

    filterAndSort.addSort(new SortDefinition("ranking", SORT_MODES.desc));

    filterAndSort.addAdditionalData(new AdditionalDataDefinition("OperationRequested", "FilterTraDocumentiRegistrati"));

    if(!this.cercaAncheTraPregressi) {
      filterAndSort.addFilter(new FilterDefinition("pregresso", FILTER_TYPES.not_string.equals, this.cercaAncheTraPregressi));
    }

    this.subscriptions.push(
      this.docDetailViewService.getData(
        "CustomDocDetailViewForDocList",
        filterAndSort).subscribe({
          next: (data: any) => {
            this.filteredDocumenti = [];
            //console.log(data);
            if (data?.results?.length > 0) {
              this.filteredDocumenti = data.results;
              this.filteredDocumenti.forEach((el: any) => {
                el = this.setCustomProperties(el);
                el['label'] = "[" + el.codiceRegistro + " " + el.numeroRegistrazione + "/" + el.annoRegistrazione + "] " + el.oggetto;
              })
            }
          },
          error: (err) => {
            console.log("Error")
            
          }
        }));
  }

  /**
   * Creo il nodo per l'albero e lo torno.
   * @param archivio 
   * @param children 
   * @returns 
   */
   private buildTreeNode(documento: ExtendedDocDetailView, children?: TreeNode[]): TreeNode {
    const newNode: TreeNode = {};
    newNode.expanded = false;
    if (documento.id === this.idDocSorgente) {
      this.selectedNode = newNode;
      newNode.expanded = true;
    } else {
      newNode.expanded = false;
    }
    newNode.key = documento.id.toString();
    newNode.data = documento;
    
    newNode.collapsedIcon = "pi pi-file";
    newNode.expandedIcon = "pi pi-file";
    newNode.label = documento.codiceRegistro + " " + documento.numeroRegistrazione + "/" + documento.annoRegistrazione + " " + documento.oggetto ;
    
    newNode.children = children || [];
    
    newNode.styleClass = "";
    if (documento.pregresso) {
      newNode.styleClass = "nodo-pregresso";
    }
    
    return newNode;
  }

/**
 * Metodo che scatta alla selezione di un nodo dell'albero
 * @param event 
 */
  public onNodeSelect(event: any) {
    this.selectedDocId =  Number(this.selectedNode.key)

    this.loadChildren(event.node.data);
  }

  /**
   * Metodo che scatta quando si espande un nodo dell'albero
   * @param event 
   */
  public onNodeExpand(event: any) {
    this.loadChildren(event.node.data);
    
  }


/**
 * Metodo che serve per poter caricare gli inserti di un sottofascicolo qualora venisse selezionato
 * dall'albero, ma vengono caricati solo se sono meno del numero predefinito
 * @param archivio 
 * @returns 
 */
  private loadChildren(documento: DocDetailView | ExtendedDocDetailView): void {
    this.docDocService.getDocsDocsByIdDocSorgente(documento.id).subscribe(
      (res: DocDoc[]) => {
        this.docDocCollegati = res;
        const indexLiv2 = this.documentiNodi[0].children.findIndex(nodo => (nodo.data as ExtendedDocDetailView).id === documento.id);
        if(this.docDocCollegati && this.docDocCollegati.length > 0) {
          this.documentiNodi[0].children[indexLiv2].children = [];
          this.docDocCollegati.forEach(docDoc => {
            this.docDetailViewService.getByIdHttpCall(docDoc.fk_idDocDestinazione.id,"CustomDocDetailViewForDocList").subscribe(
              (res: DocDetailView) => {
                const docNuovo: ExtendedDocDetailView = this.setCustomProperties(res);
                this.documentiNodi[0].children[indexLiv2].children.push(this.buildTreeNode(docNuovo))
              }
            )
          });
        }
      }
    )
  }

  /**
   * Metodo che cancella un collegamento. 
   * Il docdoc da cancellare viene cercato negli oggetti docdoc che hanno id_docsorgente il documento di partenza e id_docdestinazione il documento di cui eliminare il collegamento.
   * Una volta cancellato toglie il nodo dall'albero
   * @param nodoDaEliminare 
   * @param docDocAttuali 
   */
  public deleteCollegamento(nodoDaEliminare: ExtendedDocDetailView, docDocAttuali: DocDoc[]) {
    this.confirmationService.confirm({
      key: "confirm-dialog",
      message: "Stai eliminando l'associazione col documento " + nodoDaEliminare.codiceRegistro + " " + nodoDaEliminare.numeroRegistrazione + "/" + nodoDaEliminare.annoRegistrazione  + "[" + nodoDaEliminare.oggetto + "] "+ ", vuoi proseguire?",
      accept: () => {
        const docDocDaEliminare = new DocDoc();
        // const docDocDaEliminare = docDocAttuali.find(d => d.fk_idDocSorgente.id === this.idDocSorgente && d.fk_idDocDestinazione.id === nodoDaEliminare.id) as DocDoc;
        docDocAttuali.forEach(dd => {
          if(dd.fk_idDocSorgente.id == this.idDocSorgente && dd.fk_idDocDestinazione.id == nodoDaEliminare.id) {
            docDocDaEliminare.id = dd.id;
          }
        })
        if(docDocDaEliminare.id) {
          this.docDocService.deleteHttpCall(docDocDaEliminare.id).subscribe({
            next: (docDocRes: DocDoc) => {
              const indexNodoDaEliminare = this.documentiNodi[0].children.findIndex(nodo => (nodo.data as ExtendedDocDetailView).id === nodoDaEliminare.id);
              if (indexNodoDaEliminare > -1) {
                this.documentiNodi[0].children.splice(indexNodoDaEliminare, 1);
              }
              this.messageService.add({
                severity: "success",
                summary: "Attenzione",
                detail: `Documento eliminato con successo`
              });
            error: () => {
              this.messageService.add({
                severity: "error",
                summary: "Attenzione",
                detail: `Si è verificato un errore nell'eliminazione del collegamento , contattare Babelcare`
              });
            }}
          });
        }
        
      },
      reject: () => {
          //reject action
      }
    });
  }
  
  /**
   * funzione per calcolare se l'interfaccia è in sola lettura. Se l'utente è demiurgo o ci o ca può sempre editare, 
   * sennò deve essere un utente che può agire
   */
  public isSolaLettura() {
    if (this.utenteUtilitiesLogin.isCA() || this.utenteUtilitiesLogin.isCI() || this.utenteUtilitiesLogin.isRV()) {
      this.solaLettura = false;
    } else {
      if(this.docSorgente.sullaScrivaniaDi.some(a => a.idPersona = this.utenteUtilitiesLogin.getUtente().idPersona.id)) {
        this.solaLettura = false; 
      } else {
        this.solaLettura = true;
      }
    }
  }
  
}

import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  Archivio,
  ArchivioDetail,
  ArchivioDetailView,
  ArchivioDiInteresse,
  ArchivioDiInteresseService,
  DecimalePredicato,
  ENTITIES_STRUCTURE,
  PermessoArchivio,
  StatoArchivio,
  ArchivioDetailViewService,
  ConfigurazioneService,
  RuoloAttoreArchivio,
  AttoreArchivio,
  ParametroAziende,
  BlackboxPermessiService,
} from "@bds/internauta-model";
import { ConfirmationService, MenuItem, MessageService } from "primeng/api";
import { ArchiviListComponent } from "../archivi-list-container/archivi-list/archivi-list.component";
import { DocsListComponent } from "../docs-list-container/docs-list/docs-list.component";
import {
  CaptionComponent,
  CaptionConfiguration,
} from "../generic-caption-table/caption-configuration";
import { CaptionReferenceTableComponent } from "../generic-caption-table/caption-reference-table.component";
import { CaptionSelectButtonsComponent } from "../generic-caption-table/caption-select-buttons.component";
import { NewArchivoButton } from "../generic-caption-table/functional-buttons/new-archivo-button";
import { SelectButtonItem } from "../generic-caption-table/select-button-item";
import { TabComponent } from "../navigation-tabs/tab.component";
import { DettaglioArchivioComponent } from "./dettaglio-archivio/dettaglio-archivio.component";
import { RichiestaAccessoArchiviComponent } from "./richiesta-accesso-archivi/richiesta-accesso-archivi.component";
import { ExtendedArchivioService } from "./extended-archivio.service";
import { Table } from "primeng/table";
import { AppComponent } from "../app.component";
import {
  AdditionalDataDefinition,
  FilterDefinition,
  FiltersAndSorts,
  FILTER_TYPES,
  PagingConf,
} from "@bds/next-sdr";
import { Observable, Subscribable, Subscription } from "rxjs";
import { first } from "rxjs/operators";
import { JwtLoginService, UtenteUtilities } from "@bds/jwt-login";
import { UploadDocumentButton } from "../generic-caption-table/functional-buttons/upload-document-button";
import { ExtendedDocDetailView } from "../docs-list-container/docs-list/extended-doc-detail-view";
import { FunctionButton } from "../generic-caption-table/functional-buttons/functions-button";
import { NavigationTabsService } from "../navigation-tabs/navigation-tabs.service";
import { AppService } from "../app.service";
import { ExtendedArchiviView } from "../archivi-list-container/archivi-list/extendend-archivi-view";
import { ArchivioUtilsService } from "./archivio-utils.service";
import { DocListService } from "../docs-list-container/docs-list/docs-list.service";

@Component({
  selector: "app-archivio",
  templateUrl: "./archivio.component.html",
  styleUrls: ["./archivio.component.scss"],
})
export class ArchivioComponent
  implements
    OnInit,
    AfterViewInit,
    TabComponent,
    CaptionSelectButtonsComponent,
    CaptionReferenceTableComponent
{
  private _archivio: Archivio;
  public captionConfiguration: CaptionConfiguration;
  public referenceTableComponent: CaptionReferenceTableComponent;
  public selectButtonItems: SelectButtonItem[];
  public selectedButtonItem: SelectButtonItem;
  public tipiDisponibili: String[];
  public permessiArchivio: PermessoArchivio[] = [];
  public colsResponsabili: any[];
  public newArchivoButton: NewArchivoButton;
  public functionButton: FunctionButton;
  public uploadDocumentButton: UploadDocumentButton;
  public contenutoDiviso = true;
  public archivioPreferito: boolean;
  public utenteExistsInArchivioInteresse: boolean;
  private utenteArchivioDiInteresse: ArchivioDiInteresse;
  private utenteUtilitiesLogin: UtenteUtilities;
  public messaggioChiusura: string = "";
  public messaggioChiusuraDefinitiva: string =
    "<br/><br/>Tutti i documenti non numerati verranno numerati.";
  public messaggioStampa: string = "";
  public subscriptions: Subscription[] = [];
  public loggedUserCanVisualizeArchive = false;
  public showRightSide: boolean = false;
  public docForDetailAndPreview: ExtendedDocDetailView;
  public rightContentProgressSpinner: boolean = false;
  public azioneInCorso: boolean = false; // è true se è in corso un'azione di chiusura, prechiusura o riapertura
  public rowCountInProgress: boolean = false;
  public rowCount: number;
  public showChiudiPopup: boolean = false;
  public chiusuraArchivioParams: boolean = false; // è true se il chiudi deve chiudere definitivamente un archivio, è false se lo deve pre-chiudere
  public chiusuraFascicolo: boolean = false;
  public contaMessaggio: number = 0;
  public showOrganizzaPopUp: boolean = false;
  public showStampaPopUp: boolean = false;
  public reloadDataDocList: boolean = false;
  public loggedUserIsResponsbaileOrVicario = false;
  public operazioneOrganizza: string = null;
  public organizzaTarget: string[] = [];
  public archivioDestinazioneOrganizza: ArchivioDetailView = null;
  public profonditaArchivio: number = null;
  public permessoMinimoSuArchivioDestinazioneOrganizza: DecimalePredicato =
    DecimalePredicato.MODIFICA;
  public loggeduserCanAccess: boolean = false;
  private globalFilterForArchiviList: string = "";
  private globalFilterForDocList: string = "";
  private previousSelectedButtonItem: SelectButton;
  public inputGobalFilterValue: string;
  public sonoPersonaVedenteSuDocSelezionato: boolean = false;

  private ARCHIVIO_DETAIL_PROJECTION =
    ENTITIES_STRUCTURE.scripta.archiviodetailview.customProjections
      .CustomArchivioDetailViewExtended;
  private ragazzoDelNovantaNove = false;

  public pageConfNoLimit: PagingConf = {
    conf: {
      page: 0,
      size: 999999,
    },
    mode: "PAGE_NO_COUNT",
  };
  private pregresso: boolean = false;

  get archivio(): Archivio {
    return this._archivio;
  }
  @Output() public updateArchivio = new EventEmitter<Archivio>();

  /**
   * Prendo in input l'archivio che il componente deve mostrare.
   * Lo ricarico con la projection che voglio e inizializzo il componente
   */
  @Input() set data(data: any) {
    this.rightContentProgressSpinner = true;

    this.subscriptions.push(
      this.extendedArchivioService
        .getByIdHttpCall(
          data.archivio.id,
          ENTITIES_STRUCTURE.scripta.archivio.customProjections
            .CustomArchivioWithIdAziendaAndIdMassimarioAndIdTitolo
        )
        .subscribe((res: Archivio) => {
          this._archivio = res;
          this.loggeduserCanAccess = this.hasPermessoMinimo(
            DecimalePredicato.PASSAGGIO
          ); //!!!this._archivio.isArchivioNero;
          if (this.utenteUtilitiesLogin) {
            this.loggedUserCanVisualizeArchive = this.hasPermessoMinimo(
              DecimalePredicato.VISUALIZZA
            );
            if (this.utenteUtilitiesLogin.getUtente()) {
              if (
                this.utenteUtilitiesLogin.isAG() ||
                this.utenteUtilitiesLogin.isCA() ||
                this.utenteUtilitiesLogin.isOS() ||
                this.utenteUtilitiesLogin.isSD()
              ) {
                this.loggedUserCanVisualizeArchive = true;
                this.loggeduserCanAccess = true;
              }
              // if (this.utenteUtilitiesLogin.getUtente().utenteReale)
              //   // this.ragazzoDelNovantaNove =
              //   //   (this.utenteUtilitiesLogin.getUtente().utenteReale
              //   //     .idInquadramento as unknown as String) === "99";
              // else
              //   this.ragazzoDelNovantaNove =
              //     (this.utenteUtilitiesLogin.getUtente()
              //       .idInquadramento as unknown as String) === "99";
            }
          }
          console.log("Archivio nell'archivio component: ", this._archivio);
          setTimeout(() => {
            this.extendedArchivioService.aggiungiArchivioRecente(
              this._archivio.fk_idArchivioRadice.id
            );

            if (this.utenteUtilitiesLogin) {
              this.loggeduserCanAccess = this.hasPermessoMinimo(
                DecimalePredicato.PASSAGGIO
              ); //!!!this._archivio.isArchivioNero;
              this.loggedUserCanVisualizeArchive = this.hasPermessoMinimo(
                DecimalePredicato.VISUALIZZA
              );
              this.loggedUserIsResponsbaileOrVicario = this.hasPermessoMinimo(
                DecimalePredicato.VICARIO
              );
              if (
                this.utenteUtilitiesLogin.isAG() ||
                this.utenteUtilitiesLogin.isCA() ||
                this.utenteUtilitiesLogin.isAG() ||
                this.utenteUtilitiesLogin.isOS() ||
                this.utenteUtilitiesLogin.isSD()
              ) {
                this.loggedUserCanVisualizeArchive = true;
                this.loggeduserCanAccess = true;
              }
              this.inizializeAll();
            }
            this.rightContentProgressSpinner = false;
          }, 0);

          this.subscriptions.push(
            this.configurazioneService
              .getParametriAziende(
                "chiusuraArchivio",
                ["scripta"],
                [this.archivio.idAzienda.id]
              )
              .subscribe((parametriAziende: ParametroAziende[]) => {
                let chiusuraArchivio: boolean = false;
                if (parametriAziende && parametriAziende[0]) {
                  chiusuraArchivio = JSON.parse(parametriAziende[0].valore);
                  this.messaggioChiusura =
                    "<b>Attenzione!</b><br/><br/>Eventuali bozze di sottofascicoli o inserti saranno eliminate.";
                  this.contaMessaggio = this.messaggioChiusura.length;
                  if (chiusuraArchivio) {
                    this.chiusuraArchivioParams = true;
                    this.messaggioChiusura += this.messaggioChiusuraDefinitiva;
                    this.buildFunctionButton(this.archivio);
                  }
                  this.messaggioChiusura += "<br/><br/>Si vuole procedere?";
                }
              })
          );
        })
    );
    this.checkPreferito(data.archivio.id);
  }

  private _archivilist: ArchiviListComponent;
  public get archivilist() {
    return this._archivilist;
  }
  @ViewChild("archivilist") set archivilist(content: ArchiviListComponent) {
    if (content) {
      this._archivilist = content;
    }
  }
  private _doclist: DocsListComponent;
  public get doclist() {
    return this._doclist;
  }
  @ViewChild("doclist") set doclist(content: DocsListComponent) {
    if (content) {
      this._doclist = content;
    }
  }
  private _dettaglioarchivio: DettaglioArchivioComponent;
  public get dettaglioarchivio() {
    return this._dettaglioarchivio;
  }
  @ViewChild("dettaglioarchivio") set dettaglioarchivio(
    content: DettaglioArchivioComponent
  ) {
    if (content) {
      this._dettaglioarchivio = content;
    }
  }

  private _richiestaaccessoarchivi: RichiestaAccessoArchiviComponent;
  public get richiestaaccessoarchivi() {
    return this._richiestaaccessoarchivi;
  }
  @ViewChild("richiestaaccessoarchivi") set richiestaaccessoarchivi(
    content: RichiestaAccessoArchiviComponent
  ) {
    if (content) {
      this._richiestaaccessoarchivi = content;
    }
  }

  constructor(
    private extendedArchivioService: ExtendedArchivioService,
    private archivioDiInteresseService: ArchivioDiInteresseService,
    private achivioDetailViewService: ArchivioDetailViewService,
    private appComponent: AppComponent,
    private messageService: MessageService,
    private navigationTabsService: NavigationTabsService,
    private loginService: JwtLoginService,
    private appService: AppService,
    private archivioUtilsService: ArchivioUtilsService,
    private configurazioneService: ConfigurazioneService,
    private confirmationService: ConfirmationService,
    private blackboxPermessiService: BlackboxPermessiService,
    private docListService: DocListService,
    public _http: HttpClient
  ) {
    this.subscriptions.push(
      this.loginService.loggedUser$
        .pipe(first())
        .subscribe((utenteUtilities: UtenteUtilities) => {
          this.utenteUtilitiesLogin = utenteUtilities;
          if (this.archivio) {
            this.loggeduserCanAccess = this.hasPermessoMinimo(
              DecimalePredicato.PASSAGGIO
            ); //!!!this.archivio.isArchivioNero;
            this.loggedUserCanVisualizeArchive = this.hasPermessoMinimo(
              DecimalePredicato.VISUALIZZA
            );
            this.loggedUserIsResponsbaileOrVicario = this.hasPermessoMinimo(
              DecimalePredicato.VICARIO
            );
            if (
              this.utenteUtilitiesLogin.isAG() ||
              this.utenteUtilitiesLogin.isCA() ||
              this.utenteUtilitiesLogin.isOS() ||
              this.utenteUtilitiesLogin.isSD()
            ) {
              this.loggedUserCanVisualizeArchive = true;
              this.loggeduserCanAccess = true;
            }
            this.inizializeAll();
          }
        })
    );
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  /**
   * Metodo chiamato quando viene selezionato un documento nella docs-list
   * @param event
   */
  public manageRowSelected(event: {
    showPanel: boolean;
    rowSelected: ExtendedDocDetailView;
    sonoPersonaVedenteSuDocSelezionato: boolean;
  }) {
    this.showRightSide = event.showPanel;
    this.docForDetailAndPreview = event.rowSelected;
    this.sonoPersonaVedenteSuDocSelezionato =
      event.sonoPersonaVedenteSuDocSelezionato;
  }

  /**
   * Funzione chiamata quando ho un nuovo archivio da mostrare. Si occupa di:
   * - Costruire i selectedButton da mostrare/abilitare
   * - Creare o meno il bottone per creare nuovi sottoarchivi
   * - Si posizione sul corretto selctedButton e mostra il corretto sottocomponente
   */
  private inizializeAll(): void {
    if (this.archivio.pregresso) {
      this.pregressaArchivio();
    }
    this.buildSelectButtonItems(this.archivio);
    this.buildNewArchivioButton(this.archivio);
    this.buildFunctionButton(this.archivio);
    this.buildUploadDocumentButton(this.archivio);
    this.setProfonditaArchivio(this.archivio);

    if (
      this.archivio.attoriList.find(
        (a) =>
          a.ruolo === "RESPONSABILE_PROPOSTO" &&
          a.idPersona.id === this.utenteUtilitiesLogin.getUtente().idPersona.id
      )
    ) {
      this.selectedButtonItem = this.selectButtonItems.find(
        (x) => x.id === SelectButton.DETTAGLIO
      );
      this.setForDettaglio();
    } else if (this.archivio.stato === StatoArchivio.BOZZA) {
      this.selectedButtonItem = this.selectButtonItems.find(
        (x) => x.id === SelectButton.DETTAGLIO
      );
      this.setForDettaglio();
    } else {
      if (this.contenutoDiviso) {
        if (this.selectedButtonItem?.id === SelectButton.DETTAGLIO) {
          this.selectedButtonItem = this.selectButtonItems.find(
            (x) => x.id === SelectButton.DETTAGLIO
          );
          this.setForDettaglio();
        } else if (
          this.selectedButtonItem?.id === SelectButton.DOCUMENTI ||
          this.archivio.livello === 3
        ) {
          this.selectedButtonItem = this.selectButtonItems.find(
            (x) => x.id === SelectButton.DOCUMENTI
          );
          this.setForDocumenti();
        } else {
          this.selectedButtonItem =
            this.selectButtonItems.find(
              (x) =>
                x.label === this.selectedButtonItem?.label &&
                !this.selectedButtonItem?.disabled
            ) ||
            this.selectButtonItems.find(
              (x) => x.id === SelectButton.SOTTOARCHIVI
            );
          this.setForSottoarchivi();
        }
      } else {
        this.selectedButtonItem = this.selectButtonItems.find(
          (x) => x.id === SelectButton.CONTENUTO
        );
        this.setForContenuto();
      }
    }
  }

  private setForSottoarchivi(): void {
    this.captionConfiguration = new CaptionConfiguration(
      CaptionComponent.ARCHIVI_LIST,
      true,
      true,
      true,
      false,
      this.archivio?.stato !== StatoArchivio.BOZZA &&
        this.archivio?.livello < 3,
      true,
      false,
      true,
      this.archivio.stato === StatoArchivio.CHIUSO ||
        this.archivio.stato === StatoArchivio.PRECHIUSO,
      false
    );
    if (
      this.archivio.stato === StatoArchivio.CHIUSO ||
      this.archivio.stato === StatoArchivio.PRECHIUSO
    ) {
      this.captionConfiguration.showIconArchiveClosed = true;
    }
    this.referenceTableComponent = this.archivilist;
    this.previousSelectedButtonItem = SelectButton.SOTTOARCHIVI;
    setTimeout(() => {
      this.inputGobalFilterValue = this.globalFilterForArchiviList;
    }, 0);
  }

  public setForContenuto(): void {
    this.captionConfiguration = new CaptionConfiguration(
      CaptionComponent.ARCHIVIO,
      true,
      true,
      false,
      false,
      this.archivio?.stato !== StatoArchivio.BOZZA &&
        this.archivio?.livello < 3,
      true,
      false,
      false,
      this.archivio.stato === StatoArchivio.CHIUSO ||
        this.archivio.stato === StatoArchivio.PRECHIUSO,
      false
    );
    if (
      this.archivio.stato === StatoArchivio.CHIUSO ||
      this.archivio.stato === StatoArchivio.PRECHIUSO
    ) {
      this.captionConfiguration.showIconArchiveClosed = true;
    }
    this.referenceTableComponent = this;
    this.previousSelectedButtonItem = SelectButton.CONTENUTO;
  }

  private setForDocumenti(): void {
    this.captionConfiguration = new CaptionConfiguration(
      CaptionComponent.DOCS_LIST,
      true,
      true,
      true,
      true,
      false,
      true,
      true,
      true,
      this.archivio.stato === StatoArchivio.CHIUSO ||
        this.archivio.stato === StatoArchivio.PRECHIUSO,
      false
    );
    if (
      this.archivio.stato === StatoArchivio.CHIUSO ||
      this.archivio.stato === StatoArchivio.PRECHIUSO
    ) {
      this.captionConfiguration.showIconArchiveClosed = true;
    }
    this.referenceTableComponent = this.doclist;
    this.previousSelectedButtonItem = SelectButton.DOCUMENTI;
    setTimeout(() => {
      this.inputGobalFilterValue = this.globalFilterForDocList;
    }, 0);
  }

  private setForDettaglio(): void {
    this.captionConfiguration = new CaptionConfiguration(
      CaptionComponent.ARCHIVIO,
      false,
      true,
      false,
      false,
      this.archivio?.stato !== StatoArchivio.BOZZA &&
        this.archivio?.livello < 3,
      true,
      false,
      false,
      this.archivio.stato === StatoArchivio.CHIUSO ||
        this.archivio.stato === StatoArchivio.PRECHIUSO,
      true
    );
    if (
      this.archivio.stato === StatoArchivio.CHIUSO ||
      this.archivio.stato === StatoArchivio.PRECHIUSO
    ) {
      this.captionConfiguration.showIconArchiveClosed = true;
    }
    this.referenceTableComponent = {} as CaptionReferenceTableComponent;
    this.previousSelectedButtonItem = SelectButton.DETTAGLIO;
  }

  /**
   * Gestione del cambio di contenuto richiesto dall'utente
   * Può voler vedere i sottoarchivi, i documenti o il dettaglio dell'archivio
   * @param event
   */
  public onSelectButtonItemSelection(event: any): void {
    switch (this.previousSelectedButtonItem) {
      case SelectButton.SOTTOARCHIVI:
        this.globalFilterForArchiviList =
          (this.referenceTableComponent.dataTable.filters?.global as any)
            ?.value ?? "";
        this.inputGobalFilterValue = this.globalFilterForArchiviList;
        break;
      case SelectButton.DOCUMENTI:
        this.globalFilterForDocList =
          (this.referenceTableComponent.dataTable.filters?.global as any)
            ?.value ?? "";
        this.inputGobalFilterValue = this.globalFilterForDocList;
        break;
    }

    switch (event.option.id) {
      case SelectButton.SOTTOARCHIVI:
        this.setForSottoarchivi();
        break;
      case SelectButton.DOCUMENTI:
        this.setForDocumenti();
        break;
      case SelectButton.DETTAGLIO:
        this.setForDettaglio();
        break;
      case SelectButton.CONTENUTO:
        this.setForContenuto();
        break;
    }
    this.reloadDataDocList = false;
  }

  /**
   * Calcolo la lista di selectButton che vogliamo vedere.
   * In particolare se l'archivio aperto è un inserto allora
   * non sarà presente l'opzione sottoarchvi.
   */
  public buildSelectButtonItems(archivio: Archivio | ArchivioDetail): void {
    this.selectButtonItems = [];
    let labelDati: string;
    switch (archivio.livello) {
      case 1:
        labelDati = "Dati del fascicolo";
        if (this.contenutoDiviso) {
          this.selectButtonItems.push({
            id: SelectButton.SOTTOARCHIVI,
            label: "Sottofascicoli",
            disabled: this.archivio.stato === StatoArchivio.BOZZA,
          });
        }
        break;
      case 2:
        labelDati = "Dati del sottofascicolo";
        if (this.contenutoDiviso) {
          this.selectButtonItems.push({
            id: SelectButton.SOTTOARCHIVI,
            label: "Inserti",
            disabled: this.archivio.stato === StatoArchivio.BOZZA,
          });
        }
        break;
      case 3:
        labelDati = "Dati dell'inserto";
        break;
    }
    if (this.contenutoDiviso) {
      this.selectButtonItems.push({
        id: SelectButton.DOCUMENTI,
        label: "Documenti",
        disabled:
          this.archivio.stato === StatoArchivio.BOZZA ||
          !this.loggedUserCanVisualizeArchive,
      });
    } else {
      this.selectButtonItems.push({
        id: SelectButton.CONTENUTO,
        label: "Contenuto",
        disabled: this.archivio.stato === StatoArchivio.BOZZA,
      });
    }
    this.selectButtonItems.push({
      id: SelectButton.DETTAGLIO,
      label:
        labelDati +
        (this.archivio.stato === StatoArchivio.BOZZA ? " (Bozza)" : ""),
    });
  }

  /**
   * Creo il bottone per creare un nuovo sottoarchivio
   * @param archivio
   */
  public buildNewArchivioButton(archivio: Archivio | ArchivioDetail): void {
    const aziendaItem: MenuItem = {
      label: this.archivio.idAzienda.nome,
      disabled: false,
      command: () => {
        this.rightContentProgressSpinner = true;
        this.archivilist.newArchivio(this.archivio.idAzienda.id);
      },
    } as MenuItem;
    switch (archivio.livello) {
      case 1:
        this.newArchivoButton = {
          tooltip: "Crea nuovo sottofascicolo",
          livello: 1,
          aziendeItems: [aziendaItem],
          enable:
            !this.isArchivioChiuso() &&
            this.hasPermessoMinimo(DecimalePredicato.VICARIO),
        };
        break;
      case 2:
        this.newArchivoButton = {
          tooltip: "Crea nuovo inserto",
          livello: 2,
          aziendeItems: [aziendaItem],
          enable:
            !this.isArchivioChiuso() &&
            this.hasPermessoMinimo(DecimalePredicato.VICARIO),
        };
        break;
    }
  }

  /**
   * Creo il bottone funzioni
   * @param archivio
   */
  public buildFunctionButton(archivio: Archivio | ArchivioDetail): void {
    const funzioniItems: MenuItem[] = [
      {
        label: "Organizza",
        items: [
          {
            label: "Sposta",
            command: () => {
              (this.showOrganizzaPopUp = true),
                (this.operazioneOrganizza = "Sposta");
            },
            disabled: !!!this.hasPermessoMinimo(DecimalePredicato.MODIFICA),
          },
          {
            label: "Copia",
            command: () => {
              (this.showOrganizzaPopUp = true),
                (this.operazioneOrganizza = "Copia");
            },
          },
          {
            label: "Duplica",
            command: () => {
              (this.showOrganizzaPopUp = true),
                (this.operazioneOrganizza = "Duplica");
            },
          },
          {
            label: "Trasforma in fascicolo",
            disabled:
              this.archivio?.livello === 1 ||
              !!!this.hasPermessoMinimo(DecimalePredicato.MODIFICA),
            command: () => {
              (this.showOrganizzaPopUp = true),
                (this.operazioneOrganizza = "Trasforma in fascicolo");
            },
          },
        ],
        disabled:
          this.isArchivioChiuso() ||
          !!!this.hasPermessoMinimo(DecimalePredicato.VISUALIZZA) ||
          this.azioneInCorso,
      },
      {
        label: "Genera",
        items: [
          {
            label: "Frontespizio",
            command: () =>
              this.downloadFrontesprizioFascicolo(archivio as Archivio),
          },
          // {
          //    label: "Dorso",
          //    command: () => console.log("qui dovrò generare il Dorso")
          // }
        ],
        disabled: this.azioneInCorso,
      },
      {
        label: "Scarica zip",
        disabled:
          !this.hasPermessoMinimo(DecimalePredicato.VISUALIZZA) ||
          archivio.stato === StatoArchivio.BOZZA ||
          this.azioneInCorso,
        command: () => this.downloadArchivioZip(archivio as Archivio),
      },
      {
        //      label: this.archivio.stato === StatoArchivio.PRECHIUSO ? 'Riapri fascicolo' : 'Chiudi fascicolo',
        //      disabled: this.archivio.stato === StatoArchivio.BOZZA || this.archivio.stato === StatoArchivio.CHIUSO || this.archivio.livello !== 1 || !this.loggedUserIsResponsbaileOrVicario,
        label:
          this.archivio.stato === StatoArchivio.PRECHIUSO
            ? "Riapri fascicolo"
            : "Prechiudi fascicolo",
        disabled:
          this.archivio.stato === StatoArchivio.BOZZA ||
          this.archivio.stato === StatoArchivio.CHIUSO ||
          this.archivio.livello !== 1 ||
          !this.loggedUserIsResponsbaileOrVicario ||
          (archivio.stato === StatoArchivio.APERTO &&
            this.chiusuraArchivioParams) ||
          this.azioneInCorso,
        command: () => {
          if (this.archivio.stato === StatoArchivio.PRECHIUSO)
            this.chiudiRiapriArchivio(event);
          else this.showChiudiPopup = true;
        },
      },
      {
        label: "Chiudi fascicolo",
        disabled:
          this.archivio.stato === StatoArchivio.BOZZA ||
          this.archivio.stato === StatoArchivio.CHIUSO ||
          this.archivio.livello !== 1 ||
          !this.loggedUserIsResponsbaileOrVicario ||
          (archivio.stato === StatoArchivio.APERTO &&
            !this.chiusuraArchivioParams) ||
          this.azioneInCorso,
        command: () => {
          this.chiusuraFascicolo = true;
          console.log("ch prima di chiudi pop: ", this.chiusuraFascicolo);
          this.showChiudiPopup = true;
        },
      },
    ] as MenuItem[];

    this.functionButton = {
      tooltip: "Funzioni",
      functionItems: funzioniItems,
      enable: true,
    };
  }

  /**
   * Effettua il download del frontespizio fascicolo.
   * @param archivio Il fascicolo richiesto.
   */
  private downloadFrontesprizioFascicolo(archivio: Archivio) {
    this.rightContentProgressSpinner = true;
    this.extendedArchivioService
      .downloadFrontespizioFascicolo(archivio)
      .subscribe({
        next: (res) => {
          this.rightContentProgressSpinner = false;
          if (res && res.url) window.open(res.url);
        },
        error: async (err) => {
          this.rightContentProgressSpinner = false;
          const error = JSON.parse(await err?.error?.text());
          let severity = "error";
          let message =
            "Errore durante il download. Riprovare oppure contattare BabelCare.";
          if (error) {
            // error code: 1.403 2.404 3.500
            if (["1", "2"].includes(error.code)) severity = "warn";
            message = error.message;
          }
          this.messageService.add({
            severity: severity,
            key: "ArchivioToast",
            summary: "Attenzione",
            detail: message,
          });
        },
      });
  }

  /**
   * Effettua il download del fascicolo in formato zip.
   * @param archivio Il fascicolo da scaricare.
   */
  private downloadArchivioZip(archivio: Archivio) {
    this.rightContentProgressSpinner = true;
    this.extendedArchivioService.downloadArchivioZip(archivio).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: "success",
          key: "ArchivioToast",
          summary: "OK",
          detail:
            "Il fascicolo è in preparazione. Riceverai una notifica in scrivania contenente il link per scaricarlo.",
        });
        this.rightContentProgressSpinner = false;
      },
      error: async (err) => {
        this.rightContentProgressSpinner = false;
        const error = JSON.parse(await err?.error?.text());
        let severity = "error";
        let message =
          "Errore durante il download. Riprovare oppure contattare BabelCare.";
        if (error) {
          // error code: 1.403 2.404 3.500
          if (["1", "2"].includes(error.code)) severity = "warn";
          message = error.message;
        }
        this.messageService.add({
          severity: severity,
          key: "ArchivioToast",
          summary: "Attenzione",
          detail: message,
        });
      },
    });
  }

  /**
   * Metodo che prende il nome del file dall'header della response.
   * @param response La response http.
   * @param archivio Il fascicolo per prendere il nome in caso non venga passato dal service.
   * @returns Il nome del file.
   */
  private getFilenameFromResponse(response: any, archivio: Archivio) {
    const contentDispositionHeader = response?.headers?.get(
      "Content-Disposition"
    );
    if (contentDispositionHeader != null) {
      const parts = contentDispositionHeader.split(";");
      for (const part of parts) {
        if (part.trim().startsWith("filename")) {
          const filename = part.substring(part.indexOf("=") + 1).trim();
          return filename.replace(/"/g, "");
        }
      }
    }
    const numero: string = archivio.numerazioneGerarchica.substring(
      0,
      archivio.numerazioneGerarchica.indexOf("/")
    );
    return `${numero}-${archivio.anno}-${archivio.oggetto}.zip`;
  }

  /**
   * Creo il bottone per caricare documnti sull'archivio
   * @param archivio
   */
  public buildUploadDocumentButton(archivio: Archivio | ArchivioDetail): void {
    this.uploadDocumentButton = {
      command: this.uploadDocument,
      enable:
        !this.isArchivioChiuso() &&
        this.hasPermessoMinimo(DecimalePredicato.MODIFICA),
    };
  }

  /**
   * Ritorna true se l'utente come permesso minimo quello passato come parametro
   * @returns
   */
  public hasPermessoMinimo(permessoMinimo: DecimalePredicato): boolean {
    return this._archivio.permessiEspliciti.some(
      (permessoArchivio: PermessoArchivio) =>
        permessoArchivio.fk_idPersona.id ===
          this.utenteUtilitiesLogin.getUtente().idPersona.id &&
        permessoArchivio.bit >= permessoMinimo
    );
  }

  /**
   * Ritorna true se l'utente può creare il sottoarchivio e cioè se è responsabile/vicario o ha permesso di almeno modifica
   * @returns
   */
  /* public canVisualizeArchive(archivio: Archivio): boolean {
    return archivio.permessiEspliciti?.find((p: PermessoArchivio) => 
      p.fk_idPersona.id === this.utenteUtilitiesLogin.getUtente().idPersona.id)?.bit > DecimalePredicato.PASSAGGIO;
  } */

  /**
   * Metodo chiamato quando non ho cambiato archivio, ma esso è stato modificato,
   * e alcune di queste modifiche le vogliamo "notare"
   * @param archivio
   */
  public onUpdateArchivio(archivio: Archivio) {
    console.log("updateArchivio(archivio: Archivio)", archivio);
    this._archivio = archivio;
    this.inizializeAll();
    this.selectedButtonItem = this.selectButtonItems.find(
      (x) => x.id === SelectButton.DETTAGLIO
    );
    this.setForDettaglio();
  }

  /**
   * Funzione utile al caricamento di un document
   */
  public uploadDocument(event: any, nomiNuovi: string[]): void {
    const formData: FormData = new FormData();
    formData.append("idArchivio", this.archivio.id.toString());
    event.files.forEach((file: File, index: number) => {
      formData.append("documents", file, nomiNuovi[index]);
    });
    this.rightContentProgressSpinner = true;
    this.extendedArchivioService.uploadDocument(formData).subscribe((res) => {
      console.log("res", res);
      this.rightContentProgressSpinner = false;
      this.referenceTableComponent.resetPaginationAndLoadData(res as number[]);
    });
  }

  /**
   * Di seguito un serie di metodi che servono da passa carte tra la
   * generic-caption-table e le due tabelle docs-list e archivi-list
   * nel caso non sia attiva la modalità "contenutoDiviso"
   */
  public removeSort(): void {
    this.archivilist.removeSort();
    this.doclist.removeSort();
  }
  public applyFilterGlobal(stringa: string, matchOperation: string): void {
    this.archivilist.applyFilterGlobal(stringa, matchOperation);
    this.doclist.applyFilterGlobal(stringa, matchOperation);
  }
  public resetPaginationAndLoadData() {
    this.archivilist.resetPaginationAndLoadData();
    this.doclist.resetPaginationAndLoadData();
  }
  public clear() {
    this.archivilist.clear();
    this.doclist.clear();
  }
  public exportCSV(dataTable: Table) {
    this.rightContentProgressSpinner = this.doclist.rightContentProgressSpinner;
    this.doclist.exportCSV(this.doclist.dataTable);
  }

  /*   
    check if archivio is preferito 
    we do this by checking archivio_di_interesi table using the filter on utente connesso id 
    here we also define if user exists in db
    inicialize ArchivioDiInteresse of user
  */
  public checkPreferito(id: number) {
    const filterAndSort = new FiltersAndSorts();
    filterAndSort.addFilter(
      new FilterDefinition(
        "idPersona.id",
        FILTER_TYPES.not_string.equals,
        this.appComponent.utenteConnesso.getUtente().idPersona.id
      )
    );
    this.archivioDiInteresseService
      .getData(
        ENTITIES_STRUCTURE.scripta.archiviodiinteresse.standardProjections
          .ArchivioDiInteresseWithPlainFields,
        filterAndSort
      )
      .subscribe((res: any) => {
        if (res.results[0]) {
          this.utenteArchivioDiInteresse = res.results[0];
          this.utenteExistsInArchivioInteresse = true;
          //console.log("Utente Archivio Di Interesse",this.utenteArchivioDiInteresse);
          if (this.utenteArchivioDiInteresse.idArchiviPreferiti) {
            this.archivioPreferito =
              res.results[0].idArchiviPreferiti.includes(id);
          } else {
            this.archivioPreferito = false;
          }
        } else {
          this.utenteExistsInArchivioInteresse = false;
        }
      });
  }

  /**
   * This function updates archivi di interesse table => preferito column.
   * Firstly we check if user exist in table & if not we call addUserInArchivioDiInteresse function to create new row.
   * If exists we check if archivio id exists in table to add or remove it.
   */
  public updateOrAddPreferito() {
    if (this.utenteExistsInArchivioInteresse) {
      const archivioDiInteresseToSave: ArchivioDiInteresse =
        new ArchivioDiInteresse();
      if (
        this.utenteArchivioDiInteresse.idArchiviPreferiti.includes(
          this.archivio.id
        )
      ) {
        this.utenteArchivioDiInteresse.idArchiviPreferiti =
          this.utenteArchivioDiInteresse.idArchiviPreferiti.filter(
            (archivio) => archivio !== this.archivio.id
          );
      } else {
        this.utenteArchivioDiInteresse.idArchiviPreferiti.push(
          this.archivio.id
        );
      }
      archivioDiInteresseToSave.version =
        this.utenteArchivioDiInteresse.version;
      archivioDiInteresseToSave.idArchiviPreferiti =
        this.utenteArchivioDiInteresse.idArchiviPreferiti;
      console.log("Utente Archivio Di Interesse", archivioDiInteresseToSave);
      this.rightContentProgressSpinner = true;
      this.subscriptions.push(
        this.archivioDiInteresseService
          .patchHttpCall(
            archivioDiInteresseToSave,
            this.utenteArchivioDiInteresse.id,
            null,
            null
          )
          .subscribe({
            next: (res: ArchivioDiInteresse) => {
              this.rightContentProgressSpinner = false;
              this.archivioPreferito = !this.archivioPreferito;
              //console.log("Update archivio Preferito: ", res);
              this.utenteArchivioDiInteresse.version = res.version;
              let message: string;
              if (this.archivioPreferito) {
                message = `Aggiunto come preferito correttamente`;
              } else {
                message = `Rimosso dai preferiti correttamente`;
              }
              this.messageService.add({
                severity: "success",
                key: "ArchivioToast",
                summary: "OK",
                detail: message,
              });
            },
            error: () => {
              this.messageService.add({
                severity: "error",
                key: "ArchivioToast",
                summary: "Attenzione",
                detail: `Error, contattare Babelcare`,
              });
            },
          })
      );
    } else {
      this.addUserInArchivioDiInteresse();
    }
  }

  public isArchivioChiuso(): boolean {
    if (
      this.archivio.stato == StatoArchivio.CHIUSO ||
      this.archivio.stato == StatoArchivio.PRECHIUSO
    )
      return true;
    else return false;
  }

  /**
   * metodo che gestisce riapertura, chiusura e prechiusura dei fascicoli
   * @param event
   * @returns
   */
  public chiudiRiapriArchivio(event: Event): void {
    if (this.archivio.idMassimario === null || !this.archivio.idMassimario.id) {
      this.messageService.add({
        severity: "error",
        key: "dettaglioArchivioToast",
        summary: "Attenzione",
        detail: `Non è possibile chiudere un archivio senza aver prima assegnato una tipologia documentale`,
      });
      return;
    }

    const archivioUpdate = new Archivio();
    archivioUpdate.version = this.archivio.version;
    const additionalData = [
      new AdditionalDataDefinition(
        "OperationRequested",
        "CloseOrReopenArchive"
      ),
    ];

    if (this.archivio.stato == StatoArchivio.PRECHIUSO) {
      this.rightContentProgressSpinner = true;
      this.azioneInCorso = true;
      this.buildFunctionButton(this.archivio);
      archivioUpdate.stato = StatoArchivio.APERTO;
      this.archivio.stato = StatoArchivio.APERTO;
      this.subscriptions.push(
        this.patchArchivio(
          archivioUpdate,
          additionalData,
          "Archivio " +
            this.archivio.numerazioneGerarchica +
            " riaperto correttamente",
          `Si è verificato un errore nella riapertura dell'archivio, contattare Babelcare`
        ).subscribe((a) => {
          this.updateArchivio.emit(this.archivio);
          this.captionConfiguration = new CaptionConfiguration(
            CaptionComponent.ARCHIVIO,
            true,
            true,
            false,
            false,
            true,
            true,
            false,
            false,
            false,
            true
          );
          this.rightContentProgressSpinner = false;
          this.azioneInCorso = false;
          this.buildNewArchivioButton(this.archivio);
          this.buildFunctionButton(this.archivio);
          this.dettaglioarchivio.isArchivioChiuso = this.isArchivioChiuso();
        })
      );
      this.chiusuraFascicolo = false;
    } /*else {
      //this.rightContentProgressSpinner = true;
      if (this.chiusuraArchivioParams) {
        // L'utente conferma di voler chiudere definitivamente il fascicolo, faccio partire la chiusura
        archivioUpdate.stato = StatoArchivio.CHIUSO;
        this.archivio.stato = StatoArchivio.CHIUSO;
        this.subscriptions.push(this.patchArchivio(
            archivioUpdate,
            additionalData,
            "Archivio " + this.archivio.numerazioneGerarchica + " chiuso correttamente",
            `Si è verificato un errore nella chiusura dell'archivio, contattare Babelcare`
          ).subscribe( a => {
            this.updateArchivio.emit(this.archivio);
            this.captionConfiguration = new CaptionConfiguration(
              CaptionComponent.ARCHIVIO, true, true, false, false, 
              false, true, false, false,
              true, true);
            this.buildFunctionButton(this.archivio);
            this.docListService.refreshDocs();
            this.rightContentProgressSpinner = false;
          })
        );
      } */ else {
      // L'utente conferma di voler chiudere il fascicolo, faccio partire la chiusura
      this.rightContentProgressSpinner = true;
      this.azioneInCorso = true;
      this.buildFunctionButton(this.archivio);
      archivioUpdate.stato = StatoArchivio.PRECHIUSO;
      this.archivio.stato = StatoArchivio.PRECHIUSO;
      this.subscriptions.push(
        this.patchArchivio(
          archivioUpdate,
          additionalData,
          "Archivio " +
            this.archivio.numerazioneGerarchica +
            " prechiuso correttamente",
          `Si è verificato un errore nella prechiusura dell'archivio, contattare Babelcare`
        ).subscribe((a) => {
          this.updateArchivio.emit(this.archivio);
          this.captionConfiguration = new CaptionConfiguration(
            CaptionComponent.ARCHIVIO,
            true,
            true,
            false,
            false,
            false,
            true,
            false,
            false,
            true,
            true
          );
          this.rightContentProgressSpinner = false;
          this.azioneInCorso = false;
          this.buildFunctionButton(this.archivio);
          this.dettaglioarchivio.isArchivioChiuso = this.isArchivioChiuso();
        })
      );
    }
    //}
  }

  /**
   * Metodo che imposta lo stato del fascicolo su CHIUSO
   * @param event
   */
  public chiusuraDefinitiva(event: Event): void {
    if (this.archivio.idMassimario === null || !this.archivio.idMassimario.id) {
      this.messageService.add({
        severity: "error",
        key: "dettaglioArchivioToast",
        summary: "Attenzione",
        detail: `Non è possibile chiudere un archivio senza aver prima assegnato una tipologia documentale`,
      });
      return;
    }
    const archivioUpdate = new Archivio();
    archivioUpdate.version = this.archivio.version;
    const additionalData = [
      new AdditionalDataDefinition(
        "OperationRequested",
        "CloseOrReopenArchive"
      ),
    ];
    this.rightContentProgressSpinner = true;
    this.azioneInCorso = true;
    this.buildFunctionButton(this.archivio);
    this.azioneInCorso = true;
    archivioUpdate.stato = StatoArchivio.CHIUSO;
    this.archivio.stato = StatoArchivio.CHIUSO;
    this.subscriptions.push(
      this.patchArchivio(
        archivioUpdate,
        additionalData,
        "Archivio " +
          this.archivio.numerazioneGerarchica +
          " chiuso correttamente",
        `Si è verificato un errore nella chiusura dell'archivio, contattare Babelcare`
      ).subscribe((a) => {
        this.updateArchivio.emit(this.archivio);
        this.captionConfiguration = new CaptionConfiguration(
          CaptionComponent.ARCHIVIO,
          true,
          true,
          false,
          false,
          false,
          true,
          false,
          false,
          true,
          true
        );
        this.docListService.refreshDocs();
        this.rightContentProgressSpinner = false;
        this.azioneInCorso = false;
        this.buildFunctionButton(this.archivio);
        this.dettaglioarchivio.isArchivioChiuso = this.isArchivioChiuso();
      })
    );
  }

  /**
   * torna un observable, che alla sottoscrizione aggiorna l'archivio e mostra il messaggio passato in caso si successo, oppure il messaggio di errore passato in caso di errore
   * @param archivioToUpdate
   * @param additionalData
   * @param messageSuccess
   * @param messageError
   * @returns
   */
  public patchArchivio(
    archivioToUpdate: Archivio,
    additionalData?: AdditionalDataDefinition[],
    messageSuccess?: string,
    messageError?: string
  ): Observable<any> {
    // crea un observable al quale sottoscriversi. Alla sottoscrizione verrà prima eseguiro il codice in questa subscribe
    const obs: Observable<any> = new Observable((observer) =>
      this.extendedArchivioService
        .patchHttpCall(
          archivioToUpdate,
          this.archivio.id,
          null /* this.ARCHIVIO_PROJECTION */,
          additionalData
        )
        .subscribe({
          next: (res) => {
            console.log("Update archivio: ", res);
            this.archivio.version = res.version;
            if (messageSuccess) {
              this.messageService.add({
                severity: "success",
                key: "dettaglioArchivioToast",
                summary: "OK",
                detail: messageSuccess,
              });
            }
            // il lancio di queste due funzioni fa si che venga eseguita prima questa subscribe e poi quella esterna al quale ci si sottoscriverà
            observer.next(res);
            observer.complete();
          },
          error: (err) => {
            if (messageError) {
              this.messageService.add({
                severity: "error",
                key: "dettaglioArchivioToast",
                summary: "Attenzione",
                detail: `Si è verificato un errore nella chiusura/riapertura dell'archivio, contattare Babelcare`,
              });
            }
          },
        })
    );
    return obs;
  }

  public addUserInArchivioDiInteresse() {
    const archivioDiInteresseToSave: ArchivioDiInteresse =
      new ArchivioDiInteresse();
    archivioDiInteresseToSave.idPersona =
      this.appComponent.utenteConnesso.getUtente().idPersona;
    archivioDiInteresseToSave.idArchiviFrequenti = [];
    archivioDiInteresseToSave.idArchiviRecenti = [];
    archivioDiInteresseToSave.idArchiviPreferiti = [];
    archivioDiInteresseToSave.idArchiviPreferiti.push(this.archivio.id);
    this.subscriptions.push(
      this.archivioDiInteresseService
        .postHttpCall(archivioDiInteresseToSave)
        .subscribe({
          next: (res: ArchivioDiInteresse) => {
            //console.log("Added archivio to favories: ", res);
            this.archivioPreferito = !this.archivioPreferito;
            this.utenteExistsInArchivioInteresse = true;
            this.utenteArchivioDiInteresse = res;
            this.messageService.add({
              severity: "success",
              key: "ArchivioToast",
              summary: "OK",
              detail: "Aggiunto come preferito correttamente",
            });
          },
          error: () => {
            this.messageService.add({
              severity: "error",
              key: "ArchivioToast",
              summary: "Attenzione",
              detail: `Error, contattare Babelcare`,
            });
          },
        })
    );
  }

  /**
   * Dall'html è stato scelto un archivio su cui poi verrà archiviata la pec.
   * @param arch
   */
  public archivioSelectedEvent(arch: any) {
    this.archivioDestinazioneOrganizza = arch as ArchivioDetailView;
  }

  /**
   * Imposta la l'attributo profonditaArchivio con il corretto livello di profondità dell'archivio corrente
   * @param arch L'archivio corrente
   */
  public setProfonditaArchivio(arch: Archivio | ArchivioDetail): void {
    this.profonditaArchivio = 1;
    if (arch.numeroSottoarchivi > 0) {
      this.profonditaArchivio = 2;
      if (arch.livello === 1) {
        const filtersAndSorts = this.buildFilterToLoadChildren(arch);
        this.subscriptions.push(
          this.achivioDetailViewService
            .getData(
              this.ARCHIVIO_DETAIL_PROJECTION,
              filtersAndSorts,
              null,
              this.pageConfNoLimit
            )
            .subscribe((res: any) => {
              const children = res.results;
              if (children.some((x: any) => x.numeroSottoarchivi > 0)) {
                this.profonditaArchivio = 3;
              }
            })
        );
      }
    }
  }

  /**
   * @returns Restituisce il livello di archivio sceglibile massimo
   * per impedire la generazione di archivi di livello 4, calcolato
   * attraverso questo calcolo
   * livello massimo sceglibile = 3 - profondità dell'archivio da spostare/copiare.
   */
  public getLivelloForAutocompliteArchivioDestinazione(): number {
    if (
      this.organizzaTarget.includes("contenuto") &&
      !!!this.organizzaTarget.includes("fascicolo")
    ) {
      return 3;
    } else {
      return 3 - this.profonditaArchivio;
    }
  }

  private buildFilterToLoadChildren(
    archivio: Archivio | ArchivioDetail
  ): FiltersAndSorts {
    const filtersAndSorts: FiltersAndSorts = new FiltersAndSorts();
    filtersAndSorts.addFilter(
      new FilterDefinition(
        "idArchivioPadre.id",
        FILTER_TYPES.not_string.equals,
        archivio.id
      )
    );
    filtersAndSorts.addFilter(
      new FilterDefinition(
        "idAzienda.id",
        FILTER_TYPES.not_string.equals,
        archivio.fk_idAzienda.id
      )
    );
    filtersAndSorts.addFilter(
      new FilterDefinition(
        "idPersona.id",
        FILTER_TYPES.not_string.equals,
        this.utenteUtilitiesLogin.getUtente().idPersona.id
      )
    );
    return filtersAndSorts;
  }

  /**
   * Apre un nuovo tab o aggiorna il tab corrente con l'archivio passato come parametro in ingresso.
   * @param archivio archivio da aprire
   */
  public openArchive(archivio: ExtendedArchiviView): void {
    const arch: Archivio = archivio as any as Archivio;
    let idAziende: number[] = [];
    idAziende.push(archivio.idAzienda.id);
    const usaGediInternauta$ = this.configurazioneService
      .getParametriAziende("usaGediInternauta", null, idAziende)
      .pipe(first());
    if (
      usaGediInternauta$ ||
      (this.utenteUtilitiesLogin.getUtente().utenteReale
        .idInquadramento as unknown as String) === "99"
    ) {
      if (
        ["Sposta", "Trasforma in fascicolo"].includes(
          this.operazioneOrganizza
        ) &&
        archivio.idArchivioRadice.id !== this.archivio.idArchivioRadice.id
      ) {
        this.archivioUtilsService.deletedArchiveSelection(arch.id);
      } else if (
        ["Sposta", "Trasforma in fascicolo"].includes(
          this.operazioneOrganizza
        ) &&
        archivio.idArchivioRadice.id === this.archivio.idArchivioRadice.id
      ) {
        this.archivioUtilsService.updatedArchiveSelection(arch);
      }
      this.navigationTabsService.addTabArchivio(archivio, true, false);
      // this.archivioUtilsService.updatedArchiveSelection(arch);
      this.appService.appNameSelection(
        "Fascicolo " +
          archivio.numerazioneGerarchica +
          " [" +
          archivio.idAzienda.aoo +
          "]"
      );
    }
  }

  /**
   * In base a operazioneOrganizza lancia la chiamata al Back End passandogli tutti i parametri necessari
   * e mostra un toast verde con messaggio positivo o rosso con la causa dell'errore relativamente all'esito
   * della chiamata, in fine chiama la resetOrganizzaPopup e nasconde il PopUp
   */
  public organizza(): void {
    this.rightContentProgressSpinner = true;
    switch (this.operazioneOrganizza) {
      case "Sposta":
        this.extendedArchivioService
          .spostaArchivio(
            this.archivio.id,
            this.archivioDestinazioneOrganizza.id,
            this.organizzaTarget.includes("fascicolo"),
            this.organizzaTarget.includes("contenuto")
          )
          .subscribe({
            next: (res: any) => {
              console.log("res", res);
              this.messageService.add({
                severity: "success",
                key: "ArchivioToast",
                summary: "OK",
                detail: "Archivio spostato con successo",
              });
              if (this.organizzaTarget.includes("contenuto")) {
                this.reloadDataDocList = true;
              }
              this.openArchive(res as ExtendedArchiviView);
            },
            error: (e: any) => {
              this.messageService.add({
                severity: "error",
                key: "ArchivioToast",
                summary: "Attenzione",
                detail: `Error, ` + e.error.message,
              });
            },
          })
          .add(() => {
            //Called when operation is complete (both success and error)
            this.resetOrganizzaPopup();
            this.rightContentProgressSpinner = false;
          });
        break;
      case "Copia":
        this.extendedArchivioService
          .copiaArchivio(
            this.archivio.id,
            this.archivioDestinazioneOrganizza.id,
            this.organizzaTarget.includes("fascicolo") ||
              this.organizzaTarget.includes("fascicoloAndContenuto"),
            this.organizzaTarget.includes("contenuto") ||
              this.organizzaTarget.includes("fascicoloAndContenuto")
          )
          .subscribe({
            next: (res: any) => {
              console.log("res", res);
              this.messageService.add({
                severity: "success",
                key: "ArchivioToast",
                summary: "OK",
                detail: "Archivio copiato con successo",
              });
              this.openArchive(res as ExtendedArchiviView);
            },
            error: (e: any) => {
              this.messageService.add({
                severity: "error",
                key: "ArchivioToast",
                summary: "Attenzione",
                detail: `Error, ` + e.error.message,
              });
            },
          })
          .add(() => {
            //Called when operation is complete (both success and error)
            this.resetOrganizzaPopup();
            this.rightContentProgressSpinner = false;
          });
        break;
      case "Duplica":
        this.extendedArchivioService
          .duplicaArchivio(
            this.archivio.id,
            this.organizzaTarget.includes("fascicolo"),
            this.organizzaTarget.includes("contenuto")
          )
          .subscribe({
            next: (res: any) => {
              console.log("res", res);
              this.messageService.add({
                severity: "success",
                key: "ArchivioToast",
                summary: "OK",
                detail: "Archivio duplicato con successo",
              });
              this.openArchive(res as ExtendedArchiviView);
            },
            error: (e: any) => {
              this.messageService.add({
                severity: "error",
                key: "ArchivioToast",
                summary: "Attenzione",
                detail: `Error, ` + e.error.message,
              });
            },
          })
          .add(() => {
            //Called when operation is complete (both success and error)
            this.resetOrganizzaPopup();
            this.rightContentProgressSpinner = false;
          });
        break;
      case "Trasforma in fascicolo":
        this.extendedArchivioService
          .rendiFascicolo(this.archivio.id)
          .subscribe({
            next: (res: any) => {
              console.log("res", res);
              this.messageService.add({
                severity: "success",
                key: "ArchivioToast",
                summary: "OK",
                detail: "Archivio reso fascicolo con successo",
              });
              this.openArchive(res as ExtendedArchiviView);
            },
            error: (e: any) => {
              this.messageService.add({
                severity: "error",
                key: "ArchivioToast",
                summary: "Attenzione",
                detail: `Error, ` + e.error.message,
              });
            },
          })
          .add(() => {
            //Called when operation is complete (both success and error)
            this.resetOrganizzaPopup();

            this.rightContentProgressSpinner = false;
          });
        break;
    }
  }

  /**
   * Ritorna la descrizione rapida di cosa fa ogni target sceglibile per le operazioni Sposta e Duplica
   * @param target il target per il quale devo restituire la descrizione
   * @returns string
   */
  /* public getDescrizioneAzioneTargetText(target: string): string{
    let res = "";
    switch(this.operazioneOrganizza){
      case "Sposta":
        switch(target){
          case "fascicolo":
            res = "Sposta la gerarchia e i suoi contenuti del fascicolo/subfascicolo all'interno di un fascicolo di destinazione."
            break;
          case "contenuto":
            res = "Sposta solo il contenuto del fascicolo/subfascicolo all'interno di uno di destinazione."
            break;
        }
        break;
      case "Duplica":
        switch(target){
          case "fascicolo":
            res = "Duplica solo la gerarchia."
            break;
          case "contenuto":
            res = "Duplica la gerarchia e il contenuto."
            break;
        }
        break;
    }
    return res;
  } */

  /**
   * Ripristina tutti i parametri relativi al PopUp
   * così da inizializzarlo e non lascare dati "sporchi" alla prossima apertura
   */
  public resetOrganizzaPopup(): void {
    this.organizzaTarget = [];
    this.operazioneOrganizza = null;
    this.archivioDestinazioneOrganizza = null;
    this.showOrganizzaPopUp = false;
  }

  public onCloseOrganizzaDialog(): void {
    this.resetOrganizzaPopup();
  }

  /**
   * Determina se il bottone Conferma può essere cliccato o deve essere disabilitato.
   * @returns true se ho inserito tutti i dati necessari altrimenti false
   */
  public canOrganizzare(): boolean {
    if (
      this.archivioDestinazioneOrganizza !== null &&
      this.organizzaTarget.length > 0 &&
      this.operazioneOrganizza !== null &&
      this.operazioneOrganizza !== "Trasforma in fascicolo" &&
      this.operazioneOrganizza !== "Duplica"
    ) {
      return true;
    }
    if (
      this.organizzaTarget.length > 0 &&
      this.operazioneOrganizza === "Duplica"
    ) {
      return true;
    }
    if (this.operazioneOrganizza === "Trasforma in fascicolo") {
      return true;
    }
    return false;
  }

  private pregressaArchivio(): void {
    // se è pregresso, il massimo che si può fare è visualizzare
    this.archivio.permessiEspliciti.forEach((pe) => {
      if (pe.bit > 2) pe.bit = 2;
    });
    this.pregresso = this.archivio.pregresso; //TODO: impedisci che sembri tutto chiuso
  }

  public ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.forEach((s) => s.unsubscribe());
    }
    this.subscriptions = [];
  }
}

export enum SelectButton {
  SOTTOARCHIVI = "SOTTOARCHIVI",
  DOCUMENTI = "DOCUMENTI",
  DETTAGLIO = "DETTAGLIO",
  CONTENUTO = "CONTENUTO",
}

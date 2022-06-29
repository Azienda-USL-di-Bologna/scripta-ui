import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Archivio, ArchivioDetail, ArchivioDiInteresse, ArchivioDiInteresseService, DecimalePredicato, ENTITIES_STRUCTURE, PermessoArchivio, StatoArchivio } from '@bds/ng-internauta-model';
import { MenuItem, MessageService } from 'primeng/api';
import { ArchiviListComponent } from '../archivi-list-container/archivi-list/archivi-list.component';
import { DocsListComponent } from '../docs-list-container/docs-list/docs-list.component';
import { CaptionConfiguration } from '../generic-caption-table/caption-configuration';
import { CaptionReferenceTableComponent } from '../generic-caption-table/caption-reference-table.component';
import { CaptionSelectButtonsComponent } from '../generic-caption-table/caption-select-buttons.component';
import { NewArchivoButton } from '../generic-caption-table/new-archivo-button';
import { SelectButtonItem } from '../generic-caption-table/select-button-item';
import { TabComponent } from '../navigation-tabs/tab.component';
import { DettaglioArchivioComponent } from './dettaglio-archivio/dettaglio-archivio.component';
import { RichiestaAccessoArchiviComponent } from './richiesta-accesso-archivi/richiesta-accesso-archivi.component';
import { ExtendedArchivioService } from './extended-archivio.service';
import { Table } from 'primeng/table';
import { AppComponent } from '../app.component';
import { FilterDefinition, FiltersAndSorts, FILTER_TYPES } from '@nfa/next-sdr';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators'
import { DatePipe } from '@angular/common';
import { NtJwtLoginService, UtenteUtilities } from '@bds/nt-jwt-login';

@Component({
  selector: 'app-archivio',
  templateUrl: './archivio.component.html',
  styleUrls: ['./archivio.component.scss']
})
export class ArchivioComponent implements OnInit, AfterViewInit, TabComponent, CaptionSelectButtonsComponent, CaptionReferenceTableComponent {
  private _archivio: Archivio;
  public captionConfiguration: CaptionConfiguration;
  public referenceTableComponent: CaptionReferenceTableComponent;
  public selectButtonItems: SelectButtonItem[];
  public selectedButtonItem: SelectButtonItem;
  public tipiDisponibili: String[];
  public permessiArchivio: PermessoArchivio[] = [];
  public colsResponsabili: any[];
  public newArchivoButton: NewArchivoButton;
  public contenutoDiviso = true;
  public archivioPreferito: boolean
  public utenteExistsInArchivioInteresse: boolean;
  private utenteArchivioDiInteresse: ArchivioDiInteresse;
  public subscriptions: Subscription[] = [];
  private utenteUtilitiesLogin: UtenteUtilities;


  get archivio(): Archivio { return this._archivio; }
  @Input() set data(data: any) {
    this.extendedArchivioService.getByIdHttpCall(
      data.archivio.id,
      ENTITIES_STRUCTURE.scripta.archivio.customProjections.CustomArchivioWithIdAziendaAndIdMassimarioAndIdTitolo)
      .subscribe((res: Archivio) => {
        this._archivio = res;
        console.log("Archivio nell'archivio component: ", this._archivio);
        setTimeout(() => {
          if (this.utenteUtilitiesLogin) {
            this.inizializeAll();
          }
        }, 0);
      });
    this.checkPreferito(data.archivio.id);
  }

  private _archivilist: ArchiviListComponent;
  public get archivilist() { return this._archivilist }
  @ViewChild('archivilist') set archivilist(content: ArchiviListComponent) {
    if (content) {
      this._archivilist = content;
    }
  }
  private _doclist: DocsListComponent;
  public get doclist() { return this._doclist }
  @ViewChild('doclist') set doclist(content: DocsListComponent) {
    if (content) {
      this._doclist = content;
    }
  }
  private _dettaglioarchivio: DettaglioArchivioComponent;
  public get dettaglioarchivio() { return this._dettaglioarchivio }
  @ViewChild('dettaglioarchivio') set dettaglioarchivio(content: DettaglioArchivioComponent) {
    if (content) {
      this._dettaglioarchivio = content;
    }
  }

  private _richiestaaccessoarchivi: RichiestaAccessoArchiviComponent;
  public get richiestaaccessoarchivi() { return this._richiestaaccessoarchivi }
  @ViewChild('richiestaaccessoarchivi') set richiestaaccessoarchivi(content: RichiestaAccessoArchiviComponent) {
    if (content) {
      this._richiestaaccessoarchivi = content;
    }
  }

  constructor(
    private extendedArchivioService: ExtendedArchivioService,
    private archivioDiInteresseService: ArchivioDiInteresseService,
    private appComponent: AppComponent,
    private messageService: MessageService,
    private datepipe: DatePipe,
    private loginService: NtJwtLoginService,
  ) {
    this.loginService.loggedUser$.pipe(first()).subscribe(
      (utenteUtilities: UtenteUtilities) => {
        this.utenteUtilitiesLogin = utenteUtilities;
        if (this.archivio) {
          this.inizializeAll();
        }
      }
    );
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    /* console.log(this.archivio.stato)*/
    //this.inizializeAll(); 
  }

  private inizializeAll(): void {
    this.buildSelectButtonItems(this.archivio);
    this.buildNewArchivioButton(this.archivio);
    if (this.archivio.stato === StatoArchivio.BOZZA) {
      this.selectedButtonItem = this.selectButtonItems.find(x => x.id === SelectButton.DETTAGLIO);
      this.setForDettaglio();
    } else {
      if (this.contenutoDiviso) {
        if (this.archivio.livello === 3) {
          this.selectedButtonItem = this.selectButtonItems.find(x => x.id === SelectButton.DOCUMENTI);
          this.setForDocumenti();
        } else {
          this.selectedButtonItem = this.selectButtonItems.find(x => x.id === SelectButton.SOTTOARCHIVI);
          this.setForSottoarchivi();
        }
      } else {
        this.selectedButtonItem = this.selectButtonItems.find(x => x.id === SelectButton.CONTENUTO);
        this.setForContenuto();
      }
    }
  }

  private setForSottoarchivi(): void {
    this.captionConfiguration = new CaptionConfiguration(true, true, true, false, this.archivio?.stato !== StatoArchivio.BOZZA && this.archivio?.livello < 3, true);
    this.referenceTableComponent = this.archivilist;
  }

  public setForContenuto(): void {
    this.captionConfiguration = new CaptionConfiguration(true, true, false, false, this.archivio?.stato !== StatoArchivio.BOZZA && this.archivio?.livello < 3, true);
    this.referenceTableComponent = this;
  }

  private setForDocumenti(): void {
    this.captionConfiguration = new CaptionConfiguration(true, true, true, true, false, true);
    this.referenceTableComponent = this.doclist;
  }

  private setForDettaglio(): void {
    this.captionConfiguration = new CaptionConfiguration(false, true, false, false, this.archivio?.stato !== StatoArchivio.BOZZA && this.archivio?.livello < 3, true);
    this.referenceTableComponent = {} as CaptionReferenceTableComponent;
  }

  /**
   * Gestione del cambio di contenuto richiesto dall'utente
   * Può voler vedere i sottoarchivi, i documenti o il dettaglio dell'archivio
   * @param event 
   */
  public onSelectButtonItemSelection(event: any): void {
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
          this.selectButtonItems.push(
            {
              id: SelectButton.SOTTOARCHIVI,
              label: "Sottofascicoli",
              disabled: this.archivio.stato === StatoArchivio.BOZZA
            }
          );
        }
        break;
      case 2:
        labelDati = "Dati del sottofascicolo";
        if (this.contenutoDiviso) {
          this.selectButtonItems.push(
            {
              id: SelectButton.SOTTOARCHIVI,
              label: "Inserti",
              disabled: this.archivio.stato === StatoArchivio.BOZZA
            }
          );
        }
        break;
      case 3:
        labelDati = "Dati dell'inserto";
        break;
    }

    if (this.contenutoDiviso) {
      this.selectButtonItems.push(
        {
          id: SelectButton.DOCUMENTI,
          label: "Documenti",
          disabled: this.archivio.stato === StatoArchivio.BOZZA || 
            !(this.archivio.permessiEspliciti.find(p => p.fk_idPersona.id === this.utenteUtilitiesLogin.getUtente().idPersona.id).bit > DecimalePredicato.PASSAGGIO)
        }
      );
    } else {
      this.selectButtonItems.push(
        {
          id: SelectButton.CONTENUTO,
          label: "Contenuto",
          disabled: this.archivio.stato === StatoArchivio.BOZZA
        }
      );
    }

    this.selectButtonItems.push(
      {
        id: SelectButton.DETTAGLIO,
        label: labelDati + (this.archivio.stato === StatoArchivio.BOZZA ? " (Bozza)" : "")
      }
    );
  }

  /**
   * 
   * @param archivio 
   */
  public buildNewArchivioButton(archivio: Archivio | ArchivioDetail): void {
    const aziendaItem: MenuItem = {
      label: this.archivio.idAzienda.nome,
      disabled: false,
      command: () => this.archivilist.newArchivio(this.archivio.idAzienda.id)
    } as MenuItem;

    switch (archivio.livello) {
      case 1:
        this.newArchivoButton = {
          tooltip: "Crea nuovo sottofascicolo",
          livello: 1,
          aziendeItems: [aziendaItem],
          hasPermessi: this.canCreateSottoarchivio()
        };
        break;
      case 2:
        this.newArchivoButton = {
          tooltip: "Crea nuovo inserto",
          livello: 2,
          aziendeItems: [aziendaItem],
          hasPermessi: this.canCreateSottoarchivio()
        };
        break;
    }
  }

  /**
   * Ritorna true se l'utente può creare il sottoarcivio e cioè se è responsabile/vicario o ha permesso di almeno modifica
   * @returns 
   */
  public canCreateSottoarchivio(): boolean {
    return this._archivio.permessiEspliciti.some(permessoArchivio => 
      permessoArchivio.fk_idPersona.id === this.utenteUtilitiesLogin.getUtente().idPersona.id
      &&
      permessoArchivio.bit >= DecimalePredicato.MODIFICA
    );
    /* let res = false;
    if (this.archivio.permessi) {
      const permessone = this._archivio.permessi.find(permesso => permesso.soggetto.id_provenienza == this.utenteUtilitiesLogin.getUtente().idPersona.id);
      if (permessone) {
        permessone.categorie.forEach(categoria => {
          categoria.permessi.forEach(permessoCategoria => {
            if (permessoCategoria.predicato === EnumPredicatoPermessoArchivio.ELIMINA 
                || permessoCategoria.predicato === EnumPredicatoPermessoArchivio.MODIFICA
                || permessoCategoria.predicato === EnumPredicatoPermessoArchivio.VICARIO
                || permessoCategoria.predicato === EnumPredicatoPermessoArchivio.RESPONSABILE) {
              res = true;
            }
          });
        });
      }
    }
    return res; */
  }

  /**
   * Metodo chiamato quando non ho cambiato archivio, ma esso è stato modificato, 
   * e alcune di queste modifiche le vogliamo "notare"
   * @param archivio 
   */
  public onUpdateArchivio(archivio: Archivio) {
    console.log("updateArchivio(archivio: Archivio)", archivio);
    this._archivio = archivio;
    this.inizializeAll();
    this.selectedButtonItem = this.selectButtonItems.find(x => x.id === SelectButton.DETTAGLIO);
    this.setForDettaglio();
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
  public applyFilterGlobal(event: any, matchOperation: string): void {
    this.archivilist.applyFilterGlobal(event, matchOperation);
    this.doclist.applyFilterGlobal(event, matchOperation);
  }
  public resetPaginationAndLoadData() {
    this.archivilist.resetPaginationAndLoadData();
    this.doclist.resetPaginationAndLoadData();
  }
  public clear() {
    this.archivilist.clear();
    this.doclist.clear();
  }
  public exportCsvInProgress = false;
  public exportCSV(dataTable: Table) {
    this.exportCsvInProgress = this.doclist.exportCsvInProgress;
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
    filterAndSort.addFilter(new FilterDefinition("idPersona.id", FILTER_TYPES.not_string.equals, this.appComponent.utenteConnesso.getUtente().idPersona.id));
    this.archivioDiInteresseService.getData(
      ENTITIES_STRUCTURE.scripta.archiviodiinteresse.standardProjections.ArchivioDiInteresseWithPlainFields,
      filterAndSort,
    ).subscribe((res: any) => {
      if (res.results[0]) {
        this.utenteArchivioDiInteresse = res.results[0];
        this.utenteExistsInArchivioInteresse = true;
        //console.log("Utente Archivio Di Interesse",this.utenteArchivioDiInteresse);      
        if (this.utenteArchivioDiInteresse.idArchiviPreferiti) {
          this.archivioPreferito = res.results[0].idArchiviPreferiti.includes(id);
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
      const archivioDiInteresseToSave: ArchivioDiInteresse = new ArchivioDiInteresse();
      if (this.utenteArchivioDiInteresse.idArchiviPreferiti.includes(this.archivio.id)) {
        this.utenteArchivioDiInteresse.idArchiviPreferiti = this.utenteArchivioDiInteresse.idArchiviPreferiti.filter(archivio => archivio !== this.archivio.id);
      } else {
        this.utenteArchivioDiInteresse.idArchiviPreferiti.push(this.archivio.id);
      }
      archivioDiInteresseToSave.version = this.utenteArchivioDiInteresse.version;
      archivioDiInteresseToSave.idArchiviPreferiti = this.utenteArchivioDiInteresse.idArchiviPreferiti;
      console.log("Utente Archivio Di Interesse", archivioDiInteresseToSave);
      this.subscriptions.push(this.archivioDiInteresseService.patchHttpCall(archivioDiInteresseToSave, this.utenteArchivioDiInteresse.id, null, null).subscribe({
        next: (res: ArchivioDiInteresse) => {
          this.archivioPreferito = !this.archivioPreferito;
          //console.log("Update archivio Preferito: ", res);
          this.utenteArchivioDiInteresse.version = res.version;
          let message: string;
          if (this.archivioPreferito) {
            message = `Aggiunto come preferito correttamente`
          } else {
            message = `Rimosso dai preferiti correttamente`
          }
          this.messageService.add({
            severity: "success",
            key: "ArchivioToast",
            summary: "OK",
            detail: message
          });
        },
        error: () => {
          this.messageService.add({
            severity: "error",
            key: "ArchivioToast",
            summary: "Attenzione",
            detail: `Error, contattare Babelcare`
          });
        }
      }));
    } else {
      this.addUserInArchivioDiInteresse();
    }
  }

  public addUserInArchivioDiInteresse() {
    const archivioDiInteresseToSave: ArchivioDiInteresse = new ArchivioDiInteresse();
    archivioDiInteresseToSave.idPersona = this.appComponent.utenteConnesso.getUtente().idPersona;
    archivioDiInteresseToSave.idArchiviFrequenti = [];
    archivioDiInteresseToSave.idArchiviRecenti = [];
    archivioDiInteresseToSave.idArchiviPreferiti = [];
    archivioDiInteresseToSave.idArchiviPreferiti.push(this.archivio.id);
    this.subscriptions.push(this.archivioDiInteresseService.postHttpCall(
      archivioDiInteresseToSave)
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
            detail: "Aggiunto come preferito correttamente"
          });
        },
        error: () => {
          this.messageService.add({
            severity: "error",
            key: "ArchivioToast",
            summary: "Attenzione",
            detail: `Error, contattare Babelcare`
          });
        }
      })
    );
  }
  public ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.forEach(
        s => s.unsubscribe()
      );
    }
    this.subscriptions = [];
  }
}

export enum SelectButton {
  SOTTOARCHIVI = "SOTTOARCHIVI",
  DOCUMENTI = "DOCUMENTI",
  DETTAGLIO = "DETTAGLIO",
  CONTENUTO = "CONTENUTO"
}

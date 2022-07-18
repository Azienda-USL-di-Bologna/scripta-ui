import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Archivio, ArchivioDetail, UtenteStruttura, UtenteStrutturaService, Struttura } from '@bds/ng-internauta-model';
import { OggettoneOperation, OggettonePermessiEntitaGenerator } from '@bds/nt-communicator';
import { FilterDefinition, PagingConf } from '@nfa/next-sdr';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { AzioniPossibili, EnumPredicatoPermessoArchivio, PermessiDettaglioArchivioService, PermessoTabella } from '../permessi-dettaglio-archivio.service';
// import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-permessi-persona',
  templateUrl: './permessi-persona.component.html',
  styleUrls: ['./permessi-persona.component.scss']
})  

export class PermessiPersonaComponent implements OnInit, OnDestroy {
  public utentiStruttura: UtenteStruttura[] = [];
  public strutturaSelezionata: Struttura;
  public strutture: Struttura[] = [];
  public predicati: EnumPredicatoPermessoArchivio[] = [];
  public permessoSelezionato: EnumPredicatoPermessoArchivio;
  public perms: PermessoTabella[] = [];
  public cols: any[];
  public exportColumns: any[];
  public selectedStruttura: Struttura;
  public additionalFilterComboUtenti: FilterDefinition[] = [];
  public inEditing: boolean = false;
  private subscriptions: Subscription[] = [];
  private permClone: { [s: number]: PermessoTabella; } = {};
  private pageConfNoCountNoLimit: PagingConf = { mode: "LIMIT_OFFSET_NO_COUNT", conf: { limit: 9999, offset: 0 } };
  private _archivio: Archivio | ArchivioDetail;
  //private lazyLoadFiltersAndSorts: FiltersAndSorts = new FiltersAndSorts();
  public livello: number;

  @ViewChild("dt", {}) private dt: Table;
  get archivio(): Archivio | ArchivioDetail { return this._archivio; }
  @Input() set archivio(archivio: Archivio | ArchivioDetail) {
    this._archivio = archivio;
    this.livello = archivio.livello
    this.perms = this.permessiDettaglioArchivioService.buildPermessoPerTabella(this.archivio, "persone");
  }
  public _loggedUserIsResponsbaileOrVicario: Boolean;
  get loggedUserIsResponsbaileOrVicario(): Boolean { return this._loggedUserIsResponsbaileOrVicario; }
  @Input() set loggedUserIsResponsbaileOrVicario(loggedUserIsResponsbaileOrVicario: Boolean) {
    this._loggedUserIsResponsbaileOrVicario = loggedUserIsResponsbaileOrVicario;
  }

  constructor(
    private permissionManagerService: PermessiDettaglioArchivioService,
    private messageService: MessageService,
    private utenteStrutturaService: UtenteStrutturaService,
    private permessiDettaglioArchivioService: PermessiDettaglioArchivioService) {
  }

  ngOnInit(): void {
   /*  this.cols = [
      { field: 'persona', header: 'Persona', class: 'persona-column' },
      { field: 'struttura', header: 'Struttura', class: 'struttura-column' },
      { field: 'permesso', header: 'Permesso', class: 'permesso-column' },
      { field: 'propaga', header: 'Propaga a sottolivelli', class: 'propaga-column' },
      { field: 'ereditato', header: 'Ereditato da sopralivello', class: 'ereditato-column' },
      //{ field: 'azione', header: 'Azione', class: 'azione-column' }
    ];
    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field })); */
    this.predicati = this.permessiDettaglioArchivioService.loadPredicati(true, false);
    this.subscriptions.push(this.permessiDettaglioArchivioService.archivioReloadPermessiEvent.subscribe((archivioReloadPermessi: boolean) => {
      if (archivioReloadPermessi) { 
        this.perms = this.permessiDettaglioArchivioService.buildPermessoPerTabella(this.archivio, "persone");
      }
     }));
  }

  ngOnDestroy() {
    if (this.subscriptions && this.subscriptions.length > 0) {
      this.subscriptions.forEach(s => s.unsubscribe());
      this.subscriptions = [];
    }
  }
  
  public onRowEditInit(perm: PermessoTabella) {
    this.strutture = [];
    this.loadStruttureRigaSelezionata(perm, perm.idProvenienzaSoggetto);
    this.permClone[perm.idProvenienzaSoggetto] = { ...perm };
    console.log(this.dt.editingRowKeys)
    for (const key in this.dt.editingRowKeys) {
      if (key !== perm.idProvenienzaSoggetto.toString()) {
        delete this.dt.editingRowKeys[key];
        if (key === "undefined") {
          this.perms.pop();
        }
      }
    }
  }

  /**
   * Metodo per caricare le strutture di afferenza del soggetto del permesso.
   * Serve per popolare la dropdown delle strutture
   * @param perm 
   */
  private loadStruttureRigaSelezionata(perm: PermessoTabella, idSoggetto: number) {
    this.subscriptions.push(this.permessiDettaglioArchivioService.loadStruttureOfPersona(idSoggetto, this._archivio.idAzienda.id)
      .subscribe(
        data => {
          if (data && data.results && data.page) {
            const utentiStruttura: UtenteStruttura[] = <UtenteStruttura[]>data.results;
            perm.veicolo = utentiStruttura.find((us: UtenteStruttura) => {
              return us.idStruttura.id === perm.idProvenienzaVeicolo
            })?.idStruttura;
            this.strutture = [];
            utentiStruttura.filter((us: UtenteStruttura) => us.attivo === true)
              .forEach((us: UtenteStruttura) => { this.strutture.push(us.idStruttura) });
          }
        }
      ));
  }

  /**
   * Metodo chiamato dal frontend per salvare il pemrmesso che sto inserindo o modficando
   * @param perm 
   * @param index 
   */
  public onRowEditSave(perm: PermessoTabella, index: number, operation: string) {
    /* Lo faccio sempre ma in realt� serve solo per le insert. 
      Perch� dentro a this.dt.editingRowKeys la chiave di una nuova riga � "undefined" e non matcha con idProvenienzaSoggetto 
      se lo setto subito alla scelta della persona
    */
    if (!!!perm.idProvenienzaSoggetto) {
      perm.idProvenienzaSoggetto = perm.soggetto.id; 
    }

    const oggettoToSave: OggettonePermessiEntitaGenerator =
      this.permessiDettaglioArchivioService.buildPermessoPerBlackbox(
        perm,
        operation === "ADD" || operation === "BAN" ? null : this._archivio.permessi,
        operation === "ADD" || operation === "BAN" || operation === "RESTORE" ? OggettoneOperation.ADD : OggettoneOperation.REMOVE,
        <AzioniPossibili>operation,
        this._archivio
      );
    this.subscriptions.push(
      this.permissionManagerService.managePermissionsAdvanced(oggettoToSave.getPermessiEntita())
        .subscribe({
          next: (res: any) => {
            this.messageService.add({
              severity: "success",
              summary: operation === "ADD" || operation ==="BAN" || operation==="RESTORE" ? "Permesso modificato" : "Permesso Eliminato",
              detail: operation === "ADD" || operation ==="BAN" || operation==="RESTORE" ? "E' stato modificato il permesso." : "E' stato eliminato il permesso."
            });
            
            if (operation === "REMOVE") {
              this.perms.splice(index, 1);
            } else {
              delete this.perms[perm.idProvenienzaSoggetto];
            }
            this.permessiDettaglioArchivioService.calcolaPermessiEspliciti(this.archivio);
            this.permessiDettaglioArchivioService.reloadPermessiArchivio(this.archivio);
          },
          error: () => {
            this.messageService.add({
              severity: "error",
              summary: "Errore nel backend",
              detail: "Non è stato possibile modificare il permesso."
            });
            this.onRowEditCancel(perm, index);
          }
        }
      )
    )
  }

  /**
   * funzione richiamata dall'html per ripristinare i dati della vecchia riga
   * @param perm 
   * @param index 
   */
  public onRowEditCancel(perm: PermessoTabella, index: number) {
    if (perm.idProvenienzaSoggetto) {
      this.perms[index] = this.permClone[perm.idProvenienzaSoggetto];
      delete this.permClone[perm.idProvenienzaSoggetto];
    } else { 
      this.perms.pop();
    }
  }
  
  /**
   * Metodo chiamato dal frontend quando l'utente sceglie sul nuovo permesso un utente
   * Si occupa inoltre di caricare le strutture dell'utente per metterle nella dropdown dell'entita veicolante
   * @param utenteStruttura 
   * @param perm 
   */
  public aggiungiPersonaStruttura(utenteStruttura: UtenteStruttura, permesso: PermessoTabella) {
    permesso.soggetto = utenteStruttura?.idUtente.idPersona;
    permesso.descrizioneSoggetto = utenteStruttura.idUtente.idPersona.descrizione;
    //permesso.idProvenienzaSoggetto = permesso.soggetto.id;

    permesso.veicolo = utenteStruttura.idStruttura;
    permesso.idProvenienzaVeicolo = utenteStruttura.idStruttura.id;
    permesso.descrizioneVeicolo = utenteStruttura.idStruttura.nome;

    this.loadStruttureRigaSelezionata(permesso, permesso.soggetto.id);
  }

  /**
   * Metodo chiamato dall'html per l'insertimento di un nuovo permesso
   */
  public addPermesso(): void {
    this.strutture = [];
    this.additionalFilterComboUtenti = this.permessiDettaglioArchivioService.filtraEntitaEsistenti(this._archivio.permessi, "persone");
    const newPermessoTabella = new PermessoTabella();
    this.perms.push(newPermessoTabella);
    this.dt.initRowEdit(newPermessoTabella);
  }
}

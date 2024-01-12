import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Archivio, ArchivioDetail, UtenteStruttura, UtenteStrutturaService, Struttura, PermessoEntitaStoredProcedure, StatoArchivio } from '@bds/internauta-model';
import { OggettoneOperation, OggettonePermessiEntitaGenerator } from '@bds/common-tools';
import { AdditionalDataDefinition, PagingConf } from '@bds/next-sdr';
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
  public additionalDataComboUtenti: AdditionalDataDefinition[] = [];
  public inEditing: boolean = false;
  private subscriptions: Subscription[] = [];
  private permClone: { [s: number]: PermessoTabella; } = {};
  private pageConfNoCountNoLimit: PagingConf = { mode: "LIMIT_OFFSET_NO_COUNT", conf: { limit: 9999, offset: 0 } };
  private _archivio: Archivio;
  //private lazyLoadFiltersAndSorts: FiltersAndSorts = new FiltersAndSorts();
  public livello: number;
  public isArchivioClosed = false;
  
  @ViewChild("dt", {}) private dt: Table;
  get archivio(): Archivio { return this._archivio; }
  @Input() set archivio(archivio: Archivio) {
    this._archivio = archivio;
    this.livello = archivio.livello;
    this.perms = this.permessiDettaglioArchivioService.buildPermessoPerTabella(this.archivio, "persone");
  }
  private _loggedUserIsResponsbaileOrVicario: Boolean;
  get loggedUserIsResponsbaileOrVicario(): Boolean { return this._loggedUserIsResponsbaileOrVicario; }
  @Input() set loggedUserIsResponsbaileOrVicario(loggedUserIsResponsbaileOrVicario: Boolean) {
    this._loggedUserIsResponsbaileOrVicario = loggedUserIsResponsbaileOrVicario;
  }
  private _isLoggedUserResponsabile: Boolean;
  get isLoggedUserResponsabile(): Boolean { return this._isLoggedUserResponsabile; }
  @Input() set isLoggedUserResponsabile(isLoggedUserResponsabile: Boolean) {
    this._isLoggedUserResponsabile = isLoggedUserResponsabile;
    console.log("isLoggedUserResponsabile: " + this.isLoggedUserResponsabile);
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
        this.inEditing = false;
        for (const key in this.dt.editingRowKeys) {
          delete this.dt.editingRowKeys[key];
          if (key === "undefined") {
            this.perms.shift();
          }
        }
        this.perms = this.permessiDettaglioArchivioService.buildPermessoPerTabella(this.archivio, "persone");
      }
     }));

     this.isArchivioClosed = this._archivio.stato === StatoArchivio.CHIUSO || this._archivio.stato === StatoArchivio.PRECHIUSO;
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
          this.perms.shift();
        }
      }
    }
  }

  /**
   * Metodo per caricare le strutture di afferenza del soggetto del permesso.
   * Serve per popolare la dropdown delle strutture
   * @param perm 
   */
  private loadStruttureRigaSelezionata(perm: PermessoTabella, idSoggetto: number): void {
    this.subscriptions.push(this.permessiDettaglioArchivioService.loadStruttureOfPersona(idSoggetto, this._archivio.idAzienda.id)
      .subscribe(
        data => {
          if (data && data.results && data.page) {
            const utentiStruttura: UtenteStruttura[] = <UtenteStruttura[]>data.results;
            this.strutture = [];
            utentiStruttura.filter((us: UtenteStruttura) => us.attivo === true)
              .forEach((us: UtenteStruttura) => { this.strutture.push(us.idStruttura) });
            perm.veicolo = utentiStruttura.find((us: UtenteStruttura) => {
              return us.idStruttura.id === perm.idProvenienzaVeicolo
            })?.idStruttura;
          }
        }
      ));
  }


  public getPermessiFiltratiPerSoggetto(oggettoni: PermessoEntitaStoredProcedure[], idProvenienzaSoggetto: number): PermessoEntitaStoredProcedure[] {
    const permessiPerSoggetto: PermessoEntitaStoredProcedure[] = [];
    oggettoni?.forEach((oggettone: PermessoEntitaStoredProcedure) => {
      if (oggettone.soggetto.id_provenienza === idProvenienzaSoggetto) {
        permessiPerSoggetto.push(oggettone);
      }
    })
    return permessiPerSoggetto.length > 0 ? permessiPerSoggetto : null;
  }

  /**
   * Metodo chiamato dal frontend per salvare il pemrmesso che sto inserindo o modficando
   * @param perm 
   * @param index 
   */
  public onRowEditSave(perm: PermessoTabella, index: number, operation: string) {
    this.permessiDettaglioArchivioService.loading = true;
    /* Lo faccio sempre ma in realt� serve solo per le insert. 
      Perch� dentro a this.dt.editingRowKeys la chiave di una nuova riga � "undefined" e non matcha con idProvenienzaSoggetto 
      se lo setto subito alla scelta della persona
    */
    if (!!!perm.idProvenienzaSoggetto) {
      perm.idProvenienzaSoggetto = perm.soggetto.id; 
    }

    const permessiDelSoggetto = this.getPermessiFiltratiPerSoggetto(this._archivio.permessi, perm.idProvenienzaSoggetto);    

    const oggettoToSave: OggettonePermessiEntitaGenerator =
      this.permessiDettaglioArchivioService.buildPermessoPerBlackbox(
        perm,
        permessiDelSoggetto,
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
            switch (this.livello) {
              case 3:
                // Ricalocolo permessi di inserto, padre e nonno
                this.permessiDettaglioArchivioService.calcolaPermessiEspliciti(this.archivio, false, true);
                break;
              case 2:
                if (this.archivio.numeroSottoarchivi === 0 || this.archivio.numeroSottoarchivi === null) {
                  // Ricalocolo permessi di sottofascicolo e padre
                  this.permessiDettaglioArchivioService.calcolaPermessiEspliciti(this.archivio, false, true);
                } else {
                  // Ricalcolo intera gerarchia
                  this.permessiDettaglioArchivioService.calcolaPermessiEspliciti(this.archivio, true, false);
                }
                break;
              case 1:
                // Ricalcolo intera gerarchia
                this.permessiDettaglioArchivioService.calcolaPermessiEspliciti(this.archivio, true, false);
                break;
            }
            
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
      this.perms.shift();
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
    this.additionalDataComboUtenti = this.permessiDettaglioArchivioService.filtraEntitaEsistenti(this._archivio.permessi, "persone");
    const newPermessoTabella = new PermessoTabella();
    this.perms.unshift(newPermessoTabella);
    this.dt.initRowEdit(newPermessoTabella);
  }
}

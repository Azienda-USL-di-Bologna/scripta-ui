import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Archivio, ArchivioDetail, Azienda, PermessoEntitaStoredProcedure, StatoArchivio, Struttura } from '@bds/internauta-model';
import {Table} from 'primeng/table';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AdditionalDataDefinition } from '@bds/next-sdr';
import { AzioniPossibili, EnumPredicatoPermessoArchivio, PermessiDettaglioArchivioService, PermessoTabella } from '../permessi-dettaglio-archivio.service';
import { OggettoneOperation, OggettonePermessiEntitaGenerator } from '@bds/common-tools';

@Component({
  selector: 'app-permessi-struttura',
  templateUrl: './permessi-struttura.component.html',
  styleUrls: ['./permessi-struttura.component.scss']
})
export class PermessiStrutturaComponent implements OnInit {
  public perms: PermessoTabella[] = [];
  //public cols: any[] = [];
  public _rolesToFilter: string[];
  public subscriptions: Subscription[] = [];
  private _archivio: Archivio | ArchivioDetail;
  public azienda: Azienda;
  public inEditing: boolean = false;
  public isArchivioClosed: boolean = false;
  public _dataRiferimento: Date = new Date();
  public predicati: EnumPredicatoPermessoArchivio[] = [];
  private permClone: { [s: number]: PermessoTabella; } = {};
  public additionalData: AdditionalDataDefinition[] = [];
  @ViewChild("dt", {}) private dt: Table;

  get archivio(): Archivio | ArchivioDetail { return this._archivio; }
  @Input() set archivio(archivio: Archivio | ArchivioDetail) {
    this._archivio = archivio;
    this.azienda = this._archivio.idAzienda;
    this.perms = this.permessiDettaglioArchivioService.buildPermessoPerTabella(this.archivio, "strutture");
    /* if (this.archivio.livello !== 1 && !this.cols.some(c => c.field === 'ereditato')) {
      this.cols.push({ field: 'ereditato', header: 'Ereditato', class: 'ereditato-column' });
    } else if (this.archivio.livello === 1 && !this.cols.some(c => c.field === 'ereditato')) {
      const index = this.cols.findIndex(c => c.field === 'ereditato');
      if (index !== -1) {
        this.cols.splice(index, 1);
      }
    } */
  }

  public _loggedUserIsResponsbaileOrVicario: Boolean;
  get loggedUserIsResponsbaileOrVicario(): Boolean { return this._loggedUserIsResponsbaileOrVicario; }
  @Input() set loggedUserIsResponsbaileOrVicario(loggedUserIsResponsbaileOrVicario: Boolean) {
    this._loggedUserIsResponsbaileOrVicario = loggedUserIsResponsbaileOrVicario;
  }
  constructor(
    private messageService: MessageService,
    private permessiDettaglioArchivioService: PermessiDettaglioArchivioService
  ) { }

  ngOnInit(
  ): void {

    /* this.cols = [
      { field: 'struttura', header: 'Struttura', class: 'struttura-column' },
      { field: 'permesso', header: 'Permesso', class: 'permesso-column' },
      { field: 'trasmetti', header: 'Trasmetti a strutture figlie', class: 'trasmetti-column' },
      { field: 'propaga', header: 'Propaga a sottolivelli', class: 'propaga-column' },
      
      //{ field: 'azione', header: 'Azione', class:'azione-column' }
    ];
    if (this.archivio.livello !== 1) {
      this.cols.push({ field: 'ereditato', header: 'Ereditato', class: 'ereditato-column' });
    } */
    this.predicati = this.permessiDettaglioArchivioService.loadPredicati(true, false);
    this.subscriptions.push(this.permessiDettaglioArchivioService.archivioReloadPermessiEvent.subscribe((archivioReloadPermessi: boolean) => {
      if (archivioReloadPermessi) { 
        this.inEditing = false;
        for (const key in this.dt.editingRowKeys) {
          delete this.dt.editingRowKeys[key];
          if (key === "undefined") {
            this.perms.pop();
          }
        }
        this.perms = this.permessiDettaglioArchivioService.buildPermessoPerTabella(this.archivio, "strutture");
      }
     }));
    if(this._archivio.stato == StatoArchivio.CHIUSO || this._archivio.stato == StatoArchivio.PRECHIUSO)
      this.isArchivioClosed = true;
    else
      this.isArchivioClosed = false; 
  }
 
  
    /**
   * Metodo chiamato dall'html per l'insertimento di un nuovo permesso
   */
     public addPermesso(): void {
      const newPermessoTabella = new PermessoTabella();
      this.additionalData = this.permessiDettaglioArchivioService.filtraEntitaEsistenti(this._archivio.permessi, "strutture");
      this.perms.push(newPermessoTabella);
      this.dt.initRowEdit(newPermessoTabella);
  }
  /**
   * funzione richiamata dall'html per settare i dati della struttura (soggetto) di un permesso
   * @param strutturaSelezionata 
   * @param permesso 
   */
  public strutturaSelezionataDaComboReceived(strutturaSelezionata: Struttura, permesso: PermessoTabella) {
    if (strutturaSelezionata) {
      permesso.soggetto = strutturaSelezionata;
      permesso.descrizioneSoggetto = permesso.soggetto.nome;
      // permesso.idProvenienzaSoggetto = permesso.soggetto.id;
    }
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
 * funzione richiamata dall'html per mettere la riga in editing mode e per clonare la riga
 * @param perm 
 */
  public onRowEditInit(perm: PermessoTabella) {
    this.predicati = this.permessiDettaglioArchivioService.loadPredicati(true, perm.ereditato);
    this.permClone[perm.idProvenienzaSoggetto] = { ...perm };
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
   * funzione richiamata dall'html per eliminare la riga e il relativo permesso
   * @param perm 
   * @param index 
   */
  public onRowDelete(perm:PermessoTabella, index: number) {
    const oggettoToDelete: OggettonePermessiEntitaGenerator = this.permessiDettaglioArchivioService.buildPermessoPerBlackbox(perm,
      this._archivio.permessi,
      OggettoneOperation.REMOVE,
      AzioniPossibili.REMOVE,
      this._archivio);
    
    this.permessiDettaglioArchivioService.managePermissionsAdvanced(oggettoToDelete.getPermessiEntita())
        .subscribe({
          next: (res: any) => {
            this.messageService.add({
              severity: "success",
              summary: "Permesso Eliminato",
              detail: "E' stato eliminato il permesso."
            });
            this.perms.splice(index, 1);
          },
          error: () => {
            this.messageService.add({
              severity: "error",
              summary: "Errore nel backend",
              detail: "Non � stato possibile eliminare il permesso."
            });
            this.onRowEditCancel(perm, index);
          }
        }
      )
  }
  /**
   * funzione richiamata dall'html per salvare il permesso appena aggiunto
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

    const permessiDelSoggetto = this.getPermessiFiltratiPerSoggetto(this._archivio.permessi, perm.idProvenienzaSoggetto);    

    const oggettoToSave: OggettonePermessiEntitaGenerator =
      this.permessiDettaglioArchivioService.buildPermessoPerBlackbox(
        perm, 
        operation === "ADD" || operation === "BAN" ? null : permessiDelSoggetto,
        operation === "ADD" || operation === "BAN" ? OggettoneOperation.ADD : OggettoneOperation.REMOVE,
        <AzioniPossibili>operation,
        this._archivio
      );
    this.subscriptions.push(
      this.permessiDettaglioArchivioService.managePermissionsAdvanced(oggettoToSave.getPermessiEntita())
        .subscribe({
          next: (res: any) => {
            this.messageService.add({
              severity: "success",
              summary: operation != "REMOVE" ? "Permesso modificato" : "Permesso Eliminato",
              detail: operation != "REMOVE" ? "E' stato modificato il permesso." : "E' stato eliminato il permesso."
            });
            if (operation === "REMOVE") {
              this.perms.splice(index, 1);
            } else {
              delete this.perms[perm.idProvenienzaSoggetto];
            }
            switch (this.archivio.livello) {
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
              detail: "Non � stato possibile modificare il permesso."
            });
            this.onRowEditCancel(perm, index);
          }
        }
      )
    )
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
}

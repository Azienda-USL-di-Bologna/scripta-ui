import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Archivio, ArchivioDetail, Azienda, Predicato, Struttura } from '@bds/ng-internauta-model';
import {Table} from 'primeng/table';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { EnumPredicatoPermessoArchivio, PermessiDettaglioArchivioService, PermessoTabella } from '../permessi-dettaglio-archivio.service';
import { OggettoneOperation, OggettonePermessiEntitaGenerator } from '@bds/nt-communicator';

@Component({
  selector: 'app-permessi-struttura',
  templateUrl: './permessi-struttura.component.html',
  styleUrls: ['./permessi-struttura.component.scss']
})
export class PermessiStrutturaComponent implements OnInit {
  public perms: PermessoTabella[] = [];
  public cols: any[];
  public _rolesToFilter: string[];
  public subscriptions: Subscription[] = [];
  private _archivio: Archivio | ArchivioDetail;
  public azienda: Azienda;
  public inEditing: boolean = false;
  public _dataRiferimento: Date = new Date();
  public predicati: EnumPredicatoPermessoArchivio[] = [];
  private permClone: { [s: number]: PermessoTabella; } = {};
  @ViewChild("dt", {}) private dt: Table;
  get archivio(): Archivio | ArchivioDetail { return this._archivio; }
  @Input() set archivio(archivio: Archivio | ArchivioDetail) {
    this._archivio = archivio;
    this.azienda = this._archivio.idAzienda;
    this.perms = this.permessiDettaglioArchivioService.buildPermessoPerTabella(this.archivio, "strutture");
  }
  constructor(
    private messageService: MessageService,
    private permissionManagerService: PermessiDettaglioArchivioService,
    private permessiDettaglioArchivioService: PermessiDettaglioArchivioService
  ) { }

  ngOnInit(): void {

    this.cols = [
      { field: 'struttura', header: 'Struttura', class:'struttura-column' },
      { field: 'permesso', header: 'Permesso', class:'permesso-column' },
      { field: 'trasmetti', header: 'Trasmetti a strutture figlie', class:'trasmetti-column' },
      { field: 'propaga', header: 'Propaga a sottolivelli', class:'propaga-column' },
      { field: 'ereditato', header: 'Ereditato', class:'ereditato-column' },
      { field: 'azione', header: 'Azione', class:'azione-column' }
    ];
    this.predicati = this.permessiDettaglioArchivioService.loadPredicati(true,false);
  }
 
  
    /**
   * Metodo chiamato dall'html per l'insertimento di un nuovo permesso
   */
     public addPermesso(): void {
      const newPermessoTabella = new PermessoTabella();
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
    const oggettoToDelete: OggettonePermessiEntitaGenerator = this.permessiDettaglioArchivioService.buildPermessoPerBlackbox(perm,this._archivio.permessi,OggettoneOperation.REMOVE,this._archivio);
    this.permissionManagerService.managePermissionsAdvanced(oggettoToDelete.getPermessiEntita())
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
    const oggettoToSave: OggettonePermessiEntitaGenerator =
      this.permessiDettaglioArchivioService.buildPermessoPerBlackbox(
        perm, 
        operation === "ADD" ? null : this._archivio.permessi,
        operation === "ADD" ? OggettoneOperation.ADD : OggettoneOperation.REMOVE,
        this._archivio
      );
    this.subscriptions.push(
      this.permissionManagerService.managePermissionsAdvanced(oggettoToSave.getPermessiEntita())
        .subscribe({
          next: (res: any) => {
            this.messageService.add({
              severity: "success",
              summary: operation === "ADD" ? "Permesso modificato" : "Permesso Eliminato",
              detail: operation === "ADD" ? "E' stato modificato il permesso." : "E' stato eliminato il permesso."
            });
            if (operation === "REMOVE") {
              this.perms.splice(index, 1);
            } else {
              delete this.perms[perm.idProvenienzaSoggetto];
            }
            this.permessiDettaglioArchivioService.calcolaPermessiEspliciti(this.archivio);
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

}

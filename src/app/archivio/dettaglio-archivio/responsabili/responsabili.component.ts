import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Archivio, ArchivioDetail, AttoreArchivio, AttoreArchivioService, ENTITIES_STRUCTURE, Persona, Ruolo, RuoloAttoreArchivio, Struttura, UtenteStruttura } from '@bds/internauta-model';
import { JwtLoginService, UtenteUtilities } from '@bds/jwt-login';
import { FilterDefinition, FiltersAndSorts, FILTER_TYPES, PagingConf, SortDefinition, SORT_MODES } from '@bds/next-sdr';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs/internal/Subscription';
import { PermessiDettaglioArchivioService } from '../permessi-dettaglio-archivio.service';

@Component({
  selector: 'app-responsabili',
  templateUrl: './responsabili.component.html',
  styleUrls: ['./responsabili.component.scss']
})
export class ResponsabiliComponent implements OnInit {
  private dictAttoriClonePerRipristino: { [s: number]: AttoreArchivio; } = {};
  private utenteUtilitiesLogin: UtenteUtilities;
  private _archivio: Archivio;
  private attoreArchivioProjection = ENTITIES_STRUCTURE.scripta.attorearchivio.standardProjections.AttoreArchivioWithIdPersonaAndIdStruttura;

  public responsabiliArchivi: AttoreArchivio[] = [];
  public subscriptions: Subscription[] = [];
  public ruoliEnum = RuoloAttoreArchivio;
  public ruoliList: { value: RuoloAttoreArchivio; label: string }[] = [];
  public struttureAttoreInEditing: Struttura[] = [];
  public inEditing: boolean = false;
  public ruoloAttoreLoggedUser: RuoloAttoreArchivio;
  
  @ViewChild("tableResponsabiliArchivi", {}) private dt: Table;
  

  // private pageConfNoCountNoLimit: PagingConf = { mode: "LIMIT_OFFSET_NO_COUNT", conf: { limit: 9999, offset: 0 } };


  get archivio(): Archivio { return this._archivio; }
  @Input() set archivio(archivio: Archivio) {
    this._archivio = archivio;
  }

  public _loggedUserIsResponsbaileOrVicario: Boolean;
  get loggedUserIsResponsbaileOrVicario(): Boolean { return this._loggedUserIsResponsbaileOrVicario; }
  @Input() set loggedUserIsResponsbaileOrVicario(loggedUserIsResponsbaileOrVicario: Boolean) {
    this._loggedUserIsResponsbaileOrVicario = loggedUserIsResponsbaileOrVicario;
  }
  
  constructor(
    private attoreArchivioService: AttoreArchivioService,
    private loginService: JwtLoginService,
    private messageService: MessageService,
    private permessiDettaglioArchivioService: PermessiDettaglioArchivioService) { 
    this.subscriptions.push(
      this.loginService.loggedUser$.subscribe(
        (utenteUtilities: UtenteUtilities) => {
          this.utenteUtilitiesLogin = utenteUtilities;
        }
      )
    );
  }

  ngOnInit(): void {
    // Setto i responsabili dell'archivio
    this.responsabiliArchivi = (this.archivio["attoriList"] as AttoreArchivio[])
      .filter(a => a.ruolo !== RuoloAttoreArchivio.CREATORE);
    // Mi salvo quale ruolo ha il loggeduser (se ce l'ha)
    this.ruoloAttoreLoggedUser = this.responsabiliArchivi.find(a => a.idPersona.id === this.utenteUtilitiesLogin.getUtente().idPersona.id)?.ruolo;
    if (this.ruoloAttoreLoggedUser === RuoloAttoreArchivio.RESPONSABILE) {
      this.ruoliList = [
        { value: RuoloAttoreArchivio.VICARIO, label: "Vicario"}, 
        { value: RuoloAttoreArchivio.RESPONSABILE_PROPOSTO, label: "Responsabile proposto"}];
    } else {
      this.ruoliList = [{ value: RuoloAttoreArchivio.VICARIO, label: "Vicario"}];
    }
  }


  /**
   * Metodo chiamato dall'html per l'insertimento di un nuovo permesso
   */
  public addResponsabile(): void {
    this.struttureAttoreInEditing = [];
    const newAttore = new AttoreArchivio();
    this.responsabiliArchivi.push(newAttore);
    this.dt.initRowEdit(newAttore);
  }

  /**
   * Funzione chiamata dall'html quando si inizia l'editing di una riga
   * @param attore 
   */
  public onRowEditInit(attore: AttoreArchivio) {
    this.struttureAttoreInEditing = [];
    this.loadStruttureAttore(attore);
    this.dictAttoriClonePerRipristino[attore.id] = { ...attore };
    for (const key in this.dt.editingRowKeys) {
      if (key !== attore.id.toString()) {
        delete this.dt.editingRowKeys[key];
        if (key === "undefined") {
          this.responsabiliArchivi.pop();
        }
      }
    }
  }

  /**
   * Funzione chiamata dall'html quando dopo creato/editato/cancellato un attore viene salvato
   */
  public onRowEditSave(attore: AttoreArchivio, index: number, operation: string) {
    const attoreToOperate = new AttoreArchivio();
    attoreToOperate.id = attore.id;
    attoreToOperate.idArchivio = { id: this.archivio.id } as Archivio;
    attoreToOperate.idPersona = { id: attore.idPersona.id } as Persona;
    attoreToOperate.idStruttura = { id: attore.idStruttura.id } as Struttura;
    attoreToOperate.ruolo = attore.ruolo;
    attoreToOperate.version = attore.version;
    switch (operation) {
      case "INSERT":
        this.subscriptions.push(this.attoreArchivioService.postHttpCall(attoreToOperate, this.attoreArchivioProjection)
          .subscribe({
            next: (attoreRes: AttoreArchivio) => {
              attore.version = attoreRes.version;
              attore.id = attoreRes.id;
              delete this.dictAttoriClonePerRipristino[attore.id];
              this.messageService.add({
                severity: "success",
                summary: "Nuovo responsabile",
                detail: "Nuovo responsabile inserito con successo"
              });
            },
            error: () => {
              this.messageService.add({
                severity: "error",
                summary: "Errore",
                detail: "Errore nell'inserimento del nuovo responsabile. Contattare Babelcare"
              });
              this.onRowEditCancel(attore, index);
            }
          })
        );
        break;
      case "UPDATE":
        this.subscriptions.push(this.attoreArchivioService.patchHttpCall(attoreToOperate, attoreToOperate.id, this.attoreArchivioProjection)
          .subscribe({
            next: (attoreRes: AttoreArchivio) => {
              attore.version = attoreRes.version;
              delete this.dictAttoriClonePerRipristino[attore.id];
              this.messageService.add({
                severity: "success",
                summary: "Aggiornamento responsabile",
                detail: "Responsabile aggiornato con successo"
              });
            },
            error: () => {
              this.messageService.add({
                severity: "error",
                summary: "Errore",
                detail: "Errore nell'aggiornamento del responsabile. Contattare Babelcare"
              });
              this.onRowEditCancel(attore, index);
            }
          })
        );
        break;
      case "DELETE":
        this.subscriptions.push(this.attoreArchivioService.deleteHttpCall(attoreToOperate.id)
          .subscribe({
            next: () => {
              this.responsabiliArchivi.splice(index, 1);
              this.messageService.add({
                severity: "success",
                summary: "Eliminazione responsabile",
                detail: "Responsabile eliminato con successo"
              });
            },
            error: () => {
              this.messageService.add({
                severity: "error",
                summary: "Errore",
                detail: "Errore nell'eliminazione del responsabile. Contattare Babelcare"
              });
              this.onRowEditCancel(attore, index);
            }
          })
        );
        break
    }
  }

  /**
   * Funzione chiamata dall'html per ripristinare i dati della vecchia riga
   * @param perm 
   * @param index 
   */
  public onRowEditCancel(attore: AttoreArchivio, index: number) {
    if (attore.id) {
      this.responsabiliArchivi[index] = this.dictAttoriClonePerRipristino[attore.id];
      delete this.dictAttoriClonePerRipristino[attore.id];
    } else { 
      this.responsabiliArchivi.pop();
    }
  }

  /**
   * Funzione chiamata dall'html quando l'utente sceglie un nuovo attore
   * Si occupa inoltre di caricare le strutture dell'utente per metterle nella dropdown dell'entita veicolante
   * @param utenteStruttura 
   * @param perm 
   */
   public onUtenteStrutturaSelected(utenteStruttura: UtenteStruttura, attore: AttoreArchivio) {
    attore.idPersona =  utenteStruttura.idUtente.idPersona;
    attore.idStruttura = utenteStruttura.idStruttura;
    console.log("attore", attore)
    this.loadStruttureAttore(attore);
  }

  /**
   * Carico le strutture dell'attore e popolo la variabile "struttureAttoreInEditing"
   * @param perm 
   * @param idSoggetto 
   */
  private loadStruttureAttore(attore: AttoreArchivio) {
    this.subscriptions.push(this.permessiDettaglioArchivioService.loadStruttureOfPersona(attore.idPersona.id, this._archivio.idAzienda.id)
      .subscribe(
        data => {
          if (data && data.results) {
            const utentiStruttura: UtenteStruttura[] = <UtenteStruttura[]> data.results;
            if (attore.idStruttura) {
              attore.idStruttura = utentiStruttura.find((us: UtenteStruttura) => {
                return us.idStruttura.id === attore.idStruttura.id
              })?.idStruttura;
            }
            this.struttureAttoreInEditing = [];
            utentiStruttura
              .filter((us: UtenteStruttura) => us.attivo === true)
              .forEach((us: UtenteStruttura) => { this.struttureAttoreInEditing.push(us.idStruttura) });
          }
        }
      ));
  }
}

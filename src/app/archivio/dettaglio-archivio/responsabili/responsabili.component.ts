import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AttivitaService, StatoArchivio } from '@bds/internauta-model';
import { Applicazione, ApplicazioneService, Archivio, Attivita, AttoreArchivio, AttoreArchivioService, Azienda, BaseUrls, BaseUrlType, ENTITIES_STRUCTURE, Persona, Ruolo, RuoloAttoreArchivio, Struttura, UtenteStruttura } from '@bds/internauta-model';
import { JwtLoginService, UtenteUtilities } from '@bds/jwt-login';
import { BatchOperation, BatchOperationTypes, NextSdrEntity, PagingConf, SortDefinition, SORT_MODES } from '@bds/next-sdr';
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
  public isArchivioClosed : boolean = false;
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
    private permessiDettaglioArchivioService: PermessiDettaglioArchivioService,
    private applicazioneService: ApplicazioneService,
    private router: Router,
    private attivitaService: AttivitaService) { 
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
    //voglio che i vicari che non hanno struttura, vengano mostrati con la struttura di appartenenza diretta/unificata
    this.responsabiliArchivi.forEach( resp => {
      if (resp.ruolo === "VICARIO"){
        this.loadStruttureAttore(resp);
      }})
    if(this._archivio.stato == StatoArchivio.CHIUSO || this._archivio.stato == StatoArchivio.PRECHIUSO)
      this.isArchivioClosed = true;
    else
      this.isArchivioClosed = false;
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
    console.log(attoreToOperate.id)
    attoreToOperate.idArchivio = { id: this.archivio.id } as Archivio;
    attoreToOperate.idPersona = { id: attore.idPersona.id } as Persona;
    attoreToOperate.idStruttura = attore.idStruttura;
    attoreToOperate.ruolo = attore.ruolo;
    attoreToOperate.version = attore.version;
    switch (operation) {
      case "INSERT":
        if(attoreToOperate.ruolo === "VICARIO") {
          //attoreToOperate.idStruttura = null;
          this.subscriptions.push(this.attoreArchivioService.postHttpCall(attoreToOperate, this.attoreArchivioProjection)
            .subscribe({
              next: (attoreRes: AttoreArchivio) => {
                attore.version = attoreRes.version;
                attore.id = attoreRes.id;
                delete this.dictAttoriClonePerRipristino[attore.id];
                this.messageService.add({
                  severity: "success",
                  summary: "Nuovo vicario",
                  detail: "Nuovo vicario inserito con successo"
                });
                this.permessiDettaglioArchivioService.calcolaPermessiEspliciti(this.archivio);
                this.permessiDettaglioArchivioService.reloadPermessiArchivio(this.archivio);
              },
              error: () => {
                this.messageService.add({
                  severity: "error",
                  summary: "Errore",
                  detail: "Errore nell'inserimento del nuovo vicario. Contattare Babelcare"
                });
                this.onRowEditCancel(attore, index);
              }
            })
          );
        } else if (attoreToOperate.ruolo === "RESPONSABILE_PROPOSTO") {
          const batchOperations: BatchOperation[] = [];
          
          const attoreArchivioBody= new AttoreArchivio();
          attoreArchivioBody.idArchivio= attoreToOperate.idArchivio;
          attoreArchivioBody.idPersona = attoreToOperate.idPersona;
          attoreArchivioBody.version = attoreToOperate.version;
          attoreArchivioBody.dataInserimentoRiga = attoreToOperate.dataInserimentoRiga;
          attoreArchivioBody.ruolo= RuoloAttoreArchivio.RESPONSABILE_PROPOSTO;
          attoreArchivioBody.idStruttura = attoreToOperate?.idStruttura;

          batchOperations.push({
            operation: BatchOperationTypes.INSERT,
            entityPath: BaseUrls.get(BaseUrlType.Scripta) + "/" + ENTITIES_STRUCTURE.scripta.attorearchivio.path,
            entityBody: attoreToOperate as NextSdrEntity,
            returnProjection: this.attoreArchivioProjection
          } as BatchOperation);

          const attivita = new Attivita();
          attivita.idApplicazione = {id: "scripta"} as Applicazione;
          attivita.idAzienda = {id: this.archivio.idAzienda.id} as Azienda;
          attivita.idPersona = {id:attoreToOperate.idPersona.id }as Persona;
          attivita.tipo = "attivita";
          attivita.oggetto = "Fascicolo: " + this.archivio.oggetto + " - " + this.archivio.numerazioneGerarchica;
          attivita.descrizione = "Proposta responsabilità";
          // const url = "/apridascrivania?id=" + this.archivio.id.toString();
          const url = [{
            url: "/nav/apridascrivania?id=" + this.archivio.id.toString(),
            label: "Accetta/Rifiuta"
          }];
          attivita.urls = JSON.stringify(url); //"[{\"url\" :" + "\" " + url +"\", \"label\": \"Accetta\"}]";
          attivita.aperta = false;
          attivita.provenienza = this.utenteUtilitiesLogin.getUtente().idPersona.descrizione;
          attivita.priorita = 3;
          attivita.oggettoEsterno = this.archivio.id.toString();
          attivita.tipoOggettoEsterno = "ArchivioInternauta";
          attivita.oggettoEsternoSecondario = this.archivio.id.toString();
          attivita.tipoOggettoEsternoSecondario = "ArchivioInternauta";
          attivita.datiAggiuntivi = {};
          

          batchOperations.push({
            operation: BatchOperationTypes.INSERT,
            entityPath: BaseUrls.get(BaseUrlType.Scrivania) + "/" + ENTITIES_STRUCTURE.scrivania.attivita.path,
            entityBody: attivita as NextSdrEntity,
            returnProjection: "AttivitaWithPlainFields"
          } as BatchOperation);
          this.subscriptions.push(
            this.attoreArchivioService.batchHttpCall(batchOperations).subscribe(
              (res: BatchOperation[]) => {
                res.forEach(a  => {
                  if (a.returnProjection === "AttoreArchivioWithIdPersonaAndIdStruttura")
                  {
                    const attoreArchivio : AttoreArchivio = a.entityBody as AttoreArchivio;
                    attore.version =attoreArchivio.version;
                    attore.id = attoreArchivio.id;
                  }
              })
                this.messageService.add({
                  severity: "success", 
                  summary: "Proposta responsabilità", 
                  detail: "La persona proposta come responsabile ha ricevuto una attività in scrivania"
                });
                this.permessiDettaglioArchivioService.calcolaPermessiEspliciti(this.archivio);
                this.permessiDettaglioArchivioService.reloadPermessiArchivio(this.archivio);
              }
            )
            
          )
        }
        break;
      case "UPDATE":
        if(attoreToOperate.ruolo === "VICARIO") {
          //attoreToOperate.idStruttura = null;
        }
        this.subscriptions.push(this.attoreArchivioService.patchHttpCall(attoreToOperate, attoreToOperate.id, this.attoreArchivioProjection)
        .subscribe({
          next: (attoreRes: AttoreArchivio) => {
            attore.version = attoreRes.version;
            delete this.dictAttoriClonePerRipristino[attore.id];
            this.messageService.add({
              severity: "success",
              summary: "Aggiornamento " + attoreToOperate.ruolo.toLowerCase().replace("_"," "),
              detail: attoreToOperate.ruolo.charAt(0) + attoreToOperate.ruolo.slice(1).toLowerCase().replace("_"," ") + " aggiornato con successo"
            });
            this.permessiDettaglioArchivioService.calcolaPermessiEspliciti(this.archivio);
            this.permessiDettaglioArchivioService.reloadPermessiArchivio(this.archivio);
          },
          error: () => {
            this.messageService.add({
              severity: "error",
              summary: "Errore",
              detail: "Errore nell'aggiornamento del " + attoreToOperate.ruolo.toLowerCase().replace("_"," ") + ". Contattare Babelcare"
            });
            this.onRowEditCancel(attore, index);
          }
        })
      );

      break;
      case "DELETE":
        if(attoreToOperate.ruolo === "RESPONSABILE_PROPOSTO"){
          const batchOperations: BatchOperation[] = [];
          batchOperations.push({
            operation: BatchOperationTypes.DELETE,
            entityPath: BaseUrls.get(BaseUrlType.Scripta) + "/" + ENTITIES_STRUCTURE.scripta.attorearchivio.path,
            id: attoreToOperate.id,
            entityBody: attoreToOperate as NextSdrEntity,
            returnProjection: this.attoreArchivioProjection
          } as BatchOperation);
          this.attoreArchivioService.batchHttpCall(batchOperations).subscribe(
            (res: BatchOperation[]) => {
              this.responsabiliArchivi.splice(index, 1);
              this.messageService.add({
                severity: "warn", 
                summary: "Eliminata proposta responsabilità", 
                detail: "Hai eliminato il responsabile proposto"
              });
              this.permessiDettaglioArchivioService.calcolaPermessiEspliciti(this.archivio);
              this.permessiDettaglioArchivioService.reloadPermessiArchivio(this.archivio);
              
            }
          
            )
           
        } else {
          this.subscriptions.push(this.attoreArchivioService.deleteHttpCall(attoreToOperate.id)
        .subscribe({
          next: () => {
            this.responsabiliArchivi.splice(index, 1);
            this.messageService.add({
              severity: "success",
              summary: "Eliminazione responsabile",
              detail: "Responsabile eliminato con successo"
            });
            this.permessiDettaglioArchivioService.calcolaPermessiEspliciti(this.archivio);
            this.permessiDettaglioArchivioService.reloadPermessiArchivio(this.archivio);
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
      }
      console.log(attoreToOperate)
        
      

        
     
     break;
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
    if (utenteStruttura) {
      attore.idPersona =  utenteStruttura.idUtente.idPersona;
      //if( attore.ruolo !== "VICARIO") {
        attore.idStruttura = utenteStruttura.idStruttura;
      //}
      console.log("attore", attore)
      this.loadStruttureAttore(attore);
    }
  }

  /**
   * Carico le strutture dell'attore e popolo la variabile "struttureAttoreInEditing"
   * @param perm 
   * @param idSoggetto 
   */
  private loadStruttureAttore(attore: AttoreArchivio) {
    this.subscriptions.push(this.permessiDettaglioArchivioService.loadStruttureOfPersona(attore.idPersona.id, this._archivio.idAzienda.id)
      .subscribe(
        (data: any) => {
          if (data && data.results) {
            const utentiStruttura: UtenteStruttura[] = <UtenteStruttura[]> data.results;
            if (attore.ruolo !== "VICARIO") {
              if (attore.idStruttura) {
                attore.idStruttura = utentiStruttura.find((us: UtenteStruttura) => {
                  return us.idStruttura.id === attore.idStruttura.id
                })?.idStruttura;
              }
              this.struttureAttoreInEditing = [];
              utentiStruttura
                .filter((us: UtenteStruttura) => us.attivo === true)
                .forEach((us: UtenteStruttura) => { this.struttureAttoreInEditing.push(us.idStruttura) });
            } else {
              // attore.idStruttura = utentiStruttura.find((us: UtenteStruttura) => {
              //   return us.idAfferenzaStruttura.id === 1 
              // })?.idStruttura;
              // if (attore.idStruttura == null) {
              //   attore.idStruttura = utentiStruttura.find((us: UtenteStruttura) => {
              //     return us.idAfferenzaStruttura.id === 9;
              //   })?.idStruttura;
              // }
              // this.struttureAttoreInEditing = []
              // this.struttureAttoreInEditing.push(attore.idStruttura);
              
              this.struttureAttoreInEditing = [];
              utentiStruttura
                .filter((us: UtenteStruttura) => us.attivo === true)
                .forEach((us: UtenteStruttura) => { this.struttureAttoreInEditing.push(us.idStruttura) });
                console.log("Strutture nelle onLoadStrutture",this.struttureAttoreInEditing)
            }
            
          }
        }
      ));
  }
}

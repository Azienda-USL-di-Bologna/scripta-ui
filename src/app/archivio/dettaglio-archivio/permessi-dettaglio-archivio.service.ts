import { DatePipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Archivio, ArchivioDetail, BaseUrlType, CategoriaPermessiStoredProcedure, EntitaStoredProcedure, ENTITIES_STRUCTURE, getInternautaUrl, PermessoEntitaStoredProcedure, PermessoStoredProcedure, Persona, Struttura, UtenteStrutturaService } from "@bds/internauta-model";
import { EntitaBlackbox, OggettoneOperation, OggettonePermessiEntitaGenerator, PermissionManagerService } from "@bds/common-tools";
import { ExtendedArchivioService } from "../extended-archivio.service";
import { MessageService } from "primeng/api";
import { Observable, Subject } from "rxjs";
import { BlackboxPermessiService } from "@bds/internauta-model";
import { AdditionalDataDefinition, FilterDefinition, FiltersAndSorts, FILTER_TYPES, PagingConf } from "@bds/next-sdr";


@Injectable({
  providedIn: "root"
})
export class PermessiDettaglioArchivioService extends PermissionManagerService {
  private APPLICATION: string = "GEDI_INTERNAUTA";
  private AMBITO: string = "SCRIPTA";
  private TIPO: string = "ARCHIVIO";
  private pageConfNoCountNoLimit: PagingConf = { mode: "LIMIT_OFFSET_NO_COUNT", conf: { limit: 9999, offset: 0 } };
  
  private _archivioReloadPermessi = new Subject<boolean>();

  public loading: boolean = false;

  constructor(
    protected _http: HttpClient,
    protected datepipe: DatePipe,
    private extendedArchivioService: ExtendedArchivioService,
    private messageService: MessageService,
    private blackboxPermessiService: BlackboxPermessiService,
    private utenteStrutturaService: UtenteStrutturaService,
    ) {
    super(_http, getInternautaUrl(BaseUrlType.Permessi), datepipe);
  }

  /******************************************************************
   * GETTER DEGLI OBSERVABLE
   */
   public get archivioReloadPermessiEvent(): Observable<boolean> {
    return this._archivioReloadPermessi.asObservable();
  }

  /******************************************************************
   * SETTER DEGLI OBSERVABLE
   */
  public archivioReloadPermessiSelection(archivioReloadPermessi: boolean) {
    this._archivioReloadPermessi.next(archivioReloadPermessi);
  }

  /**
   * Ricevo l'oggettone dei permessi dell'archivio e buildo le righe della tabella
   * che saranno di tipo PermessoTabella
   * @param oggettone 
   */
   public buildPermessoPerTabella(archivio: Archivio|ArchivioDetail, tabellaDiFiltro: string): PermessoTabella[] {
    const permessiTabella: PermessoTabella[] = [];
    const oggettoni: PermessoEntitaStoredProcedure[] = archivio.permessi;
    oggettoni?.forEach((oggettone: PermessoEntitaStoredProcedure) => {
      if (oggettone.soggetto.table === tabellaDiFiltro) {
        oggettone.categorie.forEach((categoria: CategoriaPermessiStoredProcedure) => {
          categoria.permessi.forEach((permesso: PermessoStoredProcedure) => {
            if (permesso.predicato != EnumPredicatoPermessoArchivio.RESPONSABILE && permesso.predicato != EnumPredicatoPermessoArchivio.VICARIO) {
              permessiTabella.push({
                idPermesso: permesso.id,
                descrizioneSoggetto: oggettone.soggetto.descrizione,
                idProvenienzaSoggetto: oggettone.soggetto.id_provenienza,
                descrizioneVeicolo: permesso.entita_veicolante ? permesso.entita_veicolante.descrizione : null,
                idProvenienzaVeicolo: permesso.entita_veicolante ? permesso.entita_veicolante.id_provenienza : null,
                predicato: permesso.id_permesso_bloccato ? permesso.permesso_bloccato.predicato : permesso.predicato,
                propaga: permesso.id_permesso_bloccato ? permesso.permesso_bloccato.propaga_oggetto : permesso.propaga_oggetto,
                trasmetti: permesso.id_permesso_bloccato ? permesso.permesso_bloccato.propaga_soggetto : permesso.propaga_soggetto,
                ereditato: permesso.id_permesso_bloccato ? true :permesso.virtuale_oggetto,
                soggettoEntita: oggettone.soggetto,
                oggettoEntita: oggettone.oggetto,
                veicoloEntita: permesso.entita_veicolante,
                permessoBlacbox: permesso,
                barrato: permesso.id_permesso_bloccato ? true : false
              } as PermessoTabella)
            }
          })
        })
      }
    });
    console.log(permessiTabella);
    this.filterByPermissionPriority(permessiTabella);
    return permessiTabella;
  }

  private filterByPermissionPriority(permessiTabella: PermessoTabella[]) {
    const tuttiPermessi = [...permessiTabella]
    tuttiPermessi.forEach((pt: PermessoTabella) => { 
      this.getMaxPermesso(permessiTabella.filter((ptf: PermessoTabella) => { ptf.soggetto === pt.soggetto }));
    })
  }

  private getMaxPermesso(permessiTabella: PermessoTabella[]): PermessoTabella {
    let permessoTabella: PermessoTabella = permessiTabella.filter((ptf: PermessoTabella) => { ptf.predicato === EnumPredicatoPermessoArchivio.BLOCCO })[0];
    if (permessoTabella) {
      return permessoTabella;
    }
    permessoTabella = permessiTabella.filter((ptf: PermessoTabella) => { ptf.predicato === EnumPredicatoPermessoArchivio.ELIMINA })[0];
    if (permessoTabella) {
      return permessoTabella;
    }
    permessoTabella = permessiTabella.filter((ptf: PermessoTabella) => { ptf.predicato === EnumPredicatoPermessoArchivio.MODIFICA })[0];
    if (permessoTabella) {
      return permessoTabella;
    }
    permessoTabella = permessiTabella.filter((ptf: PermessoTabella) => { ptf.predicato === EnumPredicatoPermessoArchivio.VISUALIZZA })[0];
    if (permessoTabella) {
      return permessoTabella;
    }
    return null;
  }

  /**
   * Torno un array di tipo EnumPredicatoPermessoArchivio che servirà a mostrare i predicati nella dropdown del permesso
   */
  public loadPredicati(conBlocco: boolean, permessoEreditato: boolean): EnumPredicatoPermessoArchivio[] {
    const predicati: EnumPredicatoPermessoArchivio[] = [];
    if (!permessoEreditato) {
      predicati.push(
        EnumPredicatoPermessoArchivio.VISUALIZZA,
        EnumPredicatoPermessoArchivio.MODIFICA,
        EnumPredicatoPermessoArchivio.ELIMINA
      );
    }
    if (conBlocco || permessoEreditato) {
      predicati.push(EnumPredicatoPermessoArchivio.BLOCCO);
    }
    return predicati;
  }


  /**
   * funzione che richiama PermessiCustomController
   * nella risposta setto nel parametro archivio.permessi poi faccio scattare l'osservable
   * i componenti permessi-struttura e permessi-persona richiameranno la buildpermessotabella
   * @param archivio 
   */
  public reloadPermessiArchivio(archivio: Archivio | ArchivioDetail) {
    this.loading = true;
    this.blackboxPermessiService.getPermessiArchivio(archivio.id).subscribe((permessi: PermessoEntitaStoredProcedure[]) => {
      archivio.permessi = permessi;
      this.archivioReloadPermessiSelection(true);
      this.loading = false;
    },
    err => {
      this.messageService.add({
        severity: "error",
        summary: "Errore",
        detail: "Errore nel caricamento dei permessi. Ricarica la pagina."
      });
    }
);
  }

  /**
   * Funzione che calcola i permessi esplciti a partire dalla blackbox.
   * 
   */
   public calcolaPermessiEspliciti(
      archivio: Archivio | ArchivioDetail, 
      calcolaPerInteraGerarchia: boolean,
      calcolaPerAntenati: boolean): void {
    if (calcolaPerInteraGerarchia) {
      // Si vuole calcolare i permessi di tutti gli arhcivi che appartengono alla stessa gerarchia di questo arhicivo
      this.extendedArchivioService.calcolaPermessiEsplicitiGerarchiaArchivio(archivio.fk_idArchivioRadice.id);
    } else {
      if (calcolaPerAntenati) {
        // Si vogliono calcolare i permessi dell'archivio e nel esistano caso del padre e del nonno
        this.extendedArchivioService.calcolaPermessiEsplicitiArchivio(archivio.id);
        if (archivio.fk_idArchivioPadre?.id) {
          this.extendedArchivioService.calcolaPermessiEsplicitiArchivio(archivio.fk_idArchivioPadre.id);
        }
        if (archivio.fk_idArchivioRadice?.id 
            && archivio.fk_idArchivioRadice?.id !== archivio.fk_idArchivioRadice?.id
            && archivio.fk_idArchivioRadice?.id !== archivio.id) {
          this.extendedArchivioService.calcolaPermessiEsplicitiArchivio(archivio.fk_idArchivioRadice.id);
        }
      } else {
        // Si vuole calcolare i permessi del solo arhcivio passato
        this.extendedArchivioService.calcolaPermessiEsplicitiArchivio(archivio.id);
      }
    }
  }

  /**
   * Creo un oggettone per il permessoTabella passato e lo ritorno
   * @param perm 
   */
  public buildPermessoPerBlackbox(
    permesso: PermessoTabella, //permesso sulla riga che ho premuto
    oggettone: PermessoEntitaStoredProcedure[], //oggettone da ridare alla blackbox per generare l'oggetto che modifica bene i permessi, contiene i soli permessi del soggetto su cui stiamo lavorando
    oggettoneOperation: OggettoneOperation, // operazione che sto svolgendo (modifica / aggiunta oppure rimozione )
    operazioneRichiesta: AzioniPossibili, // aggiunto per chiarezza di lettura mi serve a capire che operazione sto svolgendo sul frontend
    archivio: Archivio | ArchivioDetail): OggettonePermessiEntitaGenerator {
      oggettone = this.filtraVirtuali(oggettone);
      
      const permessoPerBlackbox: OggettonePermessiEntitaGenerator = new OggettonePermessiEntitaGenerator(operazioneRichiesta === AzioniPossibili.BAN ? null: oggettone );
      let entitaVeicolante: EntitaStoredProcedure = null;
      let soggetto: EntitaStoredProcedure = null;
      let predicato: EnumPredicatoPermessoArchivio = permesso.predicato;
      let trasmetti: boolean = permesso.trasmetti;
      if (permesso.veicolo) {
        permesso.idProvenienzaVeicolo = permesso.veicolo.id; // L'idProvenienzaVeicolo viene impostato alla creazione della riga, va pero preso quello dell'effettiva struttura scelta
        permesso.descrizioneVeicolo = permesso.veicolo.nome;
      }
      if (permesso.idProvenienzaVeicolo) {
        entitaVeicolante = permessoPerBlackbox.buildEntita(permesso.idProvenienzaVeicolo, EntitaBlackbox.STRUTTURE);
        soggetto = permessoPerBlackbox.buildEntita(permesso.idProvenienzaSoggetto, EntitaBlackbox.PERSONE);
      } else {
        soggetto = permessoPerBlackbox.buildEntita(permesso.idProvenienzaSoggetto, EntitaBlackbox.STRUTTURE);
      }
      let oggetto: EntitaStoredProcedure = permessoPerBlackbox.buildEntita(archivio.id, EntitaBlackbox.ARCHIVI);
      let id_permesso_bloccato: number = null; 
      if (operazioneRichiesta === AzioniPossibili.RESTORE) {
        //vuol dire che sto rimuovendo il blocco quindi 
        //mostro il permesso vecchio e rimuovo il permesso di NON_PROPAGA con OggettoneOperation.REMOVE cosi la BlackBox spegnerà quel permesso
        oggettoneOperation = OggettoneOperation.REMOVE;
        predicato = <EnumPredicatoPermessoArchivio>permesso.permessoBlacbox.predicato;
        id_permesso_bloccato = permesso.permessoBlacbox.id_permesso_bloccato;
        soggetto = permesso.permessoBlacbox.soggetto;
        oggetto = permesso.permessoBlacbox.oggetto;
        permesso.barrato = false;

      } else if (operazioneRichiesta === AzioniPossibili.BAN) {
        //vuol dire che voglio bloccare quel permesso quindi 
        //devo aggiungere un permesso di NON_PROPAGA(id_permesso_bloccato valorizzato) cosi da bloccare quel permesso 
        //(se piu avanti si vorra depotenziare il permesso o modificarlo si puo bloccare il permesso vecchio e leggere il predicato di questo ultimo)
        oggettoneOperation = OggettoneOperation.ADD;
        id_permesso_bloccato = permesso.idPermesso;
        predicato = EnumPredicatoPermessoArchivio.NON_PROPAGATO;
        trasmetti = entitaVeicolante === null;
      }

      if (oggettone) {
        /* Se sto editando un permesso che già c'era semplicemente modifcando il predicato o la struttura veicolante, allora voglio spegnere il vecchio e accenderne uno nuovo */
        const permessoPregresso = oggettone[0].categorie[0].permessi.find(p => 
          p.id === permesso.idPermesso && (
            p.predicato !== predicato 
            || p.entita_veicolante?.id_provenienza !== permesso.idProvenienzaVeicolo
            || p.propaga_soggetto !== permesso.trasmetti
            || p.propaga_oggetto !== permesso.propaga
        ));
        if (permessoPregresso) {
          permessoPerBlackbox.managePermessoOggettone(
            soggetto,
            oggetto,
            this.AMBITO,
            this.TIPO,
            [permessoPregresso],
            OggettoneOperation.REMOVE
          );
        }
      }
      const permessoDaAggiungereORimuovere: PermessoStoredProcedure = permessoPerBlackbox.buildPermesso(
        predicato,
        trasmetti, //il trasmetti ha senso per le strutture che trasmettono la conscenza del permesso ai figli è sempre false per le persone
        permesso.propaga, // E' il propaga verso gli archivi figli
        false, // virtuale
        this.APPLICATION,
        id_permesso_bloccato,
        null, // Attivo_dal lo passo null perché nel db c'è il tirgger che metterà now()
        null, // Attivo_al lo passo null cosi il db lo metterà a now() ?? 
        entitaVeicolante
      );
      permessoPerBlackbox.managePermessoOggettone(
        soggetto,
        oggetto,
        this.AMBITO,
        this.TIPO,
        [permessoDaAggiungereORimuovere],
        oggettoneOperation
      );
    return permessoPerBlackbox;
  }

  public filtraEntitaEsistenti(oggettonePassed: PermessoEntitaStoredProcedure[], tabella: string): AdditionalDataDefinition[]{
    var entitaEsistenti: AdditionalDataDefinition[] = [];
    var idEntitaEsistenti: number[] = [];
    oggettonePassed = this.filtraVirtuali(oggettonePassed);
    oggettonePassed?.forEach((oggettone: PermessoEntitaStoredProcedure) => {
      if (oggettone.soggetto.table === tabella) {
        oggettone.categorie.forEach((categoria: CategoriaPermessiStoredProcedure) => {
          categoria.permessi.forEach((permesso: PermessoStoredProcedure) => {
            if (permesso.predicato != EnumPredicatoPermessoArchivio.RESPONSABILE && permesso.predicato != EnumPredicatoPermessoArchivio.VICARIO && permesso.predicato != EnumPredicatoPermessoArchivio.RESPONSABILE_PROPOSTO) {
              // if (tabella === "persone"){
                idEntitaEsistenti.push(oggettone.soggetto.id_provenienza);
              // }else {
                // entitaEsistenti.push(new AdditionalDataDefinition("idStrutturaFiglia.nome", FILTER_TYPES.string.notEquals, oggettone.soggetto.descrizione) as AdditionalDataDefinition)
              // }
              
            }
          })
        })
      }
    });
    if(idEntitaEsistenti.length > 0){
      entitaEsistenti.push(new AdditionalDataDefinition("doNotInclude", idEntitaEsistenti.join(";").toString()) as AdditionalDataDefinition);
    }
    return entitaEsistenti;
  }

  /**
   * filtra i permessi virtuali 
   * @param oggettoni 
   */
  private filtraVirtuali(oggettoni: PermessoEntitaStoredProcedure[]): PermessoEntitaStoredProcedure[] {
    oggettoni?.forEach((oggettone: PermessoEntitaStoredProcedure) => {
      oggettone.categorie.forEach((categoria: CategoriaPermessiStoredProcedure) => {
        categoria.permessi = categoria.permessi.filter((permesso: PermessoStoredProcedure) => permesso.virtuale === false && permesso.virtuale_oggetto === false)
      })
    })
    return oggettoni;
  }

  /**
   * Torno l'observable che carica le strutture di una persona su una azienda
   * @param idPersona 
   * @param idAzienda 
   * @returns 
   */
  public loadStruttureOfPersona(idPersona: number, idAzienda: number, escludiUffici = false) {
    const initialFiltersAndSorts = new FiltersAndSorts();
    initialFiltersAndSorts.addFilter(new FilterDefinition("idUtente.idPersona.id", FILTER_TYPES.not_string.equals, idPersona));
    initialFiltersAndSorts.addFilter(new FilterDefinition("idStruttura.idAzienda.id", FILTER_TYPES.not_string.equals, idAzienda));
    if (escludiUffici) {
      initialFiltersAndSorts.addFilter(new FilterDefinition("idStruttura.ufficio", FILTER_TYPES.not_string.equals, false));
    }
    return this.utenteStrutturaService.getData(
      ENTITIES_STRUCTURE.baborg.utentestruttura.customProjections.UtenteStrutturaWithIdAfferenzaStrutturaCustom,
      initialFiltersAndSorts,
      null,
      this.pageConfNoCountNoLimit);
  }

  public proponiResponsabile(idArchivio: number, idPersonaAttore: number, idStrutturaAttore: number) {
    const apiUrl = getInternautaUrl(BaseUrlType.Scripta) + "/" + "proponiResponsabile"
    let formData: FormData = new FormData();
    formData.append("idArchivio", idArchivio.toString());
    formData.append("idPersonaAttore", idArchivio.toString());
    formData.append("idStrutturaAttore", idArchivio.toString());
    this._http.post(apiUrl, formData).subscribe();
  }
}

export class PermessoTabella {
  id: number;
  idPermesso: number;
  idProvenienzaSoggetto: number;
  soggetto: Persona | Struttura;
  descrizioneSoggetto: string;
  descrizioneVeicolo: string;
  idProvenienzaVeicolo: number;
  veicolo: Struttura;
  predicato: EnumPredicatoPermessoArchivio = EnumPredicatoPermessoArchivio.VISUALIZZA;
  propaga: boolean = true;
  trasmetti: boolean = false;
  ereditato: boolean = false;
  soggettoEntita:EntitaStoredProcedure;
  oggettoEntita: EntitaStoredProcedure;
  veicoloEntita: EntitaStoredProcedure;
  permessoBlacbox: PermessoStoredProcedure;
  barrato: boolean;
}

export enum EnumPredicatoPermessoArchivio {
  VISUALIZZA = "VISUALIZZA",
  MODIFICA = "MODIFICA",
  ELIMINA = "ELIMINA",
  BLOCCO = "BLOCCO",
  VICARIO = "VICARIO",
  RESPONSABILE = "RESPONSABILE",
  RESPONSABILE_PROPOSTO = "RESPONSABILE_PROPOSTO",
  NON_PROPAGATO = "NON_PROPAGATO"
}

export enum AzioniPossibili { 
  BAN = "BAN",
  RESTORE = "RESTORE",
  ADD = "ADD",
  REMOVE= "REMOVE"
}
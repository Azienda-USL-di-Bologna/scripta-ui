import { DatePipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Archivio, ArchivioDetail, CategoriaPermessiStoredProcedure, EntitaStoredProcedure, PermessoEntitaStoredProcedure, PermessoStoredProcedure, Persona, Struttura } from "@bds/ng-internauta-model";
import { BaseUrlType, EntitaBlackbox, getInternautaUrl, OggettoneOperation, OggettonePermessiEntitaGenerator, PermissionManagerService } from "@bds/nt-communicator";
import { ExtendedArchivioService } from "../extended-archivio.service";


@Injectable({
  providedIn: "root"
})
export class PermessiDettaglioArchivioService extends PermissionManagerService {
  private APPLICATION: string = "GEDI_INTERNAUTA";
  private AMBITO: string = "SCRIPTA";
  private TIPO: string = "ARCHIVIO";
  constructor(
    protected _http: HttpClient,
    protected datepipe: DatePipe,
    private extendedArchivioService: ExtendedArchivioService) {
    super(_http, getInternautaUrl(BaseUrlType.Permessi), datepipe);
  }

  /**
   * Ricevo l'oggettone dei permessi dell'archivio e buildo le righe della tabella
   * che saranno di tipo PermessoTabella
   * @param oggettone 
   */
   public buildPermessoPersonaPerTabella(oggettoni: PermessoEntitaStoredProcedure[], tabellaDiFiltro: string): PermessoTabella[] {
    let struttura: string = "";
    const permessiTabella: PermessoTabella[] = [];
    oggettoni?.forEach((oggettone: PermessoEntitaStoredProcedure) => {
      if (oggettone.soggetto.table === tabellaDiFiltro) {
        oggettone.categorie.forEach((categoria: CategoriaPermessiStoredProcedure) => {
          categoria.permessi.forEach((permesso: PermessoStoredProcedure) => {
            permessiTabella.push({
              descrizioneSoggetto: oggettone.soggetto.descrizione,
              idProvenienzaSoggetto: oggettone.soggetto.id_provenienza,
              descrizioneVeicolo: permesso.entita_veicolante ? permesso.entita_veicolante.descrizione : null,
              idProvenienzaVeicolo: permesso.entita_veicolante ? permesso.entita_veicolante.id_provenienza : null,
              predicato: permesso.predicato,
              propaga: permesso.propaga_oggetto,
              trasmetti: permesso.propaga_soggetto,
              ereditato: permesso.virtuale,
              soggettoEntita: oggettone.soggetto,
              oggettoEntita: oggettone.oggetto,
              veicoloEntita: permesso.entita_veicolante
            } as PermessoTabella)
          })
        }
        )
      }
    });
    console.log(permessiTabella);
    return permessiTabella;
  }

  /**
   * Torno un array di tipo EnumPermessoTabella che servirà a mostrare i predicati nella dropdown del permesso
   */
   public loadPredicati(conBlocco: boolean): EnumPermessoTabella[] {
    const predicati: EnumPermessoTabella[] = [];
    predicati.push(
      EnumPermessoTabella.VISUALIZZA,
      EnumPermessoTabella.MODIFICA,
      EnumPermessoTabella.ELIMINA
    );
    if (conBlocco) {
      predicati.push(EnumPermessoTabella.BLOCCO);
    }
    return predicati;
  }

  /**
   * Funzione temporanea che calcola i permessi esplciti a partire dalla blackbox.
   * Sarà proabbilmente eliminata quando avremo il servizo apposito
   */
   public calcolaPermessiEspliciti(archivio:Archivio|ArchivioDetail): void {
    this.extendedArchivioService.calcolaPermessiEspliciti(archivio.id);
  }

  /**
   * Creo un oggettone per il permessoTabella passato e lo ritorno
   * @param perm 
   */
  public buildPermessoPerBlackbox(
    permesso: PermessoTabella,
    oggettone: PermessoEntitaStoredProcedure[],
    oggettoneOperation: OggettoneOperation,
    archivio: Archivio | ArchivioDetail): OggettonePermessiEntitaGenerator {
    const permessoPerBlackbox: OggettonePermessiEntitaGenerator = new OggettonePermessiEntitaGenerator(oggettone);
      let entitaVeicolante: EntitaStoredProcedure = null;
      let soggetto: EntitaStoredProcedure
      if (permesso.idProvenienzaVeicolo) {
        entitaVeicolante = permessoPerBlackbox.buildEntita(permesso.idProvenienzaVeicolo, EntitaBlackbox.STRUTTURE);
        soggetto = permessoPerBlackbox.buildEntita(permesso.idProvenienzaSoggetto, EntitaBlackbox.PERSONE);
      } else {
      soggetto = permessoPerBlackbox.buildEntita(permesso.idProvenienzaSoggetto, EntitaBlackbox.STRUTTURE);
      }
    const oggetto: EntitaStoredProcedure = permessoPerBlackbox.buildEntita(archivio.id, EntitaBlackbox.ARCHIVI);
    const predicatoDaAggiungere: EnumPermessoTabella = permesso.predicato;
    const permessoDaAggiungereORimuovere: PermessoStoredProcedure = permessoPerBlackbox.buildPermesso(
      predicatoDaAggiungere,
      permesso.trasmetti,  // Il soggetto è una persona e quindi non è trasmettibile ai figli (strutture figlie)
      permesso.propaga, // E' il propaga verso gli arhcivi figli
      false,
      this.APPLICATION,
      null,
      null, // Attivo_dal lo passo null perché nel db c'è il tirgger che metterà now()
      null,
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
}

export class PermessoTabella { 
  id: number;
  idProvenienzaSoggetto: number;
  soggetto: Persona | Struttura;
  descrizioneSoggetto: string;
  descrizioneVeicolo: string;
  idProvenienzaVeicolo: number;
  veicolo: Struttura;
  predicato: EnumPermessoTabella = EnumPermessoTabella.VISUALIZZA;
  propaga: boolean = true;
  trasmetti: boolean = false;
  ereditato: boolean = false;
  soggettoEntita:EntitaStoredProcedure;
  oggettoEntita: EntitaStoredProcedure;
  veicoloEntita: EntitaStoredProcedure;
}

export enum EnumPermessoTabella {
  VISUALIZZA = "VISUALIZZA",
  MODIFICA = "MODIFICA",
  ELIMINA = "ELIMINA",
  BLOCCO = "BLOCCO"
}

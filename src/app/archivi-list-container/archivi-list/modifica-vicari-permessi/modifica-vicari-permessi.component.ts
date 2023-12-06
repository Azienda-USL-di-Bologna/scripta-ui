import { HttpParams } from "@angular/common/http";
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import {
  ConfigurazioneService,
  ENTITIES_STRUCTURE,
  ParametroAziende,
  Persona,
  Struttura,
  Utente,
  UtenteStruttura,
  UtenteStrutturaService,
} from "@bds/internauta-model";
import {
  FilterDefinition,
  FiltersAndSorts,
  FILTER_TYPES,
  NextSDREntityProvider,
} from "@bds/next-sdr";
import { ConfirmationService, MessageService } from "primeng/api";
import { Table } from "primeng/table";
import { Subscription, first } from "rxjs";
import { ArchiviListService } from "../archivi-list.service";
import { ExtendedArchiviView } from "../extendend-archivi-view";

@Component({
  selector: "modifica-vicari-permessi",
  templateUrl: "./modifica-vicari-permessi.component.html",
  styleUrls: ["./modifica-vicari-permessi.component.scss"],
})
export class ModificaVicariPermessiComponent {
  @Input() rowCountSelected: number;
  @Input() allRowsWasSelected: boolean;
  @Input() filtersAndSorts: FiltersAndSorts;
  @Input() lazyFiltersAndSorts: FiltersAndSorts;
  @Input() rowsNotSelectedWhenAlmostAllRowsAreSelected: number[];
  @Input() archivesSelected: ExtendedArchiviView[];
  @Input() serviceToGetData: NextSDREntityProvider;
  @Input() idAzienda: number;
  @Input() escludiArchiviChiusiFromAbilitazioniMassive: boolean;

  @Output() hideMe = new EventEmitter<Boolean>();

  public checked = true;
  public utenteCercato: UtenteStruttura;
  public vicariDaAggiungere: UtenteStruttura[] = [];
  public vicariDaRimuovere: UtenteStruttura[] = [];
  public permessiDaRimuovere: UtenteStruttura[] = [];
  public permessiDaAggiungere: PermessoPersona[] = [];
  public permessiDaAggiungereIds: PermessoPersonaOnlyId[] = [];

  private subscriptions: Subscription[] = [];
  private predicatiPermessiGestioneMassiva: EnumPredicatoPermessoPersona[] = [
    EnumPredicatoPermessoPersona.VISUALIZZA,
    EnumPredicatoPermessoPersona.MODIFICA,
    EnumPredicatoPermessoPersona.ELIMINA,
  ];

  @ViewChild("tableAggiuntaVicari", {}) private dtAddVicari: Table;
  @ViewChild("tableRimozioneVicari", {}) private dtRemoveVicari: Table;
  @ViewChild("tableRimozionePermessi", {}) private dtRemovePermessi: Table;
  @ViewChild("tableAggiuntaPermessi", {}) private dtAddPermessi: Table;

  constructor(
    private messageService: MessageService,
    private archiviListService: ArchiviListService,
    private confirmationService: ConfirmationService,
    private utenteStrutturaService: UtenteStrutturaService,
    private configurazioneService: ConfigurazioneService
  ) {}

  /* public addUtenteGestioneMassiva(currentTab: string) : void {
		let newUtente = new UtenteStruttura;
		switch (currentTab) {
			case "ADDVICARI":
				this.vicariDaAggiungere.unshift(newUtente);
				this.dtAddVicari.initRowEdit(newUtente);
				break;
			case "DELETEVICARI":
				this.vicariDaRimuovere.unshift(newUtente);
				this.dtRemoveVicari.initRowEdit(newUtente);
				break;
			case "DELETEPERMESSI":
				this.permessiDaRimuovere.unshift(newUtente);
				this.dtRemovePermessi.initRowEdit(newUtente);
				break;
			case "ADDPERMESSI":
				const newPermessoPersona = new PermessoPersona();
				this.permessiDaAggiungere.unshift(newPermessoPersona);
				this.dtAddPermessi.initRowEdit(newPermessoPersona);
				break;
		}
	} */

  ngOnInit(): void {
    // this.subscriptions.push(
    //   this.configurazioneService
    //     .getParametriAziende(
    //       "escludiArchiviChiusiFromAbilitazioniMassiveGedi",
    //       null,
    //       null
    //     )
    //     .subscribe((param: ParametroAziende[]) => {
    //       if (param) {
    //         param.forEach((parametro) => {
    //           if (
    //             JSON.parse(parametro.valore || false) &&
    //             parametro.idAziende.find((a) => a == this.idAzienda)
    //           ) {
    //             this.escludiArchiviChiusiFromAbilitazioniMassive = true;
    //           }
    //         });
    //       }
    //     })
    // );
  }

  /**
   * Torno un observable di utenteStruttura che carica le strutture a cui appartiene l'utente
   * @param utente
   * @param idAzienda
   * @returns
   */
  public loadStruttureOfUtente(utente: Utente, idAzienda: number) {
    const initialFiltersAndSorts = new FiltersAndSorts();
    initialFiltersAndSorts.addFilter(
      new FilterDefinition(
        "idUtente.id",
        FILTER_TYPES.not_string.equals,
        utente.id
      )
    );
    initialFiltersAndSorts.addFilter(
      new FilterDefinition(
        "idStruttura.idAzienda.id",
        FILTER_TYPES.not_string.equals,
        idAzienda
      )
    );
    initialFiltersAndSorts.addFilter(
      new FilterDefinition(
        "idStruttura.ufficio",
        FILTER_TYPES.not_string.equals,
        false
      )
    );
    return this.utenteStrutturaService.getData(
      ENTITIES_STRUCTURE.baborg.utentestruttura.customProjections
        .UtenteStrutturaWithIdAfferenzaStrutturaCustom,
      initialFiltersAndSorts,
      null
    );
  }

  public onSelectedNewUtenteGestioneMassiva(
    utenteStruttura: UtenteStruttura,
    index: number,
    currentTab: string
  ): void {
    if (utenteStruttura) {
      if (currentTab !== "ADDPERMESSI") {
        switch (currentTab) {
          case "ADDVICARI":
            this.vicariDaAggiungere.push(utenteStruttura);
            break;
          case "DELETEVICARI":
            this.vicariDaRimuovere.push(utenteStruttura);
            break;
          case "DELETEPERMESSI":
            this.permessiDaRimuovere.push(utenteStruttura);
            break;
        }
      } else {
        const permessoPersonaTemp: PermessoPersona = new PermessoPersona();
        permessoPersonaTemp.persona = utenteStruttura.idUtente.idPersona;
        permessoPersonaTemp.struttura = utenteStruttura.idStruttura;
        permessoPersonaTemp.predicato = EnumPredicatoPermessoPersona.VISUALIZZA;
        this.permessiDaAggiungere.push(permessoPersonaTemp);
      }
    }
    this.utenteCercato = new UtenteStruttura();
    setTimeout(() => {
      this.utenteCercato = null;
    }, 0);
  }

  public deleteRowUtenteGestioneMassiva(index: number, currentTab: string) {
    switch (currentTab) {
      case "ADDVICARI":
        this.vicariDaAggiungere.splice(index, 1);
        break;
      case "DELETEVICARI":
        this.vicariDaRimuovere.splice(index, 1);
        break;
      case "DELETEPERMESSI":
        this.permessiDaRimuovere.splice(index, 1);
        break;
      case "ADDPERMESSI":
        this.permessiDaAggiungere.splice(index, 1);
        break;
    }
  }

  public confermaAvvioGestioneMassivaPermessiVicari(event: Event): void {
    if (
      this.permessiDaAggiungere.length > 0 ||
      this.permessiDaRimuovere.length > 0 ||
      this.vicariDaAggiungere.length > 0 ||
      this.vicariDaRimuovere.length > 0
    ) {
      //this.avviaGestioneMassivaPermessiVicari();
      this.confirmationService.confirm({
        key: "conferma-gestione-massiva-vicari-permessi-popup",
        //target: event.target,
        message: this.buildConfirmMessage(),
        //icon: 'pi pi-exclamation-triangle',
        accept: () => {
          //confirm action
          this.avviaGestioneMassivaPermessiVicari();
          this.hideMe.emit(true);
        },
        reject: () => {
          //reject action
        },
      });
    } else {
      this.messageService.add({
        severity: "warn",
        key: "archiviListToast",
        summary: "Attenzione!",
        detail: `Si prega di compilare almeno un campo`,
        life: 6000,
      });
    }
  }

  private buildConfirmMessage(): string {
    let confirmMessage =
      "Le seguenti modifiche saranno effettuate sui fascicoli selezionati:<br>";
    if (this.vicariDaAggiungere && this.vicariDaAggiungere.length > 0) {
      confirmMessage += "<br><b>Vicari da aggiungere:</b><br>";
      this.vicariDaAggiungere.forEach(
        (v) => (confirmMessage += v.idUtente.idPersona.descrizione + "<br>")
      );
    }
    if (this.vicariDaRimuovere && this.vicariDaRimuovere.length > 0) {
      confirmMessage += "<br><b>Vicari da eliminare:</b><br>";
      this.vicariDaRimuovere.forEach(
        (v) => (confirmMessage += v.idUtente.idPersona.descrizione + "<br>")
      );
    }
    if (this.permessiDaAggiungere && this.permessiDaAggiungere.length > 0) {
      confirmMessage += "<br><b>Permessi da aggiungere:</b><br>";
      this.permessiDaAggiungere.forEach(
        (v) =>
          (confirmMessage +=
            v.persona.descrizione + ` (${v.predicato.toString()})<br>`)
      );
    }
    if (this.permessiDaRimuovere && this.permessiDaRimuovere.length > 0) {
      confirmMessage += "<br><b>Permessi da eliminare:</b><br>";
      this.permessiDaRimuovere.forEach(
        (v) => (confirmMessage += v.idUtente.idPersona.descrizione + "<br>")
      );
    }
    confirmMessage += "<br>Vuoi continuare?";
    return confirmMessage;
  }

  /* public confirmPermessi() {
		console.log("Permessi aggiungere:", this.permessiDaAggiungere);
		console.log("Predicati possibili:", this.predicatiPermessiGestioneMassiva);
	} */

  /* public onCloseGestioneMassiva() : void {
		this.permessiDaAggiungere = [];
		this.permessiDaRimuovere = [];
		this.vicariDaAggiungere = []
		this.vicariDaRimuovere = [];
		//this.inEditing = false;
	} */

  public svuotaCampi(): void {
    this.vicariDaAggiungere = [];
    this.vicariDaRimuovere = [];
    this.permessiDaAggiungere = [];
    this.permessiDaRimuovere = [];
  }

  /**
   *
   */
  public avviaGestioneMassivaPermessiVicari(): void {
    //this.rightContentProgressSpinner = true;
    const idsPersonaVicariAdd: number[] = [];
    const idsPersonaVicariDelete: number[] = [];
    const idsPersonaPermessiDelete: number[] = [];
    const idsPermessiAdd: PermessoPersonaOnlyId[] = [];
    this.vicariDaAggiungere.forEach((us) => {
      idsPersonaVicariAdd.push(us.idUtente.idPersona.id);
    });
    this.vicariDaRimuovere.forEach((us) => {
      idsPersonaVicariDelete.push(us.idUtente.idPersona.id);
    });
    this.permessiDaRimuovere.forEach((us) => {
      idsPersonaPermessiDelete.push(us.idUtente.idPersona.id);
    });
    this.permessiDaAggiungere.forEach((permesso) => {
      const permessoPersonaTemp: PermessoPersonaOnlyId =
        new PermessoPersonaOnlyId();
      permessoPersonaTemp.idPersona = permesso.persona.id;
      permessoPersonaTemp.predicato = permesso.predicato;
      permessoPersonaTemp.idStruttura = permesso.struttura.id;
      idsPermessiAdd.push(permessoPersonaTemp);
    });
    this.subscriptions.push(
      this.archiviListService
        .gestioneMassivaPermessiVicari(
          this.allRowsWasSelected
            ? this.buildFilterPerGestioneMassiva()
            : new HttpParams(),
          this.allRowsWasSelected
            ? this.rowsNotSelectedWhenAlmostAllRowsAreSelected
            : null,
          this.allRowsWasSelected
            ? null
            : this.archivesSelected.map((e) => e.id),
          idsPersonaVicariAdd,
          idsPersonaVicariDelete,
          idsPersonaPermessiDelete,
          idsPermessiAdd,
          this.idAzienda
        )
        .subscribe(
          (res) => {
            this.messageService.add({
              severity: "success",
              key: "archiviListToast",
              summary: "Cambio di permessi massivo",
              detail: `La richiesta è stata presa in carico e sarà svolta durante la notte; al termine dell'operazione riceverai una notifica sulla scrivania`,
              life: 6000,
            });
            //this.rightContentProgressSpinner = false;
          },
          (err) => {
            this.messageService.add({
              severity: "warn",
              key: "archiviListToast",
              summary: "Attenzione",
              detail: `Qualcosa è andato storto, se il problema persiste contattare BabelCare`,
            });
            //this.rightContentProgressSpinner = false;
          }
        )
    );
  }

  private buildFilterPerGestioneMassiva() {
    return this.serviceToGetData.buildQueryParams(
      null,
      null,
      this.filtersAndSorts,
      this.lazyFiltersAndSorts,
      null,
      null
    );
  }
}

export class PermessoPersona {
  persona: Persona;
  struttura: Struttura;
  predicato: EnumPredicatoPermessoPersona;
}

export class PermessoPersonaOnlyId {
  idPersona: number;
  idStruttura: number;
  predicato: EnumPredicatoPermessoPersona;
}

export enum EnumPredicatoPermessoPersona {
  VISUALIZZA = "VISUALIZZA",
  MODIFICA = "MODIFICA",
  ELIMINA = "ELIMINA",
}

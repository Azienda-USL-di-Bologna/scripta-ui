import { Component, EventEmitter, Output } from '@angular/core';
import { Azienda, CODICI_RUOLO, ENTITIES_STRUCTURE, Persona, Struttura, Utente, UtenteStruttura, UtenteStrutturaService } from '@bds/internauta-model';
import { JwtLoginService, UtenteUtilities } from '@bds/jwt-login';
import { FilterDefinition, FiltersAndSorts, FILTER_TYPES } from '@bds/next-sdr';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators'
import { ArchiviListService } from '../archivi-list.service';

@Component({
	selector: 'copia-trasferisci-abilitazioni',
	templateUrl: './copia-trasferisci-abilitazioni.component.html',
	styleUrls: ['./copia-trasferisci-abilitazioni.component.scss']
})
export class CopiaTrasferisciAbilitazioniComponent {
  @Output() hideMe = new EventEmitter<Boolean>();

	public operationType: string;
	public utenteCercato: UtenteStruttura;
	public aziendeDoveLoggedUserIsAg: Azienda[] = [];
	public idAziendeDoveLoggedUserIsAG: number[] = [];
	public struttureSelezionabili: Struttura[] = [];
	public showSvuotaButton = false;

	public utenteStrutturaSorgente: UtenteStruttura;
	public utenteStrutturaDestinazione: UtenteStruttura;

	public aziendaDiRiferimento: Azienda;
	private personaSorgente: Persona;
	private personaDestinazione: Persona;
	private strutturaDestinazione: Struttura;
	
  private subscriptions: Subscription[] = [];
  
  constructor(
		private loginService: JwtLoginService,
		private messageService: MessageService,
		private archiviListService: ArchiviListService,
		private confirmationService: ConfirmationService,
		private utenteStrutturaService: UtenteStrutturaService
	) {
		this.subscriptions.push(this.loginService.loggedUser$.pipe(first()).subscribe(
      (utenteUtilities: UtenteUtilities) => {
				if (!utenteUtilities.isAG()) {
					this.hideMe.emit(true);
				} else {
					utenteUtilities.getUtente().aziende.forEach(a => {
						if (utenteUtilities.hasRole(CODICI_RUOLO.AG, a.codice)) {
							this.aziendeDoveLoggedUserIsAg.push(a);
							this.idAziendeDoveLoggedUserIsAG.push(a.id);
						}
					});
					this.aziendaDiRiferimento = this.aziendeDoveLoggedUserIsAg[0];
				}
      }
    ));
  }

	public onChangeAzienda(azienda: Azienda): void {
		this.aziendaDiRiferimento = azienda;
		this.svuotaCampi();
	}

	public onSelectedPersonaSorgente(utenteStruttura: UtenteStruttura): void {
		this.personaSorgente = utenteStruttura?.idUtente.idPersona;
		if (this.personaSorgente) this.showSvuotaButton = true;
	}

	public onSelectedPersonaDestinazione(utenteStruttura: UtenteStruttura): void {
		this.personaDestinazione = utenteStruttura.idUtente.idPersona;
		if (this.personaDestinazione) this.showSvuotaButton = true;
		this.strutturaDestinazione = null;
		this.struttureSelezionabili = [];

		// Popolo la lista di struttre selezionabili 
		this.subscriptions.push(this.loadStruttureOfUtente(utenteStruttura.idUtente, this.aziendaDiRiferimento.id).subscribe( 
			(data: any) => {
				if (data && data.results) {
					const utentiStruttura: UtenteStruttura[] = <UtenteStruttura[]> data.results;
					// Riempo l'array delle strutture selezionabili per l'utente
					utentiStruttura.forEach((us: UtenteStruttura) => {
						if (us.id === utenteStruttura.id) {
							this.strutturaDestinazione = us.idStruttura;
						}
						this.struttureSelezionabili.push(us.idStruttura) 
					});
				}
			}
		));
	}

	public onChangeStruttura(struttura: Struttura): void {
		this.strutturaDestinazione = struttura;
	}

	/**
	 * Torno un observable di utenteStruttura che carica le strutture a cui appartiene l'utente
	 * @param utente 
	 * @param idAzienda 
	 * @returns 
	 */
	 public loadStruttureOfUtente(utente: Utente, idAzienda: number) {
		const initialFiltersAndSorts = new FiltersAndSorts();
		initialFiltersAndSorts.addFilter(new FilterDefinition("idUtente.id", FILTER_TYPES.not_string.equals, utente.id));
		initialFiltersAndSorts.addFilter(new FilterDefinition("idStruttura.idAzienda.id", FILTER_TYPES.not_string.equals, idAzienda));
		initialFiltersAndSorts.addFilter(new FilterDefinition("idStruttura.ufficio", FILTER_TYPES.not_string.equals, false));
		return this.utenteStrutturaService.getData(
		  ENTITIES_STRUCTURE.baborg.utentestruttura.customProjections.UtenteStrutturaWithIdAfferenzaStrutturaCustom,
		  initialFiltersAndSorts,
		  null);
  }

	/**
	 * 
	 */
	public confermaCopiaTrasferisciPermessi(): void {
		this.confirmationService.confirm({
			key: "conferma-copia-trasferisci-abilitazioni-popup",
			target: event.target,
			message: `${this.personaDestinazione.descrizione} accederà ai fascicoli ora accessibili a ${this.personaSorgente.descrizione}. Vuoi continuare?`, //in ${this.strutturaUtenteSelectedGestioneMassiva.nome}
			icon: 'pi pi-exclamation-triangle',
			accept: () => {
					//confirm action
					this.avviaCopiaTrasferimentoAbilitazioni();
					this.hideMe.emit(true);
			},
			reject: () => {
					//reject action
			}
		});
	}

	private avviaCopiaTrasferimentoAbilitazioni(): void {
		this.subscriptions.push(this.archiviListService.copiaTrasferimentoAbilitazioni(
				this.operationType,
				this.aziendaDiRiferimento.id,
				this.personaSorgente.id,
				this.personaDestinazione.id,
				this.strutturaDestinazione.id
			).subscribe(
				res => {
					this.messageService.add({
						severity: "success",
						key: "archiviListToast",
						summary: "Copia/Trasferisci abilitazioni",
						detail: `La richiesta è stata presa in carico e sarà svolta durante la notte; al termine dell'operazione riceverai una notifica sulla scrivania`,
						life: 6000
					});
					//this.rightContentProgressSpinner = false;
					
				},
				err => {
					this.messageService.add({
						severity: "warn",
						key: "archiviListToast",
						summary: "Attenzione",
						detail: `Qualcosa è andato storto, se il problema persiste contattare BabelCare`
					});
					//this.rightContentProgressSpinner = false;
				}
			));
	}

	public svuotaCampi(): void {
		this.utenteStrutturaSorgente = new UtenteStruttura();
		this.utenteStrutturaDestinazione = new UtenteStruttura();
		setTimeout(() => {
			this.utenteStrutturaSorgente = null;
			this.utenteStrutturaDestinazione = null;
		}, 0);
    this.personaSorgente = null;
		this.personaDestinazione = null;
		this.strutturaDestinazione = null;
		this.struttureSelezionabili = [];
    this.showSvuotaButton = false;
  }
}

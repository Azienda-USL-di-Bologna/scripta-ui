import { HttpParams } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { ENTITIES_STRUCTURE, Struttura, Utente, UtenteStruttura, UtenteStrutturaService } from '@bds/internauta-model';
import { FilterDefinition, FiltersAndSorts, FILTER_TYPES, NextSDREntityProvider } from '@bds/next-sdr';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ArchiviListService } from '../archivi-list.service';
import { ExtendedArchiviView } from '../extendend-archivi-view';

@Component({
	selector: 'sostituzione-responsabile',
	templateUrl: './sostituzione-responsabile.component.html',
	styleUrls: ['./sostituzione-responsabile.component.scss']
})
export class SostituzioneResponsabileComponent {

  private utenteSelectedGestioneMassiva : UtenteStruttura;
	private strutturaUtenteSelectedGestioneMassiva : Struttura;
	private struttureUtenteSelectableGestioneMassiva : Struttura[] = [];
	private checked = true;
	private isUtenteSelectedGestioneMassiva = false;
	private isStrutturaSelectedGestioneMassiva = false;
	private isReset = false;
	private showSvuotaButton = false;
  private subscriptions: Subscription[] = [];

  @Input() rowCountSelected: number;
  @Input() allRowsWasSelected: boolean;
  @Input() filtersAndSorts: FiltersAndSorts;
  @Input() lazyFiltersAndSorts: FiltersAndSorts;
  @Input() rowsNotSelectedWhenAlmostAllRowsAreSelected: number[];
  @Input() archivesSelected: ExtendedArchiviView[];
  @Input() serviceToGetData: NextSDREntityProvider;
  @Input() lastAziendaFilterValue: number[];
  @Input() idStrutturaFiltro: number;

  constructor(
		private messageService: MessageService,
		private archiviListService: ArchiviListService,
		private confirmationService: ConfirmationService,
		private utenteStrutturaService: UtenteStrutturaService
	) { }

  /**
	 * metodo chiamato dall'html alla selezione dell'utente responsabile
	 * @param utenteStruttura 
	 */
	public onSelectedNewResponsabileGestioneMassiva(utenteStruttura: UtenteStruttura) {
		this.isUtenteSelectedGestioneMassiva = true;
		this.struttureUtenteSelectableGestioneMassiva = [];
		this.strutturaUtenteSelectedGestioneMassiva = null;
		this.utenteSelectedGestioneMassiva = utenteStruttura;
		
		// Popolo la lista di struttre selezionabili 
		this.subscriptions.push(this.loadStruttureOfUtente(utenteStruttura.idUtente, this.lastAziendaFilterValue[0]).subscribe( 
			(data: any) => {
				if (data && data.results) {
					const utentiStruttura: UtenteStruttura[] = <UtenteStruttura[]> data.results;
					// Riempo l'array delle strutture selezionabili per l'utente
					utentiStruttura.forEach((us: UtenteStruttura) => {
						if (us.id === utenteStruttura.id) {
							this.strutturaUtenteSelectedGestioneMassiva = us.idStruttura;
							this.isStrutturaSelectedGestioneMassiva = true;
						}
						this.struttureUtenteSelectableGestioneMassiva.push(us.idStruttura) 
					});
					this.showSvuotaButton = true;
				}
			}
		));
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

  private avviaSostituzioneResponsabileMassiva() {
		//this.rightContentProgressSpinner = true;
		//this.showGestioneMassivaResponsabile = false;
		this.subscriptions.push(this.archiviListService.gestioneMassivaResponsabile(
			this.allRowsWasSelected ? this.buildFilterPerGestioneMassiva() : new HttpParams(),
			this.allRowsWasSelected ? this.rowsNotSelectedWhenAlmostAllRowsAreSelected : null,
			this.allRowsWasSelected ? null : this.archivesSelected.map(e => e.id),
			this.utenteSelectedGestioneMassiva.idUtente.idPersona.id,
			this.strutturaUtenteSelectedGestioneMassiva.id,
			this.lastAziendaFilterValue[0]).subscribe(
				res => {
					this.messageService.add({
						severity: "success",
						key: "archiviListToast",
						summary: "Cambio di responsabile massivo",
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

  private buildFilterPerGestioneMassiva() {
		this.lazyFiltersAndSorts.filters = this.lazyFiltersAndSorts.filters.filter(f => f.field != "livello");
		this.filtersAndSorts.addFilter(new FilterDefinition("livello", FILTER_TYPES.not_string.equals, 1));
		return this.serviceToGetData.buildQueryParams(null, null, this.filtersAndSorts, this.lazyFiltersAndSorts, null, null);
	}

  public confermaAvvioSostituzioneResponsabileMassiva(event: Event) {
		if (this.idStrutturaFiltro !== this.strutturaUtenteSelectedGestioneMassiva.id) {
			this.confirmationService.confirm({
					key: "conferma-sotitutuzione-responsabile-massivo-popup",
					target: event.target,
					message: `I fascicoli selezionati cambieranno struttura. Vuoi continuare?`, //in ${this.strutturaUtenteSelectedGestioneMassiva.nome}
					icon: 'pi pi-exclamation-triangle',
					accept: () => {
							//confirm action
							this.avviaSostituzioneResponsabileMassiva();
					},
					reject: () => {
							//reject action
							
					}
			});
		} else {
			this.avviaSostituzioneResponsabileMassiva();
		}
	}

  public svuotaCampiGestioneMassivaResponsabile() {
    this.isReset = true;
    this.struttureUtenteSelectableGestioneMassiva = [];
    this.strutturaUtenteSelectedGestioneMassiva = null;
    this.isStrutturaSelectedGestioneMassiva = false;
    this.isUtenteSelectedGestioneMassiva = false;
    this.utenteSelectedGestioneMassiva = null;
    setTimeout(() => {
        this.isReset = false; //Serve a far sparire e riapparire 
    }, 1);
    this.showSvuotaButton = false;
  }

  public onStrutturaSelectedGestioneMassiva(event: any) {
		this.isStrutturaSelectedGestioneMassiva = true;
	}
}
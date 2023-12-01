import { HttpClient } from "@angular/common/http";
import {
  Component,
  Input,
  OnInit,
} from "@angular/core";
import {
  Componente,
  Contatto,
  ContattoService,
  ENTITIES_STRUCTURE,
  GruppoLotto,
  RuoloComponente,
  TipoContatto,
  TipoGruppo,
  Tipologia,
} from "@bds/internauta-model";
import { BoxParticipantiAggiudicatariService } from "./box-participanti-aggiudicatari.service";
import { Table } from "primeng/table";
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { FILTER_TYPES, FilterDefinition, FiltersAndSorts } from '@bds/next-sdr';

@Component({
  selector: "box-participanti-aggiudicatari",
  templateUrl: "./box-participanti-aggiudicatari.component.html",
  styleUrls: ["./box-participanti-aggiudicatari.component.scss"],
})
export class BoxParticipantiAggiudicatariComponent implements OnInit {
  private _modalita: any = null;
  private subscriptions: Subscription[] = [];

  @Input() set modalita(mode: any) {
    if (mode) this._modalita = mode;
  }
  public get modalita(): any {
    return this._modalita;
  }

  private _singoliList: any[] = null;
  @Input() set singoliList(values: any[]) {
    if (values) 
      this._singoliList = values;
  }
  public get singoliList(): any[] {
    return this._singoliList;
  }

  private _gruppoList: GruppoLotto[] = null;
  @Input() set gruppoList(values: GruppoLotto[]) {
    if (values) {
      this._gruppoList = values;
      if (this._modalita === 'aggiudicatari' && this.gruppoList.length === 0) {
        const gruppoLotto = new GruppoLotto();
        gruppoLotto.tipo = TipoGruppo.AGGIUDICATARIO;
        gruppoLotto.componentiList = [];
        this._gruppoList.unshift(gruppoLotto);
      }
    }
  }
  public get gruppoList(): GruppoLotto[] {
    return this._gruppoList;
  }

  public componenti: Componente[] = [];
  public tipologia: Tipologia[];
  public aggiudicatari: Componente[] = [];
  public ruolocomponente: RuoloComponente[] = [];
  public loading: boolean = false;
  public newRow: boolean = false;
  public editingRow: any;
  public rowData: any;

  public contattoSingoloSelezionato: Contatto;
  public contattoSelezionato: { [key: number]: Contatto } = {} ;
  public filteredContatto: Contatto[];
  public contatti: Contatto[];

  constructor(
    private contattoService: ContattoService,
    protected _http: HttpClient,
    private confirmationService: ConfirmationService,
    private boxParticipantiAggiudicatariService: BoxParticipantiAggiudicatariService
  ) {}

  ngOnInit(): void {
    this.boxParticipantiAggiudicatariService
      .getRuoloComponente()
      .subscribe((res) => {
        if (res) {
          this.ruolocomponente = res._embedded.ruolocomponente;
          this._gruppoList.forEach((g) => {
            g.componentiList = g.componentiList.filter(c => c !== null); // La form lo inizializza a null...
            g.componentiList.map((c) => {
              c.combinedKey = c.codiceFiscale + c.ragioneSociale;
              if (c.fk_idRuolo && c.fk_idRuolo.id && !c.idRuolo) {
                c.idRuolo = this.ruolocomponente.find(
                  (r) => r.id === c.fk_idRuolo.id
                );
              }
            })
          });
          if (this._singoliList && this._singoliList.length) 
            this._singoliList.forEach((g) => {
              g.componentiList = g.componentiList.filter((c:any) => c !== null); // La form lo inizializza a null...
              g.componentiList.map((c: any) => {
                g.combinedKey = c.codiceFiscale + c.ragioneSociale;
              })
            });
        }
      });
  }

  public filterContatto(event: any) {
    let query = event.query;
    this.loadContatto(query);
  }
  
  public loadContatto(query: string) {
    const projection = ENTITIES_STRUCTURE.rubrica.contatto.standardProjections.ContattoWithIdContatto;
    const filtersAndSorts: FiltersAndSorts = new FiltersAndSorts();
    filtersAndSorts.addFilter(new FilterDefinition("ragioneSociale", FILTER_TYPES.string.contains, query));
    filtersAndSorts.addFilter(new FilterDefinition("tipo", FILTER_TYPES.not_string.equals, TipoContatto.AZIENDA));
    filtersAndSorts.addFilter(new FilterDefinition("tipo", FILTER_TYPES.not_string.equals, TipoContatto.FORNITORE));
    filtersAndSorts.addFilter(new FilterDefinition("contatto.eliminato", FILTER_TYPES.not_string.equals, false));
    filtersAndSorts.addFilter(new FilterDefinition("contatto.tscol", FILTER_TYPES.not_string.equals, query));
    this.subscriptions.push(
      this.contattoService.getData(projection, filtersAndSorts).subscribe(res => {
        this.filteredContatto = res.results;
      })
    )
  }

  onContattoSelect(contattoSelezionato: Contatto, dt: Table, componentiList: Componente[], index: number) {
    const componente = this.initComponente(contattoSelezionato);
    this.nuovoPartecipante(dt, componentiList, componente);
    delete this.contattoSelezionato[index];
  }

  onContattoSingoloSelect(contattoSelezionato: Contatto, dt: Table) {
    const componente = this.initComponente(contattoSelezionato);
    this.nuovoSingolo(dt, componente);
    this.contattoSingoloSelezionato = null;
  }

  initComponente(contatto: Contatto): Componente {
    const componente = new Componente();
    componente.codiceFiscale = contatto.codiceFiscale;
    componente.ragioneSociale = contatto.ragioneSociale;
    componente.combinedKey = componente.codiceFiscale + componente.ragioneSociale;
    return componente;
  }

  //Partecipante in Raggruppamento

  public nuovoRaggruppamento() {
    const gruppoLotto = new GruppoLotto();
    gruppoLotto.tipo = TipoGruppo.PARTECIPANTE;
    gruppoLotto.componentiList = [];
    this._gruppoList.unshift(gruppoLotto);
  }

  eliminaGruppo(event: Event, groupIndex: number) {
    this.confirmationService.confirm({
      target: event.target,
      message: 'Sei sicuro di voler eliminare il gruppo?',
      icon: 'pi pi-exclamation-triangle',
      key: 'eliminaGruppo',
      accept: () => {
        this._gruppoList.splice(groupIndex, 1);
      },
      reject: () => {
          //reject action
      }
  });
  }

  public nuovoPartecipante(dt: Table, componentiList: Componente[], componente = new Componente()): void {
    componentiList.unshift(componente);
    const newRow = dt.value[0];
    dt.initRowEdit(newRow);
  }

  public modificaPartecipante(rowData: any) {
    this.editingRow = { ...rowData };
  }

  public eliminaPartecipante(
    componentiList: Componente[],
    rowIndex: number
  ) {
    componentiList.splice(rowIndex, 1);
  }

  public salvaPartecipante(rowData: Componente) {
    rowData.combinedKey = rowData.codiceFiscale + rowData.ragioneSociale;
  }

  public onRowEditCancel(
    componentiList: Componente[],
    rowData: Componente,
    rowIndex: number,
    isComponenteSingolo = false
  ) {
    const isObjEmpty = (obj: any) =>
      obj === null || Object.keys(obj).length === 0;
    const isItemEmpty = (item: any): boolean =>
      item === undefined ||
      item === "" ||
      (Array.isArray(item) && item.every(isItemEmpty)) ||
      (typeof item === "object" && isObjEmpty(item));

    const isEmpty = Object.values(rowData).every(isItemEmpty);

    if (isEmpty) {
      if (isComponenteSingolo) {
        this._singoliList.splice(rowIndex, 1);
      } else {
        componentiList.splice(rowIndex, 1);
      }
    }
  }

  //Partecipante Singolo

  public nuovoSingolo(dt: Table, componente = new Componente()): void {
    const gruppoLotto = new GruppoLotto();
    gruppoLotto.tipo = TipoGruppo.PARTECIPANTE;
    gruppoLotto.componentiList = [componente];
    this._singoliList.unshift(gruppoLotto);
    const newRow = dt.value[0];
    dt.initRowEdit(newRow);
  }

  public modificaSingolo(rowData: any) {
    this.editingRow = { ...rowData };
  }

  public eliminaSingolo(gruppoList: GruppoLotto[], rowData: GruppoLotto) {
    rowData.componentiList = [];
    const index = gruppoList.indexOf(rowData);
    if (index !== -1) {
      this._singoliList.splice(index, 1);
    }
  }

  public salvaSingolo(rowData: any) {
    rowData.combinedKey = rowData.componentiList[0].codiceFiscale + rowData.componentiList[0].ragioneSociale;
  }

  //Aggiudicatario

  public nuovoAggiudicatario(dt: Table, componentiList: Componente[]) {
    componentiList.unshift(new Componente());
    const newRow = dt.value[0];
    dt.initRowEdit(newRow);
  }

  public modificaAggiudicatario(rowData: any) {
    this.editingRow = { ...rowData };
  }

  public salvaAggiudicatario(rowData: Componente) {
    rowData.combinedKey = rowData.codiceFiscale + rowData.ragioneSociale;
  }

  public eliminaAggiudicatario(componentiList: Componente[], rowIndex: number) {
    componentiList.splice(rowIndex, 1);
    if (componentiList.length === 1) delete componentiList[0].idRuolo;
  }
}

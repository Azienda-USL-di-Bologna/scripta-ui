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

  private _singoliList: GruppoLotto[] = null;
  @Input() set singoliList(values: GruppoLotto[]) {
    if (values) 
      this._singoliList = values;
  }
  public get singoliList(): GruppoLotto[] {
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
  public partecipantiSingoli: GruppoLotto[] = [];
  public partecipantiGruppi: GruppoLotto[] = [];
  public aggiudicatari: Componente[] = [];
  public ruolocomponente: RuoloComponente[] = [];
  public loading: boolean = false;
  public newRow: boolean = false;
  public editingRow: any;
  public rowData: any;

  public contattoSelezionato: Contatto[];
  public filteredContatto: Contatto[];
  public contatti: Contatto[];
  public contattoCercato: Contatto;

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
              c.combinedKey = c.id + c.codiceFiscale;
              if (c.fk_idRuolo && c.fk_idRuolo.id && !c.idRuolo) {
                c.idRuolo = this.ruolocomponente.find(
                  (r) => r.id === c.fk_idRuolo.id
                );
              }
            })
          });
        }
      });
  }

  public filterContatto(event: any) {
    //const projection = ENTITIES_STRUCTURE.rubrica.contatti.standardProjections.ContattoWithIdContatto;
    let filtered: any[] = [];
    let query = event.query;
    this.loadContatto(query);
    // for ( let i = 0; i < this.contatti?.length; i++) {
    //   let contatto = this.contatti[i];
    //   if (contatto.nome.toLowerCase().indexOf(query.toLowerCase()) == 0) {
    //     filtered.push(contatto);
    //   }
    // }
  
  }
  
  public loadContatto(query: string) {
    const projection = ENTITIES_STRUCTURE.rubrica.contatto.standardProjections.ContattoWithIdContatto;
    const filtersAndSorts: FiltersAndSorts = new FiltersAndSorts();
    // filtersAndSorts.addFilter(new FilterDefinition("codiceFiscale", FILTER_TYPES.string.contains, query));
    filtersAndSorts.addFilter(new FilterDefinition("ragioneSociale", FILTER_TYPES.string.contains, query));
    filtersAndSorts.addFilter(new FilterDefinition("contatto.eliminato", FILTER_TYPES.not_string.equals, false));
    filtersAndSorts.addFilter(new FilterDefinition("contatto.tscol", FILTER_TYPES.not_string.equals, query));
    this.subscriptions.push(
      this.contattoService.getData(projection, filtersAndSorts).subscribe(res => {
        console.log(res);
        // this.filteredContatto = res.results;
        // res.results.forEach(contatto => {
        //   const contattoDaRubrica = new Contatto();
        //   contattoDaRubrica.id = contatto.id;
        //   contattoDaRubrica.ragioneSociale = contatto.ragioneSociale;
        //   contattoDaRubrica.codiceFiscale = contatto.codiceFiscale;
        //   this.filteredContatto.unshift(contattoDaRubrica);
        // })
      })
    )
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

  public nuovoPartecipante(dt: Table, componentiList: Componente[]): void {
    componentiList.unshift(new Componente());
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
    rowData.combinedKey = rowData.id + rowData.codiceFiscale;
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

  public nuovoSingolo(dt: Table, gruppoList: GruppoLotto[]): void {
    const gruppoLotto = new GruppoLotto();
    gruppoLotto.tipo = TipoGruppo.PARTECIPANTE;
    gruppoLotto.componentiList = [new Componente()];
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
    rowData.combinedKey = rowData.componentiList[0].id + rowData.componentiList[0].codiceFiscale;
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
    rowData.combinedKey = rowData.id + rowData.codiceFiscale;
  }

  public eliminaAggiudicatario(componentiList: Componente[], rowIndex: number) {
    componentiList.splice(rowIndex, 1);
    if (componentiList.length === 1) delete componentiList[0].idRuolo;
  }
}

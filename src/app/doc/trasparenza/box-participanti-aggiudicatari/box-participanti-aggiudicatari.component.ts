import { HttpClient } from "@angular/common/http";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Componente, GruppoLotto, RuoloComponente, TipoGruppo, Tipologia } from "@bds/internauta-model";
import { BoxParticipantiAggiudicatariService } from "./box-participanti-aggiudicatari.service";
import { Table } from "primeng/table";


@Component({
selector: "box-participanti-aggiudicatari",
templateUrl: "./box-participanti-aggiudicatari.component.html",
styleUrls: ["./box-participanti-aggiudicatari.component.scss"]
})

export class BoxParticipantiAggiudicatariComponent implements OnInit, OnDestroy {

  private _modalita: any = null;

  @Input() set modalita(mode: any) {
    if (mode)
      this._modalita = mode;
  }
  public get modalita(): any {
    return this._modalita;
  }

  private _gruppoList: GruppoLotto[] = null;
  @Input() set gruppoList(values: GruppoLotto[]){
    if(values) {
      this._gruppoList = values;
      if (this._modalita !== 'aggiudicatari') {
        this.partecipantiSingoli = this._gruppoList.filter(g => g.componentiList.length === 1 && g.componentiList[0].fk_idRuolo?.id === null);     
        this.partecipantiGruppi = this._gruppoList.filter(g => !this.partecipantiSingoli.includes(g));     
      } else {
        this._gruppoList[0].tipo = !this._gruppoList[0].tipo ? TipoGruppo.AGGIUDICATARIO : this._gruppoList[0].tipo;
      }
    }
  }
  public get gruppoList(): GruppoLotto[]{
    return this._gruppoList;
  }
  
  public componenti: Componente[]=[]; 
  public tipologia: Tipologia[];
  public partecipantiSingoli: GruppoLotto[] = [];
  public partecipantiGruppi: GruppoLotto[] = [];
  public aggiudicatari: Componente[] = [];
  public ruolocomponente: RuoloComponente[] = [];
  public loading: boolean = false;
  public newRow : boolean = false;
  public editingRow: any;
  public rowData: any;
  
  constructor(
    protected _http: HttpClient, 
    private boxParticipantiAggiudicatariService : BoxParticipantiAggiudicatariService,
     ) { }


  ngOnDestroy() {
    if (this._modalita !== 'aggiudicatari') {
      this._gruppoList = this.partecipantiSingoli.concat(this.partecipantiGruppi);
    }
  }

  ngOnInit(): void {
    this.boxParticipantiAggiudicatariService.getRuoloComponente().subscribe(res => {
      if(res){
        this.ruolocomponente = res._embedded.ruolocomponente;
        this._gruppoList.forEach(g => 
          g.componentiList.map(c => {
            if (!c.idRuolo) {
              c.idRuolo = this.ruolocomponente.find(r => r.id === c.fk_idRuolo.id);
            }
          })
          );
      }
    })
    
   
  } 

  //Partecipante in Raggruppamento

  public nuovoRaggruppamento() {
    const gruppoLotto = new GruppoLotto();
    gruppoLotto.tipo = TipoGruppo.PARTECIPANTE;
    gruppoLotto.componentiList = [new Componente()];
    this.partecipantiGruppi.unshift(gruppoLotto);
    this._gruppoList.unshift(gruppoLotto);
  }

  public nuovoPartecipante(dt: Table , componentiList: Componente[]): void {
    componentiList.unshift(new Componente());
    const newRow = dt.value[0];
    dt.initRowEdit(newRow);
  }

  public modificaPartecipante(rowData: any) {
      this.editingRow = { ...rowData }; 
    };

  public  eliminaPartecipante(gruppo: GruppoLotto, componentiList: Componente[],rowData: any) {
      const index = componentiList.indexOf(rowData);
      if (index !== -1) {
        componentiList.splice(index, 1);
      if (gruppo.componentiList.length === 0) {
      const gruppoIndex = this.partecipantiGruppi.indexOf(gruppo);
      if (gruppoIndex !== -1) {
        this.partecipantiGruppi.splice(gruppoIndex, 1);
      }
    }
    }
    }

  public salvaPartecipante() {
  
    }

  public onRowEditCancel(componentiList:Componente[], rowData: Componente, rowIndex:number){
    const isObjEmpty = (obj:any) => obj === null || Object.keys(obj).length === 0;
    const isItemEmpty = (item:any) :boolean => item === undefined || item === "" ||
    (Array.isArray(item) && item.every(isItemEmpty)) ||
    (typeof item === "object" && isObjEmpty(item));
    
    const isEmpty = Object.values(rowData).every(isItemEmpty);

    if(isEmpty){
      componentiList.splice(rowIndex,1);
    }
    }
  
  //Partecipante Singolo

  public nuovoSingolo(dt: Table , gruppoList: GruppoLotto[]):void{
    gruppoList.unshift(new GruppoLotto());
    gruppoList[0].tipo = TipoGruppo.PARTECIPANTE;
    gruppoList[0].componentiList = [
      new Componente()
    ];
    this._gruppoList.unshift(gruppoList[0])
    const newRow = dt.value[0];
    dt.initRowEdit(newRow);
    }

  public  modificaSingolo(rowData:any){
    this.editingRow = { ...rowData };
  }

  public eliminaSingolo( gruppoList: GruppoLotto[], rowData:any){
    const index = gruppoList.indexOf(rowData);
      if (index !== -1) {
        gruppoList.splice(index, 1);
      }
  }

  public salvaSingolo(){
  }


  //Aggiudicatario

  public nuovoAggiudicatario(dt:Table,componentiList: Componente[]){
    componentiList.unshift(new Componente());
    const newRow = dt.value[0];
    dt.initRowEdit(newRow);    
 }

  public modificaAggiudicatario(rowData:any){
    this.editingRow = { ...rowData };
  }

  public salvaAggiudicatario(){
   
  }

  public eliminaAggiudicatario(componentiList: Componente[],rowData:any){
    const index = componentiList.indexOf(rowData);
    if (index !== -1) {
      componentiList.splice(index, 1);
    }
    if (componentiList.length === 1) 
      delete componentiList[0].idRuolo;   
  } 
}

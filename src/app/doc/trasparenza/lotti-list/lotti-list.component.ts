import { DatePipe } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import { Component, HostListener, OnInit, ViewChild } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from "@angular/router";
import {
  Lotto,
  LottoService,
  getInternautaUrl,
  BaseUrlType,
  ENTITIES_STRUCTURE,
  Tipologia,
  Doc,
  Contraente,
  DocService,
  GruppoLotto,
  Componente,
} from "@bds/internauta-model";
import {
  FILTER_TYPES,
  FilterDefinition,
  FiltersAndSorts,
  PagingConf,
} from "@bds/next-sdr";
import { ConfirmationService, MessageService } from "primeng/api";
import { Table } from "primeng/table";
import { AppService } from 'src/app/app.service';


@Component({
  selector: "app-lotti-list",
  templateUrl: "./lotti-list.component.html",
  styleUrls: ["./lotti-list.component.scss"],
})
export class LottiListComponent implements OnInit {
  public dialogDisplay: boolean = false;
  public idEsterno: string = "";
  listaLotti: Lotto[] = [];
  public data: any[] = [];
  public selectedRow: any;
  public loading: boolean = true;
  @ViewChild("dt") dt: Table;
  public totalRecords: number;
  public editLottoRow: Lotto = null;
  public doc: Doc = null;

  public lottoForm: FormGroup;
  public appName: string = "Trasparenza  - Legge 190 - Elenco Lotti";

  public cols: any[] = [
    { field: "cig", header: "CIG", tooltip: "" },
    { field: "lotto", header: "Lotto", tooltip: "" },
    { field: "oggetto", header: "Oggetto", tooltip: "" },
    { field: "tipologia", header: "Tipologia", tooltip: "" },
    { field: "importo-totale", header: "Importo Totale", tooltip: "" },
    { field: "importo-liquidato", header: "Importo Liquidato", tooltip: "" },
  ];

  constructor(
    protected _http: HttpClient,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private lottoService: LottoService,
    private docService: DocService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private dataPipe: DatePipe,
    private appService: AppService ) { }

  ngOnInit(): void {
    this.appService.appNameSelection(this.appName);
    this.loading = true;
    this.idEsterno = this.route.snapshot.queryParamMap.get("guid");
    this.getLottiData();
  }

  createLottoFormGroup(lotto: Lotto) {
    const partecipantiSingoli = lotto.gruppiPartecipanti.filter(
      (g) =>
        g.componentiList.length === 1 &&
        g.componentiList[0].fk_idRuolo?.id === null
    );
    const partecipantiGruppi = lotto.gruppiPartecipanti.filter(
      (g) => !partecipantiSingoli.includes(g)
    );
    return this.formBuilder.group({
      id: [{value: lotto.id, disabled: true}],
      cig: [lotto.cig, [Validators.required]],
      lotto: [lotto.lotto, [Validators.required]],
      idTipologia: [lotto.idTipologia, [Validators.required]],
      idContraente: [lotto.idContraente, [Validators.required]],
      oggetto: [lotto.oggetto, [Validators.required]],
      importoTotale: [lotto.importoTotale, [Validators.required]],
      importoLiquidato: [lotto.importoLiquidato, [Validators.required]],
      dataInizio: [lotto.dataInizio, [Validators.required]],
      dataCompletamento: [lotto.dataCompletamento, [Validators.required]],
      partecipantiGruppi: this.formBuilder.array(this.loadGruppiLottiArrays(partecipantiGruppi)),
      partecipantiSingoli: this.formBuilder.array(this.loadGruppiLottiArrays(partecipantiSingoli)),
      gruppiAggiudicatari: this.formBuilder.array(this.loadGruppiLottiArrays(lotto.gruppiAggiudicatari)),
      version: [lotto.version]
    });
  }

  loadGruppiLottiArrays(gruppiLotto: GruppoLotto[]) {
    const gruppiFormArray = gruppiLotto.map(g => this.createGruppiLottoFormGroup(g));
    return gruppiFormArray;
  }

  createGruppiLottoFormGroup(gruppo: GruppoLotto) {
    return this.formBuilder.group({
      id: [gruppo.id],
      tipo: [gruppo.tipo],
      componentiList: this.formBuilder.array(this.loadComponentiArrays(gruppo.componentiList)),
      version: gruppo.version,
    });
  }
  loadComponentiArrays(componenti: Componente[]) {
    const componentiFormGroupArray = componenti.map(c => this.createComponentiFormGroup(c));
    return componentiFormGroupArray;
  }

  createComponentiFormGroup(componente: Componente) {
    return this.formBuilder.group({
      id: [componente.id],
      codiceFiscale: [componente.codiceFiscale],
      ragioneSociale: [componente.ragioneSociale],
      idRuolo: [componente.idRuolo],
      fk_idRuolo: [componente.fk_idRuolo],
      version: [componente.version]
    });
  }

  getLottiData() {
    const filterAndSortDoc = new FiltersAndSorts();
    filterAndSortDoc.addFilter(
      new FilterDefinition(
        "idEsterno",
        FILTER_TYPES.string.equals,
        this.idEsterno
      )
    );
    this.docService.getData(
      ENTITIES_STRUCTURE.scripta.docdetail.customProjections.DocWithAll,
      filterAndSortDoc
    ).subscribe((res) => {
      if (res.results && res.results.length == 1) {
        this.doc = res.results[0];
        
        const filterAndSort = new FiltersAndSorts();
        filterAndSort.addFilter(
          new FilterDefinition(
            "idDoc.id",
            FILTER_TYPES.not_string.equals,
            this.doc.id
          )
        );
        const pageConfNoLimit: PagingConf = {
          conf: { page: 0, size: 999999 },
          mode: "PAGE_NO_COUNT",
        };
        this.lottoService
          .getData(
            ENTITIES_STRUCTURE.lotti.lotto.customProjections.LottoWithAll,
            filterAndSort,
            null,
            pageConfNoLimit
          )
          .subscribe((res) => {
            this.totalRecords = 0;
    
            if (res.results && res.results.length > 0) {
              this.totalRecords = res.page.totalElements;
              this.listaLotti = [...res.results];
            }
            this.loading = false;
          });
      }
    });
  }

  onRowEditInit(lotto: Lotto) {
    this.dialogDisplay = true;
    this.editLottoRow = lotto;
    const lottoToEdit = {
      cig: lotto.cig,
      lotto: lotto.lotto,
      idTipologia: lotto.idTipologia,
      idContraente: lotto.idContraente,
      oggetto: lotto.oggetto,
      importoTotale: lotto.importoTotale,
      importoLiquidato: lotto.importoLiquidato,
      dataInizio: lotto.dataInizio,
      dataCompletamento: lotto.dataCompletamento,
      gruppiPartecipanti: lotto.gruppiPartecipanti,
      gruppiAggiudicatari: lotto.gruppiAggiudicatari
    } as Lotto;
    this.lottoForm = this.createLottoFormGroup(lottoToEdit);
  }

  deleteRow(rowData: any): void {
    const index = this.listaLotti.indexOf(rowData);
    this.confirmationService.confirm({
      message: 'Sei sicuro di voler eliminare il lotto?',
        header: 'Conferma',
        icon: 'pi pi-exclamation-triangle',
        accept: () => { 
          this.loading = true;    
          if (index !== -1) {
            this.listaLotti.splice(index, 1);
          }
          this.lottoService.deleteHttpCall(rowData.id).subscribe(
            res => {
              this.messageService.add({
                severity: "success",
                summary: "Successo",
                detail: "Lotto eliminato con successo"
              });
              this.totalRecords = this.totalRecords - 1;
              this.loading = false;
            }
          );
        },
        reject: () => {
          /* L'utente ha cambaito idea. Non faccio nulla */ 
        }
    });
    
  }

  aggiungiLotto(): void {
    this.dialogDisplay = true;
    this.editLottoRow = new Lotto();
    const newLotto = new Lotto();
    newLotto.idTipologia = new Tipologia();
    newLotto.idContraente = new Contraente();
    newLotto.gruppiPartecipanti = [];
    newLotto.gruppiAggiudicatari = [];
    this.lottoForm = this.createLottoFormGroup(newLotto);
  }

  public cancelDialog() {
    this.dialogDisplay = false;
  }

  public isReallyChangedAnything(): boolean {
    const gruppiPartecipanti = [
      ...this.partecipantiGruppi.value,
      ...this.partecipantiSingoli.value];

    return this.lottoForm.controls.lotto.value !== this.editLottoRow.lotto ||
           this.lottoForm.controls.cig.value !== this.editLottoRow.cig ||
           this.lottoForm.controls.oggetto.value !== this.editLottoRow.oggetto ||
           this.lottoForm.controls.idTipologia.value.id !== this.editLottoRow.idTipologia.id || 
           this.lottoForm.controls.idContraente.value.id !== this.editLottoRow.idContraente.id || 
           this.lottoForm.controls.importoLiquidato.value !== this.editLottoRow.importoLiquidato ||
           this.lottoForm.controls.importoTotale.value !== this.editLottoRow.importoTotale || 
           this.lottoForm.controls.dataInizio.value !== this.editLottoRow.dataInizio || 
           this.lottoForm.controls.dataCompletamento.value !== this.editLottoRow.dataCompletamento ||
           this.confrontaArray(gruppiPartecipanti, this.editLottoRow.gruppiPartecipanti) ||
           this.confrontaArray(this.gruppiAggiudicatari.value, this.editLottoRow.gruppiAggiudicatari)
  }

  get partecipantiGruppi() {
    return <FormArray>this.lottoForm.get('partecipantiGruppi');
  }
  get partecipantiSingoli() {
    return <FormArray>this.lottoForm.get('partecipantiSingoli');
  }
  get gruppiAggiudicatari() {
    return <FormArray>this.lottoForm.get('gruppiAggiudicatari');
  }
  public saveDialog() {
    this.dialogDisplay = false;
    const projection = "LottoWithAll";
    if (this.editLottoRow.id && this.editLottoRow.id > 0) {
      const campiModificatiDelLotto: Lotto = new Lotto();
      if (this.lottoForm.controls.lotto.dirty && this.lottoForm.controls.lotto.value !== this.editLottoRow.lotto){
        campiModificatiDelLotto.lotto = this.lottoForm.controls.lotto.value;        
      }
      if (this.lottoForm.controls.cig.dirty && this.lottoForm.controls.cig.value !== this.editLottoRow.cig){
        campiModificatiDelLotto.cig = this.lottoForm.controls.cig.value;        
      } 
      if (this.lottoForm.controls.oggetto.dirty && this.lottoForm.controls.oggetto.value !== this.editLottoRow.oggetto){
        campiModificatiDelLotto.oggetto = this.lottoForm.controls.oggetto.value;        
      } 
      if (this.lottoForm.controls.idContraente.dirty && this.lottoForm.controls.idContraente.value.id !== this.editLottoRow.idContraente.id){
        campiModificatiDelLotto.idContraente = {id: this.lottoForm.controls.idContraente.value.id} as any;        
      } 
      if (this.lottoForm.controls.idTipologia.dirty && this.lottoForm.controls.idTipologia.value.id !== this.editLottoRow.idTipologia.id){
        campiModificatiDelLotto.idTipologia = {id: this.lottoForm.controls.idTipologia.value.id} as any;       
      } 
      if (this.lottoForm.controls.importoLiquidato.dirty && this.lottoForm.controls.importoLiquidato.value !== this.editLottoRow.importoLiquidato){
        campiModificatiDelLotto.importoLiquidato = this.lottoForm.controls.importoLiquidato.value;        
      } 
      if (this.lottoForm.controls.importoTotale.dirty && this.lottoForm.controls.importoTotale.value !== this.editLottoRow.importoTotale){
        campiModificatiDelLotto.importoTotale = this.lottoForm.controls.importoTotale.value;        
      } 
      if (this.lottoForm.controls.dataInizio.dirty && this.lottoForm.controls.dataInizio.value !== this.editLottoRow.dataInizio){
        campiModificatiDelLotto.dataInizio = this.dataPipe.transform(this.lottoForm.controls.dataInizio.value, 'yyyy-MM-dd') as any;        
      } 
      if (this.lottoForm.controls.dataCompletamento.dirty && this.lottoForm.controls.dataCompletamento.value !== this.editLottoRow.dataCompletamento){
        campiModificatiDelLotto.dataCompletamento = this.dataPipe.transform(this.lottoForm.controls.dataCompletamento.value, 'yyyy-MM-dd') as any;        
      } 
      campiModificatiDelLotto.gruppiList = [
        ...this.lottoForm.controls.partecipantiGruppi.value,
        ...this.lottoForm.controls.partecipantiSingoli.value,
        ...this.lottoForm.controls.gruppiAggiudicatari.value
      ]
      campiModificatiDelLotto.version = this.editLottoRow.version;
      delete campiModificatiDelLotto.nextSdrDateInformation;
      console.log(campiModificatiDelLotto);
      this.loading = true;
      this.lottoService.patchHttpCall(campiModificatiDelLotto, this.editLottoRow.id, projection).subscribe(
        (res: Lotto ) => {
          const index = this.listaLotti.findIndex((x) => x.id == this.editLottoRow.id);
          this.listaLotti[index] = res;
          this.messageService.add({
            severity: "success",
            summary: "Lotto",
            detail: "Lotto aggiornato con successo"
          });
          this.loading = false;
        },
        (error) => {
          this.messageService.add({
            severity: "error",
            summary: "Errore",
            detail: "Errore durante il salvataggio",
          });
          this.loading = false;
        }
      )
    } else {
      const newLotto = new Lotto();
      newLotto.id = null;
      newLotto.cig = this.lottoForm.value['cig'];
      newLotto.lotto = this.lottoForm.value['lotto'];
      newLotto.idTipologia = {id: this.lottoForm.value['idTipologia'].id} as any;
      newLotto.idContraente = {id: this.lottoForm.value['idContraente'].id} as any;
      newLotto.idDoc = {id: this.doc.id} as any;
      newLotto.oggetto = this.lottoForm.value['oggetto'];
      newLotto.importoLiquidato = this.lottoForm.value['importoLiquidato'];
      newLotto.importoTotale = this.lottoForm.value['importoTotale'];
      newLotto.dataCompletamento = this.dataPipe.transform(this.lottoForm.value['dataCompletamento'], 'yyyy-MM-dd') as any;
      newLotto.dataInizio = this.dataPipe.transform(this.lottoForm.value['dataInizio'], 'yyyy-MM-dd') as any;
      newLotto.gruppiList = [
        ...this.lottoForm.controls.partecipantiGruppi.value,
        ...this.lottoForm.controls.partecipantiSingoli.value,
        ...this.lottoForm.controls.gruppiAggiudicatari.value
      ];
      delete newLotto.nextSdrDateInformation;
      console.log(newLotto);
      this.loading = true;
      this.lottoService.postHttpCall(newLotto, projection).subscribe(
        (result) => {
          this.messageService.add({
            severity: "success",
            summary: "Lotto",
            detail: "Lotto aggiunto con successo",
          });
          this.loading = false;
          this.listaLotti.unshift(result);
        },
        (error) => {
          this.messageService.add({
            severity: "error",
            summary: "Errore",
            detail: "Errore durante il salvataggio",
          });
          this.loading = false;
        }
      );
    }
  }

  public refreshLotti() {
    const apiUrl = getInternautaUrl(BaseUrlType.Lotti) + "/refreshLotti" + "?guid=" + this.idEsterno ;
    this._http.get(apiUrl).subscribe(
      res => {
        window.close();
      }
    );
  }
    
  @HostListener('window:beforeunload', ['$event'])
  public onWindowClose(event: BeforeUnloadEvent): void {
    this.refreshLotti();
  }
  
  public chiudiLottoList(): void {
    this.refreshLotti();
  }

  public confrontaArray(array1: GruppoLotto[], array2: GruppoLotto[]): boolean {
    if (array1.length !== array2.length) {
      return true;
    }
    for (let i = 0; i < array1.length; i++) {
      if (array1[i].componentiList.length !== array2[i].componentiList.length) {
        return true;
      }
    }
    return false; // Nessuna differenza trovata
  }
}

export class LottiList {
  public cig: string;
  public oggetto: string;
  public cf_struttura_proponente: number;
  public denominazione_struttura: string;
}

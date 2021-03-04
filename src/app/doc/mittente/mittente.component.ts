import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {MittenteService} from "./mittente.service";
import {Doc, Mezzo, MezzoService, Related} from "@bds/ng-internauta-model";




@Component({
  selector: "mittente",
  templateUrl: "./mittente.component.html",
  styleUrls: ["./mittente.component.scss"],
  providers: [MittenteService]
})
export class MittenteComponent implements OnInit {

  // @Input() set idAziendeSceglibili(value: number[]) {
  //   this._idAziendeSceglibili = value;
  // }
  //
  // @Output() mittenteEmitter: EventEmitter<Related> = new EventEmitter();

  selectedMittente: string = "";
  selectedTipo: string = "";
  selectedMezzo: string = "";
  mittente: string = "";

  suggeretionsMittente: any[] = [];
  suggeretionsTipo: any[] = [];
  // suggeretionsMezzo: Mezzo[] = [];
  suggeretionsMezzo: any[] = [];

  filteredMittente: any[] = [];
  filteredTipo: any[] = [];
  filteredMezzo: any[] = [];

  dataDiArrivo: Date = new Date();
  dataProtocollazione: Date = new Date();
  DatiProtocolloEsterno: Number = 33;

  searchMittente(event: any) {
    const filteredMittente: any[] = [];
    const query = event.query;

    this.suggeretionsMittente.forEach(currentSuggeretion => {
      if (currentSuggeretion.name.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filteredMittente.push(currentSuggeretion);
      }
    });
    this.filteredMittente = filteredMittente;
  }

  searchTipo(event: any) {
    const filteredTipo: any[] = [];
    const query = event.query;
    this.suggeretionsTipo.forEach(currentSuggeretion => {
      if (currentSuggeretion.name.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filteredTipo.push(currentSuggeretion);
      }
    });
    this.filteredTipo = filteredTipo;
  }

  searchMezzo(event: any) {
    const filteredMezzo: any[] = [];
    const query = event.query;


    this.suggeretionsMezzo.forEach(currentSuggeretion => {
      if (currentSuggeretion.name.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filteredMezzo.push(currentSuggeretion);
      }
    });
    this.filteredMezzo = filteredMezzo;
  }

  constructor(private mittenteService: MittenteService,
              private mezzoService: MezzoService) { }


  ngOnInit(): void {
    this.mittenteService.getSuggeretionMittente().then(suggeretionsMittente => {
      this.suggeretionsMittente = suggeretionsMittente;
      console.log(suggeretionsMittente);
    });

    this.mittenteService.getSuggeretionTipo().then(suggeretionsTipo => {
      this.suggeretionsTipo = suggeretionsTipo;
      console.log(suggeretionsTipo);
    });

    this.mezzoService.getData().subscribe((data: any) => {
      if (data && data.results) {
        this.suggeretionsMezzo = data.results;
      } else {
        this.suggeretionsMezzo = [];
      }

    });
  }

  public timeOutAndSaveDoc(doc: Doc, field: keyof Doc) {
    console.log("timeOutAndSaveDoc");
   // this.mittenteEmitter.emit();
  }
}


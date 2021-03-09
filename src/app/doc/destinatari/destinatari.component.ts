import { Component, OnInit } from "@angular/core";

import {ExtendedDestinatariService} from "./extended-destinatari.service";

@Component({
  selector: "destinatari",
  templateUrl: "./destinatari.component.html",
  styleUrls: ["./destinatari.component.scss"]
})
export class DestinatariComponent implements OnInit {
  selectedTipo: string = "";
  selectedMezzo: string = "";
  suggeretionsTipo: any[] = [];
  // suggeretionsMezzo: Mezzo[] = [];
  suggeretionsMezzo: any[] = [];
  filteredTipo: any[] = [];
  filteredMezzo: any[] = [];
  columnCoinvolti: any[] = [];
  descrizioneCoinvolti: any[]  = [];

  constructor(private destinatariService: ExtendedDestinatariService) { }

  ngOnInit(): void {
    this.destinatariService.getSuggeretionTipo().then(suggeretionsTipo => {
      this.suggeretionsTipo = suggeretionsTipo;
      console.log(suggeretionsTipo);
    });

    this.destinatariService.getSuggeretionMezzo().then(suggeretionsMezzo => {
      this.suggeretionsMezzo = suggeretionsMezzo;
      console.log(suggeretionsMezzo);
    });
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
}

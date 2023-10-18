import { Component, OnInit } from "@angular/core";

@Component({
selector: "box-participanti-aggiudicatari",
templateUrl: "./box-participanti-aggiudicatari.component.html",
styleUrls: ["./box-participanti-aggiudicatari.component.scss"]
})

export class BoxParticipantiAggiudicatari implements OnInit {
    
    public raggruppamenti: any[] = [
        {name:'Nome1', tipologia:'tipologia1'},
        {name: 'Nome2', tipologia:'tipologia2'}];
    public newRow : boolean = false;
    public editingRow: any;
    public selectedPartecipante:any;
    public rowData: any;
    public singoli: any[] = [
      {name:'Singolo Partecipante'}];
    public aggiudicatari: any[] = [
      {name:'Aggiudicatario', ruolo:'MANDANTE'}];

    constructor(){}

    ngOnInit(): void {} 

    nuovoRaggruppamento(){
    this.raggruppamenti.unshift({name:'', tipologia:''});
    this.newRow = true;
    }

    modificaPartecipante(rowData: any) {
        this.editingRow = { ...rowData }; // Copia i dati della riga 
      };

    eliminaRiga(righe: any[], rowData: any) {
        const index = righe.indexOf(rowData);
        if (index !== -1) {
          righe.splice(index, 1);
        }
      }

    savePartecipante(rowData: any) {
        this.editingRow = null;
        this.newRow = false;
      }

    onRowEditCancel(){
        
      }
    
    nuovoSingolo(){
      this.singoli.unshift({name:''});
      }

   

    onRowEdit(){

    }

    nuovoAggiudicatario(){
      this.aggiudicatari.unshift({name:'',ruolo:''});

    }

    saveAggiudicatario(){
      this.editingRow = null;
    }
    
   

}

import { Component, Input } from '@angular/core';
import { AttoreDoc, Doc, RuoloAttoreDoc } from '@bds/internauta-model';

@Component({
  selector: 'attori',
  templateUrl: './attori.component.html',
  styleUrls: ['./attori.component.scss']
})
export class AttoriComponent {
  
  @Input() set doc(value: Doc) {
    this._doc = value;
    this.setDirettoriDeli(this.doc);
    this.setResponsabileProcedimento(value);
  }
  get doc(): Doc {
    return this._doc;
  }
  
  // Uso un array per usare la listbox ed evitare di lavorare sul css per rendere i campi uguali
  responsabileProcedimentoAsList: AttoreDoc[];  
  direttoriDeli: AttoreDoc[] = [];
  private _doc: Doc;
  
  constructor() {
    
   }

  setResponsabileProcedimento(doc: Doc) {
    if (doc && doc.attoriList)
      this.responsabileProcedimentoAsList = doc.attoriList.filter(a => a.ruolo === RuoloAttoreDoc.RESPONSABILE_PROCEDIMENTO);
      console.log("ci sono questi attori: " , this.responsabileProcedimentoAsList)

  }

  setDirettoriDeli(doc: Doc) {
    if (doc && doc.attoriList) {
      doc.attoriList.forEach((attore: AttoreDoc )=> {
        if (attore.ruolo.toString() === "DIRETTORE_AMMINISTRATIVO" || 
          attore.ruolo.toString() ==="DIRETTORE_GENERALE" ||
          attore.ruolo.toString() === "DIRETTORE_SANITARIO" ||
          attore.ruolo.toString() === "DSC" || 
          attore.ruolo.toString() === "FIRMATARIO") {

          this.direttoriDeli.push(attore);
        }
      })
    }
  }
  

}

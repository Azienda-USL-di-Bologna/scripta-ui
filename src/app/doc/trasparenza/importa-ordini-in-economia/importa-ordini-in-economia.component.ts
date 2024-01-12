import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { DatiMock } from "./dati";
import { ImportaOrdiniInEconomiaService } from "./importa-ordini-in-economia.service";
import { Lotto } from "@bds/internauta-model";

//Componente utilizzata per una finestra modale mediante la quale importare gli ordini in economia facendo un'estrazione dei dati

//uso questa interfaccia per gestire i dati in arrivo
interface Dati {
  id: number;
  selected: boolean;
  codice: number;
  descrizione: string;
  data: Date;
}

@Component({
  selector: "app-importa-ordini-in-economia",
  templateUrl: "./importa-ordini-in-economia.component.html",
  styleUrls: ["./importa-ordini-in-economia.component.scss"],
})
export class ImportaOrdiniInEconomiaComponent implements OnInit {
  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  public dati: Dati[] = [];
  private datiArrivati: Dati[] = DatiMock;
  public dataDal: Date | null = null;
  public dataAl: Date | null = null;
  public lottiDaImportare: Lotto[];

  constructor(private importaService: ImportaOrdiniInEconomiaService) {}

  ngOnInit(): void {}

  /**
   * Uso questa funzione per verificare che almeno una checkbox sia selezionata
   * @returns
   */
  isAlmenoUnaCheckBoxSelezionata(): boolean {
    return this.dati.some((dato) => dato.selected);
  }

  /**
   * Funzione che scatta quando si preme il pulsante di ricerca, va a estrarre i dati
   */
  cerca(): void {
    this.dati = this.datiArrivati.filter((dato) => {
      //metto la data a mezzanotte per effettuare il confronto, nel caso in input arrivasse una data con orario diverso che potrebbe creare
      //problemi in quanto voglio confrontare solo effettivamente le date e non gli orari
      const settaDataAMezzanotte = (data: Date) =>
        new Date(data.setHours(0, 0, 0, 0));
      const dataAMezzanotte = settaDataAMezzanotte(dato.data);
      return (
        (!this.dataDal || dataAMezzanotte >= this.dataDal) &&
        (!this.dataAl || dataAMezzanotte <= this.dataAl)
      );
    });
  }

  /**
   * Funzione per selezionare tutte le righe
   */
  selezionaTutto(): void {
    this.dati.forEach((dato) => (dato.selected = true));
  }

  /**
   * Funzione per deselezionare tutte le righe
   */
  deselezionaTutto(): void {
    this.dati.forEach((dato) => (dato.selected = false));
  }

  /**
   * Funzione che scatta quando si preme il tasto importa: le righe selezionate vengono importate. Se non è selezionata alcuna riga
   * il bottone è disattivato
   */
  importa(): void {
    const datiSelezionati = this.dati.filter((dato) => dato.selected);
    datiSelezionati.forEach((dato) => console.log(dato.descrizione));

    this.importaService.importaLotti(this.lottiDaImportare).subscribe(
      (response) => {
        console.log(response);
      },
      (error) => {
        console.log(error);
      }
    );

    // Inserisci qui la logica per l'importazione dei dati selezionati
  }

  /**
   * Chiude la finestra
   */
  annulla(): void {
    this.closeModal.emit();
  }
}

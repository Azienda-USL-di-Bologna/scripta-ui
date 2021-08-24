
export class Utils {
  public static dateFormatter(date: Date) {
    return date.getDate().toString().padStart(2, '0') + "/" + (date.getMonth() + 1).toString().padStart(2, '0') + "/" + date.getFullYear()
  }
}

export interface ImpostazioniDocList {
  mieiDocumenti: boolean;
  selectedColumn: string[];
}
export interface Impostazioni {
  "scripta.docList"?: ImpostazioniDocList;
}

export class CaptionConfiguration {
  constructor(
    public component: CaptionComponent,
    public searchBox: boolean, 
    public selectButtons: boolean,
    public exportButton: boolean,
    public selectableColumns: boolean,
    public newArchivio: boolean,
    public preferitoButton: boolean,
    public uploadDocumentButton: boolean,
    public rowCount: boolean
    ) {}
}
export enum CaptionComponent {
  DOCS_LIST = "DOCS_LIST",
  ARCHIVI_LIST = "ARCHIVI_LIST",
  ARCHIVIO = "ARCHIVIO"
}
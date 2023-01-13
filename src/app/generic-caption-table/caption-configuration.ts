export class CaptionConfiguration {
  /* private _showIconArchiveClosed: boolean = false; */

  constructor(
    public component: CaptionComponent,
    public searchBox: boolean, 
    public selectButtons: boolean,
    public exportButton: boolean,
    public selectableColumns: boolean,
    public newArchivio: boolean,
    public preferitoButton: boolean,
    public uploadDocument: boolean,
    public rowCount: boolean,
    public showIconArchiveClosed: boolean
    ) {}

  /* get showIconArchiveClosed() { return this._showIconArchiveClosed}
  set showIconArchiveClosed(v: boolean) { this._showIconArchiveClosed = v} */
}
export enum CaptionComponent {
  DOCS_LIST = "DOCS_LIST",
  ARCHIVI_LIST = "ARCHIVI_LIST",
  ARCHIVIO = "ARCHIVIO"
}
export class CaptionConfiguration {
  private _component: CaptionComponent;
  private _searchBox: boolean;
  private _selectButtons: boolean;
  private _exportButton: boolean;
  private _selectableColumns: boolean;
  private _newArchivio: boolean;
  private _preferitoButton: boolean;
  private _uploadDocument: boolean;
  private _rowCount: boolean;
  private _showIconArchiveClosed: boolean;
  private _functionButton: boolean;

  constructor(
    component: CaptionComponent,
    searchBox: boolean,
    selectButtons: boolean,
    exportButton: boolean,
    selectableColumns: boolean,
    newArchivio: boolean,
    preferitoButton: boolean,
    uploadDocument: boolean,
    rowCount: boolean,
    showIconArchiveClosed: boolean,
    functionButton: boolean
  ) {
    this._component = component;
    this._searchBox = searchBox;
    this._selectButtons = selectButtons;
    this._exportButton = exportButton;
    this._selectableColumns = selectableColumns;
    this._newArchivio = newArchivio;
    this._preferitoButton = preferitoButton;
    this._uploadDocument = uploadDocument;
    this._rowCount = rowCount;
    this._showIconArchiveClosed = showIconArchiveClosed;
    this._functionButton = functionButton;
  }

  get component() { return this._component}
  set component(v: CaptionComponent) { this._component = v}

  get searchBox() { return this._searchBox}
  set searchBox(v: boolean) { this._searchBox = v}

  get selectButtons() { return this._selectButtons}
  set selectButtons(v: boolean) { this._selectButtons = v}

  get exportButton() { return this._exportButton}
  set exportButton(v: boolean) { this._exportButton = v}

  get selectableColumns() { return this._selectableColumns}
  set selectableColumns(v: boolean) { this._selectableColumns = v}

  get newArchivio() { return this._newArchivio}
  set newArchivio(v: boolean) { this._newArchivio = v}

  get preferitoButton() { return this._preferitoButton}
  set preferitoButton(v: boolean) { this._preferitoButton = v}

  get uploadDocument() { return this._uploadDocument}
  set uploadDocument(v: boolean) { this._uploadDocument = v}

  get rowCount() { return this._rowCount}
  set rowCount(v: boolean) { this._rowCount = v}

  get showIconArchiveClosed() { return this._showIconArchiveClosed}
  set showIconArchiveClosed(v: boolean) { this._showIconArchiveClosed = v}

  get functionButton() { return this._functionButton}
  set functionButton(v: boolean) { this._functionButton = v}
}
export enum CaptionComponent {
  DOCS_LIST = "DOCS_LIST",
  ARCHIVI_LIST = "ARCHIVI_LIST",
  ARCHIVIO = "ARCHIVIO",
  TIP = "TIP"
}
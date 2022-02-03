import { Type } from '@angular/core';

export class TabItem {
  constructor(
    public component: Type<any>, 
    public data: any,
    public closable: boolean,
    public label: string,
    public icon: string,
    public type: TabType) {}
}

export enum TabType {
  DOCS_LIST = "DOCS_LIST",
  ARCHIVI_LIST = "ARCHIVI_LIST",
  DOC = "DOC",
  ARCHIVIO = "ARCHIVIO"
}
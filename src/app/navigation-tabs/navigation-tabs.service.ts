import { Injectable } from '@angular/core';
import { ArchiviListComponent } from '../archivi-list/archivi-list.component';
import { ArchivioComponent } from '../archivio/archivio.component';
import { DocComponent } from '../doc/doc.component';
import { DocsListComponent } from '../docs-list/docs-list.component';

import { TabItem, TabType } from './tab-item';

@Injectable()
export class NavigationTabsService {
  private tabs: TabItem[] = [];
  private activeTabIndex = -1;

  public addTab(tab: TabItem) {
    this.tabs.push(tab);
    this.setTabsInSessionStorage();
  }

  public removeTab() {

  }

  public updateActiveTab() {

  }

  public getTabs() {
    return this.tabs;
  }

  private setTabsInSessionStorage() {
    /* const tabMap = this.tabs.forEach(t => {
      return {
        data: t.data,
        active: false,
        label: t.label,
        icon: t.icon,

      }
    }); */
    sessionStorage.setItem("tabs", JSON.stringify(this.tabs));
  }

  /**
   * Carico i tab dal session storage
   * @returns torno false se non ho caricato nulla
   */
  public loadTabsFromSessionStorage(): boolean {
    const stringTabs = sessionStorage.getItem("tabs");
    if (stringTabs) {
      const tabs = JSON.parse(stringTabs) as TabItem[];
      if (tabs && !(tabs.length > 0)) {
        return false;
      }
      for (const tab of tabs) {
        switch (tab.type) {
          case TabType.DOCS_LIST:
            tab.component = DocsListComponent;
            break;
          case TabType.ARCHIVI_LIST:
            tab.component = ArchiviListComponent;
            break;
          case TabType.DOC:
            tab.component = DocComponent;
            break;
          case TabType.ARCHIVIO:
            tab.component = ArchivioComponent;
            break;
        }
        this.tabs.push(tab);
      }
      return true;
    } else {
      return false;
    }
  }

  public buildaTabDocsList(): TabItem {
    return new TabItem(
      DocsListComponent,
      {  },
      false,
      "Documenti",
      "pi pi-fw pi-list",
      TabType.DOCS_LIST
    );
  }

  public buildaTabArchiviList(): TabItem {
    return new TabItem(
      ArchiviListComponent,
      {  },
      false,
      "Archivi",
      "pi pi-fw pi-list",
      TabType.ARCHIVI_LIST
    );
  }

  public buildaTabDoc(idDoc: number, label: string): TabItem {
    return new TabItem(
      DocComponent,
      { 
        id: idDoc
      },
      true,
      label,
      "pi pi-fw pi-folder",
      TabType.DOC
    )
  }

  public buildaTabArchivio(idArchivio: number, label: string): TabItem {
    return new TabItem(
      ArchivioComponent,
      { 
        id: idArchivio
      },
      true,
      label,
      "pi pi-fw pi-folder",
      TabType.ARCHIVIO
    )
  }
}

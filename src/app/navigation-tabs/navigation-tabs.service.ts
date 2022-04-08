import { Injectable } from '@angular/core';
import { Archivio, ArchivioDetail } from '@bds/ng-internauta-model';
import { ArchiviListContainerComponent } from '../archivi-list-container/archivi-list-container.component';
import { ExtendedArchiviView } from '../archivi-list-container/archivi-list/extendend-archivi-view';
import { ArchivioComponent } from '../archivio/archivio.component';
import { DocComponent } from '../doc/doc.component';
import { DocsListContainerComponent } from '../docs-list-container/docs-list-container.component';
import { TabItem, TabType } from './tab-item';

@Injectable()
export class NavigationTabsService {
  private tabs: TabItem[] = [];
  public activeTabIndex: number = 0;

  public addTab(tab: TabItem) {
    this.tabs.push(tab);
    this.setTabsInSessionStorage();
  }

  public removeTab(tabIndexToRemove: number): void {
    if (this.tabs[tabIndexToRemove].type === TabType.ARCHIVIO) {
      this.activeTabIndex = 1; // Sto dando per scotnato che il tab degli archiviList sia il secondo.
    }
    this.tabs.splice(tabIndexToRemove, 1);
    this.setTabsInSessionStorage();
  }

  /**
   * Update del tab. Viene aggiornato il label
   * e la proprietà data (che contiene ad es l'archivio e il suo id)
   * @param tabIndex 
   * @param label 
   * @param data 
   */
  public updateTab(tabIndex: number, label: string, data: any) {
    this.tabs[tabIndex].label = label;
    this.tabs[tabIndex].data = data;
  }

  public getTabs() {
    return this.tabs;
  }

  private setTabsInSessionStorage() {
    sessionStorage.setItem("tabs", JSON.stringify(this.tabs));
  }

  public activeLastTab(): void {
    setTimeout(() => {
      this.activeTabIndex = this.tabs.length - 1; 
    }, 0);
  }

  public activeTabByIndex(tabIndex: number): void {
    setTimeout(() => {
      this.activeTabIndex = tabIndex; 
    }, 0);
  }

  /**
   * Carico i tab dal session storage
   * Setto il componente in base al tipo di tab
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
            tab.component = DocsListContainerComponent;
            break;
          case TabType.ARCHIVI_LIST:
            tab.component = ArchiviListContainerComponent;
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
      DocsListContainerComponent,
      {  },
      false,
      "Documenti",
      "pi pi-fw pi-list",
      TabType.DOCS_LIST
    );
  }

  public buildaTabArchiviList(): TabItem {
    return new TabItem(
      ArchiviListContainerComponent,
      {  },
      false,
      "Fascicoli",
      "pi pi-fw pi-list",
      TabType.ARCHIVI_LIST
    );
  }

  private buildaTabDoc(idDoc: number, label: string): TabItem {
    return new TabItem(
      DocComponent,
      { 
        id: idDoc
      },
      true,
      label,
      "pi pi-fw pi-folder",
      TabType.DOC
    );
  }

  private buildaTabArchivio(archivio: Archivio | ArchivioDetail | ExtendedArchiviView, label: string): TabItem {
    return new TabItem(
      ArchivioComponent,
      { 
        archivio: archivio,
        id: archivio.id,
      },
      true,
      label,
      "pi pi-fw pi-folder",
      TabType.ARCHIVIO,
      archivio.fk_idArchivioRadice.id
    );
  }

  /**
   * Quando un archivio viene cliccato va controllato se esiste già il tab
   * per la sua alberatura. Altrimenti si apre nuovo tab.
   * @param archivio 
   * @param active 
   */
  public addTabArchivio(archivio: Archivio | ArchivioDetail | ExtendedArchiviView, active: boolean = true): void {
    const tabIndex: number = this.tabs.findIndex(t => {
      return t.type === TabType.ARCHIVIO && t.id === archivio.fk_idArchivioRadice.id
    });
    if (tabIndex !== -1) {
      this.updateTab(tabIndex, archivio.numerazioneGerarchica, {archivio: archivio, id: archivio.id});
      if (active) {
        this.activeTabByIndex(tabIndex);
      }
    } else {
      this.addTab(
        this.buildaTabArchivio(archivio, archivio.numerazioneGerarchica)
      );
      if (active) {
        this.activeLastTab();
      }
    }
  }
}

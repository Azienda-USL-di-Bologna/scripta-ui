import { Injectable } from '@angular/core';
import { TipComponent } from '@bds/common-components';
import { Archivio, ArchivioDetail } from '@bds/internauta-model';
import { UtenteUtilities } from '@bds/jwt-login';
import { ArchiviListContainerComponent } from '../archivi-list-container/archivi-list-container.component';
import { ExtendedArchiviView } from '../archivi-list-container/archivi-list/extendend-archivi-view';
import { ArchivioComponent } from '../archivio/archivio.component';
import { DocComponent } from '../doc/doc.component';
import { DocsListContainerComponent } from '../docs-list-container/docs-list-container.component';
import { ExtendedDocDetailView } from '../docs-list-container/docs-list/extended-doc-detail-view';
import { TipContainerComponent } from '../tip-container/tip-container.component';
import { TabItem, TabType } from './tab-item';

@Injectable()
export class NavigationTabsService {
  private tabs: TabItem[] = [];
  public activeTabIndex: number = 0;
  private idTabActivatedHistory: string[] = [];

  public addTab(tab: TabItem) {
    this.tabs.push(tab);
    this.setTabsInSessionStorage();
  }

  /**
   * Si sta chiudendo un tab. Lo tolgo dalla lista dei tab e vado ad attivare il precedente tab usato.
   * Se non trovassi nessun tab precedentemente usato (caso strano) allora attiverò arhcivi list o doc list
   * a seconda del fatto che è appena stato chiuso un archivio o un doc.
   * @param tabIndexToRemove 
   */
  public removeTab(tabIndexToRemove: number): void {
    const typeOfTabToRemove: TabType = this.tabs[tabIndexToRemove].type;
    this.tabs.splice(tabIndexToRemove, 1);
    this.setTabsInSessionStorage();
    const tabIndexToActivate = this.getIndexOfLastActivatedTab();
    if (tabIndexToActivate) {
      this.activeTabByIndex(tabIndexToActivate);
    } else {
      if (typeOfTabToRemove === TabType.ARCHIVIO) {
        this.activeTabByIndex(this.tabs.findIndex(t => t.id === TabType.ARCHIVI_LIST));
      } else {
        this.activeTabByIndex(this.tabs.findIndex(t => t.id === TabType.DOCS_LIST));
      }
    }
  }

  /**
   * Torna l'indice dell'ultimo tab ceh è stato usato, scegliendo però solo tra i tab ancora esistenti.
   * Vengono quindi esclusi i tab già chiusi. Se nessun tab è stato trovato allora tornerà null.
   * @returns 
   */
  private getIndexOfLastActivatedTab(): number {
    if (this.idTabActivatedHistory.length === 0) {
      return null;
    }
    const lastTabIdActivated = this.idTabActivatedHistory.pop();
    const index = this.tabs.findIndex(t => t.id === lastTabIdActivated);
    if (index !== -1) {
      return index;
    }
    return this.getIndexOfLastActivatedTab();
  }

  /**
   * Update del tab. Viene aggiornato il label
   * e la proprietà data (che contiene ad es l'archivio e il suo id)
   * @param tabIndex 
   * @param label 
   * @param data 
   */
  public updateTab(tabIndex: number, label: string, data: any, labelForAppName: string, tabId?: string) : void {
    this.tabs[tabIndex].label = label;
    this.tabs[tabIndex].labelForAppName = labelForAppName;
    this.tabs[tabIndex].data = data;
    if (tabId) {
      this.tabs[tabIndex].id = tabId;
    }
    this.setTabsInSessionStorage();
  }

  public getTabs(): TabItem[] {
    return this.tabs;
  }

  private setTabsInSessionStorage(): void {
    sessionStorage.setItem("tabs", JSON.stringify(this.tabs));
  }

  public activeLastTab(): void {
    this.activeTabByIndex(this.tabs.length - 1);
  }

  public activeTabByIndex(tabIndex: number): void {
    setTimeout(() => {
      this.activeTabIndex = tabIndex; 
      this.addTabToHistory(tabIndex);
    }, 0);
  }

  public addTabToHistory(tabIndex: number) {
    this.idTabActivatedHistory.push(this.tabs[tabIndex].id);
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
          case TabType.TIP:
            tab.component = TipContainerComponent;
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
      TabType.DOCS_LIST,
      TabType.DOCS_LIST, // Lo uso come id univoco di questo tab
      "Elenco Documenti"
    );
  }

  public buildaTabArchiviList(): TabItem {
    return new TabItem(
      ArchiviListContainerComponent,
      {  },
      false,
      "Fascicoli",
      "pi pi-fw pi-list",
      TabType.ARCHIVI_LIST,
      TabType.ARCHIVI_LIST, // Lo uso come id univoco di questo tab
      "Elenco Fascicoli"
    );
  }

  private buildaTabDoc(idDoc: number, doc:ExtendedDocDetailView, label: string, labelForAppName: string): TabItem {
    return new TabItem(
      DocComponent,
      {
        doc: doc
      },
      true,
      label,
      "pi pi-fw pi-folder",
      TabType.DOC,
      idDoc.toString(),
      labelForAppName
    );
  }

  private buildaTabArchivio(archivio: Archivio | ArchivioDetail | ExtendedArchiviView, label: string, labelForAppName: string): TabItem {
    return new TabItem(
      ArchivioComponent,
      { 
        archivio: this.projectionArchivioPerSessionStorage(archivio),
        id: archivio.id,
      },
      true,
      label,
      "pi pi-fw pi-folder",
      TabType.ARCHIVIO,
      archivio.fk_idArchivioRadice.id.toString(),
      labelForAppName
    );
  }

  private buildaTabTIP(idTipSessioneImportazione?: number): TabItem {
    return new TabItem(
      TipComponent,
      {
        idTipSessioneImportazione: idTipSessioneImportazione
      },
      true,
      "Import Pregressi",
      "pi pi-file-import",
      TabType.TIP,
      TabType.TIP, // Lo uso come id univoco di questo tab
      "Tool Importazione Pregressi"
    );
  }

  private projectionArchivioPerSessionStorage(archivio: Archivio | ArchivioDetail | ExtendedArchiviView): Archivio {
    const a = new Archivio();
    a.id = archivio.id;
    a.numerazioneGerarchica = archivio.numerazioneGerarchica;
    a.fk_idArchivioPadre = archivio.fk_idArchivioPadre;
    a.fk_idArchivioRadice = archivio.fk_idArchivioRadice;
    a.tipo = archivio.tipo;
    a.stato = archivio.stato;
    a.livello = archivio.livello;
    a.fk_idAzienda = archivio.fk_idAzienda;
    a.version = archivio.version;
    return a;
  }

  /**
   * Quando un archivio viene cliccato va controllato se esiste già il tab
   * per la sua alberatura. Altrimenti si apre nuovo tab.
   * @param archivio 
   * @param active 
   */
  public addTabArchivio(archivio: Archivio | ArchivioDetail | ExtendedArchiviView, active: boolean = true, reuseActiveTab: boolean = false, forceReloadTab: boolean = false): void {
    if (forceReloadTab) {
      this.removeTab(this.activeTabIndex);
      this.addTab(
        this.buildaTabArchivio(
          archivio, 
          `${archivio.numerazioneGerarchica}<span class="sottoelemento-tab">[${archivio.idAzienda.aoo}]</span>`, 
          `Fascicolo ${archivio.numerazioneGerarchica} [${archivio.idAzienda.aoo}]`
        )
      );
      if (active) {
        this.activeLastTab();
      }
    } else {
      const tabIndex: number = this.tabs.findIndex(t => {
        return t.type === TabType.ARCHIVIO && t.id === archivio.fk_idArchivioRadice.id.toString()
      });
      if (tabIndex !== -1) {
        this.updateTab(
          tabIndex, 
          `${archivio.numerazioneGerarchica}<span class="sottoelemento-tab">[${archivio.idAzienda.aoo}]</span>`, 
          {archivio: this.projectionArchivioPerSessionStorage(archivio), id: archivio.id},
          `Fascicolo ${archivio.numerazioneGerarchica} [${archivio.idAzienda.aoo}]`,
        );
        if (active) {
          this.activeTabByIndex(tabIndex);
        }
      } else if (reuseActiveTab) {
        this.updateTab(
          this.activeTabIndex, 
          `${archivio.numerazioneGerarchica}<span class="sottoelemento-tab">[${archivio.idAzienda.aoo}]</span>`, 
          {archivio: this.projectionArchivioPerSessionStorage(archivio), id: archivio.id}, 
          `Fascicolo ${archivio.numerazioneGerarchica} [${archivio.idAzienda.aoo}]`,
          archivio.fk_idArchivioRadice.id.toString()
        );
      } else {
        this.addTab(
          this.buildaTabArchivio(
            archivio, 
            `${archivio.numerazioneGerarchica}<span class="sottoelemento-tab">[${archivio.idAzienda.aoo}]</span>`, 
            `Fascicolo ${archivio.numerazioneGerarchica} [${archivio.idAzienda.aoo}]`
          )
        );
        if (active) {
          this.activeLastTab();
        }
      }
    }
  }



  /**
   * Quando un doc viene cliccato va controllato se esiste già il tab
   * per la sua alberatura. Altrimenti si apre nuovo tab.
   * NOTA: viene solo usata per i pregressi, per ora.
   * @param archivio 
   * @param active 
   */
  public addTabDoc(doc: ExtendedDocDetailView, active: boolean = true, reuseActiveTab: boolean = false, pregresso: boolean = true): void {
    const tabIndex: number = this.tabs.findIndex(t => {
      return t.type === TabType.DOC && t.id === doc.id.toString();
    });
    if (tabIndex !== -1) {
      this.updateTab(
        tabIndex, 
        `${doc.registrazioneVisualizzazione}<span class="sottoelemento-tab">[${doc.idAzienda.aoo}]</span>`, 
        {doc: doc},
        `${doc.codiceRegistro === 'PG' ? "Protocollo generale" : doc.tipologiaVisualizzazione} ${pregresso ? 'pregresso ': ''}${doc.registrazioneVisualizzazione} [${doc.idAzienda.aoo}]`, 
      );
      if (active) {
        this.activeTabByIndex(tabIndex);
      }
    } else if (reuseActiveTab) {
      this.updateTab(
        this.activeTabIndex, 
        `${doc.registrazioneVisualizzazione}<span class="sottoelemento-tab">[${doc.idAzienda.aoo}]</span>`, 
        {doc: doc},
        `Protocollo generale ${pregresso ? 'pregresso ': ''}${doc.registrazioneVisualizzazione} [${doc.idAzienda.aoo}]`, 
        undefined // segnaposto per ricordare che c'è un parametro forse utile
      );
    } else {
      this.addTab(
        this.buildaTabDoc(
          doc.id, 
          doc,
          `${doc.registrazioneVisualizzazione}<span class="sottoelemento-tab">[${doc.idAzienda.aoo}]</span>`,
          `Protocollo generale ${pregresso ? 'pregresso ': ''}${doc.registrazioneVisualizzazione} [${doc.idAzienda.aoo}]`,
        )
      );
      if (active) {
        this.activeLastTab();
      }
    }
  }

  public addTabTip(active: boolean = true, idTipSessioneImportazione?: number): void {
    this.addTab(
      this.buildaTabTIP(idTipSessioneImportazione)
    );
    if (active) {
      this.activeLastTab();
    }
  }
}

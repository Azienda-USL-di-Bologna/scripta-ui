import { AfterViewInit, Component, ComponentFactoryResolver, ComponentRef, Input, ViewChild } from "@angular/core";
import { TabItem } from "./tab-item";
import { TabComponent } from "./tab.component";
import { TabDirective } from "./tab.directive";

@Component({
  selector: 'tab-wrapper',
  template: '<ng-template tabDirective></ng-template>',
  styles: [':host { height: 100%; }']
})
export class TabWrapperComponent implements AfterViewInit {
  private _item: TabItem;
  get item(): TabItem { return this._item; }
  @Input() set item(item: TabItem) {
    this._item = item;
  }

  /**
   * La proprietà id è passata ad esempio quando item.data contiene un archivio.
   * Si potrebbe dire quindi che non serve perché l'id è comunque presente dentro a item.data.archivio.id
   * Il fatto è che se dentro item.data viene cambaito qualcosa, angular non vede il cambiamento.
   * Non viene triggerato il setter di item. Allora uso il setter dell'id per catturare il trigger e
   * andare a settare nel componentRef il nuovo data.
   */
  private _id: any;
  get id(): any { return this._id; }
  @Input() set id(id: any) {
    this._id = id;
    if (this.componentRef && this.componentRef.instance) {
      this.componentRef.instance.data = this.item.data;
    }
  }

  private componentRef: ComponentRef<any>;
  
  @ViewChild(TabDirective, {static: true}) tabDirective!: TabDirective;
  
  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngAfterViewInit() {
    setTimeout(() => {
      if (!!this.item) {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.item.component);

        const viewContainerRef = this.tabDirective.viewContainerRef;
        viewContainerRef.clear();

        this.componentRef = viewContainerRef.createComponent<TabComponent>(componentFactory);
        this.componentRef.instance.data = this.item.data;
      }
    }, 0);
  }
}


import { AfterViewInit, Component, ComponentFactoryResolver, Input, ViewChild } from "@angular/core";
import { TabItem } from "./tab-item";
import { TabComponent } from "./tab.component";
import { TabDirective } from "./tab.directive";

@Component({
  selector: 'tab-wrapper',
  template: '<ng-template tabDirective></ng-template>',
  styles: [':host { height: 100%; }']
})
export class TabWrapperComponent implements AfterViewInit {
  @Input() item?: TabItem;
  @ViewChild(TabDirective, {static: true}) tabDirective!: TabDirective;
  
  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.item.component);

      const viewContainerRef = this.tabDirective.viewContainerRef;
      viewContainerRef.clear();

      const componentRef = viewContainerRef.createComponent<TabComponent>(componentFactory);
      componentRef.instance.data = this.item.data;
      /* const viewContainerRef = this.tab.viewContainerRef;
      viewContainerRef.clear();
      const componentRef = viewContainerRef.createComponent<TabComponent>(this.item.component);
      componentRef.instance.data = this.item.data; */
    }, 0);
  }
}


import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[tabDirective]',
})
export class TabDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

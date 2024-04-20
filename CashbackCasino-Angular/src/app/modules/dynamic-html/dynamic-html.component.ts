import {
    Component,
    ElementRef,
    Input,
    SimpleChanges,
    OnChanges,
    OnDestroy,
    DoCheck,
    SecurityContext,
  } from '@angular/core';
  
import { DynamicHTMLRenderer, DynamicHTMLRef } from './renderer';
import { DomSanitizer } from '@angular/platform-browser';
  
  @Component({
    selector: 'dynamic-html',
    template: ''
  })
  export class DynamicHTMLComponent implements DoCheck, OnChanges, OnDestroy {
    @Input() content: string;
    safehtml;
  
    private ref: DynamicHTMLRef = null;
  
    constructor(
      private renderer: DynamicHTMLRenderer,
      private elementRef: ElementRef,
      private sanitizer:DomSanitizer
    ) {}
  
    ngOnChanges(_: SimpleChanges) {
      if (this.ref) {
        this.ref.destroy();
        this.ref = null;
      }
      if (this.content && this.elementRef) {
        this.safehtml=this.sanitizer.sanitize(SecurityContext.HTML,this.sanitizer.bypassSecurityTrustHtml(this.content));
        this.ref = this.renderer.renderInnerHTML(this.elementRef, this.safehtml);
      }
    }
  
    ngDoCheck() {
      if (this.ref) {
        this.ref.check();
      }
    }
  
    ngOnDestroy() {
      if (this.ref) {
        this.ref.destroy();
        this.ref = null;
      }
    }
  }
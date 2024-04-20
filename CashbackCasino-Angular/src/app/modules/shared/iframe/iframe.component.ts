import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-iframe',
  templateUrl: './iframe.component.html',
  styleUrls: ['./iframe.component.scss']
})
export class IframeComponent implements OnInit {

  src;
  form;
  html;
  params;
  method;
  submit;
  container;
  constructor( private activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    // this.getIframe(this.src)
    if(this.html && this.container=='iframe') {
      let iframe = document.createElement('iframe');
      iframe.name = "hidden-iframe"
      iframe.className = "iframe"
      // iframe.src = 'data:text/html;charset=utf-8,' + encodeURI(this.html);
      iframe.srcdoc=this.html
      iframe.height = '100%';
      iframe.width = "100%";
      document.getElementById('iframecontainer').appendChild(iframe)
    }
    else if(this.container=='redirect'){
      let iframe = document.createElement('iframe');
      iframe.name = "hidden-iframe"
      iframe.className = "iframe"
      iframe.src = this.src;
      iframe.height = '450px';
      iframe.width = "100%";
      document.getElementById('iframecontainer').appendChild(iframe)
    } else if(this.container=='page-redirect') {
      this.post(this.params,this.src)
    }else if(this.container=='form_redirect'){
      this.get(this.params,this.src)
    }else{
    document.getElementById('iframecontainer').appendChild(this.form);
    this.form.submit();
    this.activeModal.close()
    }
  }

  close() {
    this.activeModal.close();
  }

  getIframe(src, height?, width?) {
    let iframe = document.createElement('iframe');
    iframe.name = "hidden-iframe"
    iframe.src = src;
    iframe.className = "iframe"
    iframe.height = height || 400;
    iframe.width = width || 800;
    
    // window.top.location.href =this.src
    if(this.container=='iframe') {
      this.form.submit();
      document.getElementById('iframecontainer').appendChild(iframe)
      this.activeModal.close();
    } else{
    document.getElementById('iframecontainer').appendChild(iframe)
    this.form.submit();
    this.activeModal.close()
    }
  }

  post(obj,url) {
    var mapForm = document.createElement("form");
    mapForm.target = "_parent";
    mapForm.method = "POST"; // or "post" if appropriate
    mapForm.action = url;
    Object.keys(obj).forEach(function(param){
      var mapInput = document.createElement("input");
      mapInput.type = "hidden";
      mapInput.name = param;
      mapInput.setAttribute("value", obj[param]);
      mapForm.appendChild(mapInput);
  });
  document.getElementById('iframecontainer')?.appendChild(mapForm);
  mapForm.submit();
  this.activeModal.close()
  }

  get(obj,url){
  var mapForm = document.createElement("form");
  mapForm.target = "_parent";
  mapForm.method = "GET"; // or "post" if appropriate
  mapForm.action = url;
  Object.keys(obj).forEach(function(param){
    var mapInput = document.createElement("input");
    mapInput.type = "hidden";
    mapInput.name = param;
    mapInput.setAttribute("value", obj[param]);
    mapForm.appendChild(mapInput);
  });
  document.getElementById('iframe-container')?.appendChild(mapForm);
  mapForm.submit();
  this.activeModal.close()
  }
}

import { AlertService } from './../../../core/services/alert.service';
import { IDocument } from './../../../core/interfaces/user';
import { DocumentService } from './../../../core/services/user.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SharedService } from 'src/app/core/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {
  @ViewChild('scrollBottom') private scrollBottom: ElementRef;
  document: FormData;
  file: any;
  description: string;
  content;
  slide: boolean=false;
  dragOver: boolean=false;
  isUploadDocumentEmpty: boolean;
  // object = { document: { attachment: null, description: null } };
  constructor(
    public documentService: DocumentService,
    private alertService: AlertService,
    private sharedService:SharedService,
    private translate:TranslateService
  ) { }

  ngOnInit(): void {
    this.getSnippetsData();
    this.documentService.getDocuments().subscribe(res => {
    });
    this.isUploadDocumentEmpty = true;
    this.document = new FormData();
  }

  onFileSelect(event,description) {
    this.dragOver=false;
    let files=event.target.files || (((event || {}).dataTransfer || {}).files || [])
    if (files.length) {
      this.isUploadDocumentEmpty = false;
      // this.file = event.target.files[0];
      this.document.append('document[attachment]', files[0]);
      this.document.append('document[description]', description);
      this.upload();
    }
    else {
      this.isUploadDocumentEmpty = true;
    }
  }

  showMore(title,text) {
    let content=this.translate.instant(text);
    let topTitle=this.translate.instant(title);
    this.alertService.displayContent(topTitle,content);
  }

  // From drag and drop
onDropSuccess(event,description) {
  event.preventDefault();
  this.onFileSelect(event,description);   
}
onDragOver(event) {
  event.preventDefault();
  this.dragOver=true;
}

onDragout(event) {
  this.dragOver=false;
}
  getSnippetsData() {
    this.sharedService.snippets.subscribe(res=>{
      this.content=res.find(snippet => snippet.id == "documents")?.content;
    });
  }

  upload() {
    if (this.isUploadDocumentEmpty) {
      return;
    }
    // this.object.document.description = this.description;
    // this.document.append('document[description]', this.description);

    // this.document.append('document', JSON.stringify(this.object.document));
    this.documentService.uploadDocument(this.document).subscribe(res => {
      this.scrollToBottom()
    })
  }

  getStatus(document: IDocument) {
    return document.status.split('_').join(' ');
  }

  edit(document: IDocument) {
    this.alertService.input('Document description', 'textarea', 'Enter document description').then(res => {
      if (res.value) {
        this.documentService.updateDocument(document.id, { document: { discription: res.value.toString() } }).subscribe(res => {
          this.scrollToBottom()

        })
      }
    })
  }
  delete(document: IDocument) {
    this.alertService.confirm('Do you want to remove this document?').then(res => {
      if (res.value) {
        this.documentService.deleteDocument(document.id).subscribe(res => {
          this.scrollToBottom()
        });
      }
    })
  }

  scrollToBottom(): void {
    try {
        this.scrollBottom.nativeElement.scrollTop = this.scrollBottom.nativeElement.scrollHeight;
    } catch(err) { }
}
}

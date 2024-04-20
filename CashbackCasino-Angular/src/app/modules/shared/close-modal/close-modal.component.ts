import { Component, EventEmitter, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'close-modal',
    templateUrl: './close-modal.component.html',
    styleUrls: ['./close-modal.component.scss']
})
export class CloseModalComponent {
    @Output() response = new EventEmitter<boolean>();
    
    constructor( private activeModal: NgbActiveModal ) { }

    close(value) {
        if (value == 'yes') {
            this.activeModal.close();
        }
        else {
            this.response.emit(false);
        }
    }
}
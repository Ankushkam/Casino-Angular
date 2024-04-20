import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  showChatWindow = new BehaviorSubject(false);
  constructor() { }

  show() {
    this.showChatWindow.next(true);
  }
}

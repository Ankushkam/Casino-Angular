import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  Toast: any;
  constructor() {
    this.Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      onOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
  }


  /**
   * Normal toast show
   * @message : Message you what to show on toast
   */
  success(message: string) {
    this.Toast.fire({
      icon: 'success',
      title: message
    })
  }

  /**
  * Normal toast show
  * @message : Message you what to show on toast
  */
  error(message: string) {
    this.Toast.fire({
      icon: 'error',
      title: message
    })
  }

  input(title: string, inputType: 'text' | 'textarea', placeholder?: string) {
    return Swal.fire({
      title: title,
      input: inputType,
      inputPlaceholder: placeholder,
      inputAttributes: {
        'aria-label': 'Type your message here'
      },
      showCancelButton: true
    })
  }

  displayContent(title,text:string) {
    return Swal.fire({
      title: title, 
      html: text,
      showCloseButton: true,
      showCancelButton:false,
      showConfirmButton:false,
      // background: 'black',
      // confirmButtonText: "<u></u>", 
    });
  }

  confirm(text: string) {
    return Swal.fire({
      title: 'Are you sure?',
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    })
  }
}

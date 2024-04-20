
import { IDocument } from './../interfaces/user';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from './http.service';
import { Observable, throwError } from 'rxjs';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { APIS } from 'src/app/common/constants';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _userName: string;
  private _email: string;
  private _country: string;

  constructor() { }

  public get country(): string {
    return this._country;
  }

  public set country(value: string) {
    this._country = value;
  }


  public get email(): string {
    return this._email;
  }
  public set email(value: string) {
    this._email = value;
  }


  public get userName(): string {
    return this._userName;
  }

  public set userName(value: string) {
    this._userName = value;
  }

}

@Injectable()
export class DocumentService implements Resolve<any> {
  userDocuments: IDocument[];
  playerdata;

  constructor(
    private httpService: HttpService,
    private alertService: AlertService
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return this.httpService.getData(APIS.PLAYER.DOCUMENTS).pipe(
      map((res: any) => {
        this.userDocuments = res.body;
      }), catchError(err => {
        return throwError(err);
      })
    )
  }
  getDocuments() {
    return this.httpService.getData(APIS.PLAYER.DOCUMENTS).pipe(
      map((res: any) => {
        this.userDocuments = res.body;
      }), catchError(err => {
        return throwError(err);
      })
    )
  }
  uploadDocument(data: any): Observable<any> {
    return this.httpService.postFormData(APIS.PLAYER.DOCUMENTS, data).pipe(
      map((res: any) => {
        this.alertService.success('Document uploaded successfully')
        this.userDocuments.push(res);
      }),
      catchError(err => throwError(err))
    )
  }

  updateDocument(documentId: number, data: { document: { discription: string } }) {
    return this.httpService.putData(`${APIS.PLAYER.DOCUMENTS}/${documentId}`, data).pipe(
      map((res: any) => {
        let document = this.userDocuments.find(document => document.id == documentId);
        document.description = data.document.discription;
        this.alertService.success('Document updated successfully')
      }),
      catchError(err => throwError(err))
    )
  }

  deleteDocument(documentId: number) {
    return this.httpService.deleteData(`${APIS.PLAYER.DOCUMENTS}/${documentId}`).pipe(
      map((res: any) => {
        let documentIndex = this.userDocuments.findIndex(document => document.id == documentId);
        this.userDocuments.splice(documentIndex, 1);
        this.alertService.success('Document deleted successfully')
      }),
      catchError(err => throwError(err))
    )
  }

  getPlayerData() {
    return this.httpService.getData(APIS.PLAYER.DATA).pipe(
      map((res: any) => {
        this.playerdata=res?.body;
      }),
      catchError(err => throwError(err))
    )
  }
}

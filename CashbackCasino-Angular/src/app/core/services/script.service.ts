import { Injectable } from "@angular/core";
import { Observable, Observer } from 'rxjs';


@Injectable({
    providedIn: 'root'
  })
export class ScriptLoaderService {
    private scripts: ScriptModel[] = [];
    removejscssfile(filename, filetype,newelement){
        var targetelement=(filetype=="js")? "script" : (filetype=="css")? "link" : "none" //determine element type to create nodelist from
        var targetattr=(filetype=="js")? "id" : (filetype=="css")? "href" : "none" //determine corresponding attribute to test for
        var allsuspects=document.getElementsByTagName(targetelement)
        for (var i=allsuspects.length-1; i>=0; i--){ //search backwards within nodelist for matching elements to remove
        if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i]?.id==filename){
            allsuspects[i].parentNode.replaceChild(newelement,allsuspects[i]);
            break; //remove element by calling parentNode.removeChild()
        }
        }
    }
     

    public load(script: ScriptModel): Observable<ScriptModel> {
        return new Observable<ScriptModel>((observer: Observer<ScriptModel>) => {
            var existingScript = this.scripts.find(s => s.name == script.name);

            // Complete if already loaded
            if (existingScript && existingScript.loaded) {
                observer.next(existingScript);
                observer.complete();
            }
            else {
                // Add the script
                this.scripts = [...this.scripts, script];

                // Load the script
                let scriptElement = document.createElement("script");
                scriptElement.type = "text/javascript";
                scriptElement.src = script.src;
                scriptElement.id=script.id

                scriptElement.onload = () => {
                    script.loaded = true;
                    observer.next(script);
                    observer.complete();
                };

                scriptElement.onerror = (error: any) => {
                    observer.error("Couldn't load script " + script.src);
                };

                document.getElementsByTagName('body')[0].appendChild(scriptElement);
        }
        });
    }
}

export interface ScriptModel {
    name: string,
    src: string,
    loaded: boolean,
    id?:string
}
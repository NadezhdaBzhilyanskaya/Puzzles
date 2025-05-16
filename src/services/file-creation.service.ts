import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface FileObject{name: string; url: SafeResourceUrl;}
@Injectable({
  providedIn: 'root'
})
export class FileCreationService {
  
  constructor(private sanitizer: DomSanitizer){}

  createJSONFile(name: string, data: any): FileObject {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/octet-stream'});
        const url = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
    return {name, url};
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { PROXY_URL } from 'src/app/consts';

@Injectable({
  providedIn: 'root',
})
export class EditService {
  private headers = new HttpHeaders().set(
    'header1',
    'Access-Control-Allow-Origin',
  );

  constructor(private http: HttpClient) {}

  public getHtmlContent(
    url: string,
    emitState?: (state: string) => {},
  ): Promise<string> {
    return fetch(PROXY_URL + url).then((data) => {
      if (emitState) emitState('Расшифровка...');
      return data.text();
    });
  }
  public getHtmlWindows1251Content(
    url: string,
    emitState?: (state: string) => {},
  ): Promise<string> {
    return fetch(PROXY_URL + url)
      .then((response) => {
        if (emitState) emitState('Расшифровка...');
        return response.arrayBuffer();
      })
      .then((buffer) => {
        let html = new TextDecoder('windows-1251').decode(buffer);
        return new Promise((resolve) => resolve(html));
      });
  }
}

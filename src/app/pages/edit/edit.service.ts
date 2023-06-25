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

  public getHtmlContent(url: string): Promise<Response> {
    return fetch(PROXY_URL + url);
  }
}

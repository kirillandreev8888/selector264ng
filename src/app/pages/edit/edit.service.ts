import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import {
  TitleInfo,
  TitlePath,
  TitleStatus,
} from 'src/app/common/interfaces/title.interface';
import { PROXY_URL } from 'src/app/consts';
import { GlobalSharedService } from 'src/app/global.shared.service';

@Injectable({
  providedIn: 'root',
})
export class EditService {
  private headers = new HttpHeaders().set(
    'header1',
    'Access-Control-Allow-Origin',
  );

  constructor(
    private http: HttpClient,
    private globalSharedService: GlobalSharedService,
    private database: AngularFireDatabase,
  ) {}

  public async getHtmlContent(
    url: string,
    emitState?: (state: string) => {},
  ): Promise<string> {
    return fetch(PROXY_URL + url).then((data) => {
      if (emitState) emitState('Расшифровка...');
      return data.text();
    });
  }
  public async getHtmlWindows1251Content(
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

  public async addTitle(title: TitleInfo) {
    // для добавления используем push в list
    return await this.database
      .list(
        `/${this.globalSharedService.currentListOwner.value}/${
          title.status == 'archive' ? 'archive' : 'titles'
        }/`,
      )
      .push(title);
  }

  public async updateTitle(title: TitleInfo, path: string, id: string) {
    // для обновления используем set на object по id
    return await this.database
      .object(
        `/${this.globalSharedService.currentListOwner.value}/${path}/${id}`,
      )
      .set(title);
  }
  public async deleteTitle(path: string, id: string) {
    // для удаления используем remove на object по id
    return await this.database
      .object(
        `/${this.globalSharedService.currentListOwner.value}/${path}/${id}`,
      )
      .remove();
  }
  public async moveTitle(
    title: TitleInfo,
    id: string,
    to: TitleStatus,
    from: TitleStatus | TitlePath | undefined = title.status,
  ) {
    if (!from) return;
    const pathFrom: TitlePath = from == 'archive' ? 'archive' : 'titles';
    const pathTo: TitlePath = to == 'archive' ? 'archive' : 'titles';
    //в зависимости от смены пути
    if (pathFrom == pathTo) {
      // если путь не меняется, то это - простое обновление
      title.status = to;
      await this.updateTitle(title, pathFrom, id);
    } else {
      // если путь меняется, меняем статус, сохраняем, удаляем старый объект
      title.status = to;
      await this.addTitle(title)
      return await this.deleteTitle(pathFrom, id)
    }
  }
}

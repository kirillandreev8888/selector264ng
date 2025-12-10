import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import request, { gql } from 'graphql-request';
import {
  TitleInfo,
  TitlePath,
  TitleStatus,
} from 'src/app/common/interfaces/title.interface';
import { PROXY_URL, PROXY_URL_FOR_JUTSU } from 'src/app/consts';
import { GlobalSharedService } from 'src/app/global.shared.service';
import { ShikimoriApiAnimesResponse } from './dto/shikimori.dto';

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
    return fetch(PROXY_URL_FOR_JUTSU + url).then((data) => {
      if (emitState) emitState('Расшифровка...');
      return data.json().then((w) => w.contents);
    });
  }

  private getAnimeIdFromUrl(url: string): number {
    const regex = /\/animes\/(\d+)/;
    const match = url.match(regex);

    return !isNaN(Number(match?.[1])) ? Number(match?.[1]) : 0;
  }

  private getShikimoriGraphQLRequest(id: number): string {
    return gql`
      {
        animes(ids: "${id}", limit: 1) {
          id
          name
          russian
          licenseNameRu
          kind
          rating
          score
          status
          episodes
          episodesAired
          duration
          airedOn {
            year
            month
            day
            date
          }
          releasedOn {
            year
            month
            day
            date
          }
          season

          poster {
            id
            originalUrl
            mainUrl
          }

          genres {
            id
            name
            russian
            kind
          }

          description
          descriptionHtml
          descriptionSource
        }
      }
    `;
  }

  async fetchShikimoriAPI(url: string): Promise<TitleInfo> {
    const animeId = this.getAnimeIdFromUrl(url);
    if (!animeId) throw new Error('Не удалось получить id аниме из url');
    try {
      const res: ShikimoriApiAnimesResponse = await request(
        'https://shikimori.one/api/graphql/',
        this.getShikimoriGraphQLRequest(animeId),
      );
      const anime = res.animes[0];
      if (!anime?.name?.length) throw new Error();

      const title: TitleInfo = {
        name: anime.russian?.length ? anime.russian : anime.name,
        pic: anime.poster?.originalUrl,
        status: anime.status == 'released' ? 'list' : 'ongoing',
        episodes:
          anime.status == 'anons'
            ? undefined
            : anime.status == 'released'
            ? anime.episodes.toString()
            : `${anime.episodesAired}/${anime.episodes}`,
        date: {
          day: anime.airedOn.day,
          month: anime.airedOn.month,
          year: anime.airedOn.year,
        },
        tags: anime.genres.map((genre) => genre.russian),
        rating: anime.score,
      };
      return title;
    } catch (e) {
      console.error(e);
      throw new Error('Не удалось получить данные с сайта shikimori');
    }
  }

  public async addTitle(title: TitleInfo, userName?: string) {
    // для добавления используем push в list
    // если указан userName, добавляем в список пользователя по userName
    return await this.database
      .list(
        `/${
          userName ? userName : this.globalSharedService.currentListOwner.value
        }/${title.status == 'archive' ? 'archive' : 'titles'}/`,
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
      await this.addTitle(title);
      return await this.deleteTitle(pathFrom, id);
    }
  }
}

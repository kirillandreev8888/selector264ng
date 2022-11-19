import { Component, OnInit } from '@angular/core';
import {
  AngularFireDatabase,
  AngularFireObject,
} from '@angular/fire/compat/database';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ToastrService } from 'ngx-toastr';
import parse from 'node-html-parser';
import {
  TitleInfo,
  TitlePath,
} from 'src/app/common/interfaces/title.interface';
import {
  parseFromJutsu,
  parseFromShikimori,
} from 'src/app/common/utils/parse.utils';
import { GlobalSharedService } from 'src/app/global.shared.service';
import { EditService } from './edit.service';

@UntilDestroy()
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit {
  mode: 'add' | 'edit' = this.activatedRoute.snapshot.data['mode'];
  id?: string = this.activatedRoute.snapshot.queryParams['id'];
  from?: TitlePath = this.activatedRoute.snapshot.queryParams['from'];

  constructor(
    private database: AngularFireDatabase,
    private toastr: ToastrService,
    private editService: EditService,
    private globalSharedService: GlobalSharedService,
    private activatedRoute: ActivatedRoute,
  ) {}
  loadingMessage?: string;
  title?: TitleInfo = {
    // shiki_link:
    // 'https://shikimori.one/animes/49918-boku-no-hero-academia-6th-season',
    // 'https://shikimori.one/animes/z5114-fullmetal-alchemist-brotherhood',
    votes: [],
    status: 'list',
  };
  ngOnInit(): void {
    // console.log(this.activatedRoute.snapshot.queryParams);
    if (this.mode == 'edit' && this.id && this.from) {
      (
        this.database.object(
          `/${this.globalSharedService.currentListOwner.value}/${this.from}/${this.id}`,
        ) as AngularFireObject<TitleInfo>
      )
        .snapshotChanges()
        .pipe(untilDestroyed(this))
        .subscribe((title) => {
          if (!title) alert('Ошибка - неверный/уже удаленный id');
          else {
            this.title = title.payload.val()!;
          }
        });
    }
    if (this.mode == 'add') {
      const query =
        this.activatedRoute.snapshot.queryParams['parseFromShikimori'];
      if (query && typeof query == 'string' && query.includes('shikimori')) {
        if (this.title) this.title.shiki_link = query;
        this.parseFrom('shikimori');
      }
    }
  }

  async parseFrom(source: 'shikimori' | 'jut.su') {
    if (!this.title) {
      this.showToastrError('Null title error');
      return;
    }
    let link = '';
    //определяем url, с которого парсим
    if (source == 'shikimori') {
      if (!this.title?.shiki_link?.length && this.title)
        this.title.shiki_link = await navigator.clipboard.readText();
      link = this.title.shiki_link ? this.title.shiki_link : '';
    } else if (source == 'jut.su') {
      if (!this.title?.watch_link?.length && this.title)
        this.title.watch_link = await navigator.clipboard.readText();
      link = this.title.watch_link ? this.title.watch_link : '';
    }
    if (link.indexOf(source) !== -1) {
      //подготовка
      const timeout = setTimeout(() => {
        if (this.loadingMessage == 'Загрузка...')
          this.loadingMessage =
            'Скорее всего, прокси спит... Ожидание, пока проснется...';
      }, 3000);
      this.loadingMessage = 'Загрузка...';
      // await new Promise((resolve) => setTimeout(resolve, 5000));
      let decipheredData =
        source == 'jut.su'
          ? await this.editService.getHtmlWindows1251Content(
              link,
              (state) => (this.loadingMessage = state),
            )
          : await this.editService.getHtmlContent(
              link,
              (state) => (this.loadingMessage = state),
            );
      this.loadingMessage = 'Обработка...';
      const root = parse(decipheredData);
      //очищаем поля
      this.cleanTitle();
      //вызываем нужный парсер
      switch (source) {
        case 'shikimori':
          parseFromShikimori(root, this.title);
          break;
        case 'jut.su':
          parseFromJutsu(root, this.title);
          break;
      }
      this.loadingMessage = undefined;
      clearTimeout(timeout);
    } else alert('Неправильная ссылка');
  }

  cleanTitle() {
    delete this.title?.episodes;
    delete this.title?.date;
    delete this.title?.tags;
    delete this.title?.rating;
  }

  /** проверить валидость поля рейтинг и исправить в случае ошибки */
  checkAndFixRating() {
    if (this.title?.rating && isNaN(Number(this.title?.rating))) {
      this.title.rating = 0;
      return;
    }
    if (this.title?.rating && this.title.rating < 0) {
      this.title.rating = 0;
      return;
    }
    if (this.title?.rating && this.title.rating > 10) {
      this.title.rating = 10;
      return;
    }
  }

  async saveTitle() {
    if (!this.title) {
      this.showToastrError('Null title error');
      return;
    }
    if (this.mode == 'add') {
      await this.editService.addTitle(this.title);
    } else if (this.mode == 'edit' && this.from && this.id) {
      await this.editService.updateTitle(this.title, this.from, this.id);
    }
    window.history.back();
  }

  async deleteTitle() {
    if (!this.title || !this.from || !this.id) {
      this.showToastrError('Null title error');
      return;
    }
    await this.editService.deleteTitle(this.from, this.id);
    window.history.back();
  }

  async archiveTitle() {
    if (!this.title || !this.from || !this.id) {
      this.showToastrError('Null title error');
      return;
    }
    await this.editService.moveTitle(this.title, this.id, 'archive', this.from);
    window.history.back();
  }

  async moveTitleToList() {
    if (!this.title || !this.from || !this.id) {
      this.showToastrError('Null title error');
      return;
    }
    await this.editService.moveTitle(this.title, this.id, 'list');
    window.history.back();
  }

  showToastrError(error: string): void {
    this.toastr.error(error, undefined, {
      timeOut: 3000,
      closeButton: true,
    });
  }
}

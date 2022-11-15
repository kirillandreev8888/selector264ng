import { Component, OnInit } from '@angular/core';
import {
  AngularFireDatabase,
  AngularFireObject,
} from '@angular/fire/compat/database';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ToastrService } from 'ngx-toastr';
import parse from 'node-html-parser';
import { TitleInfo } from 'src/app/common/interfaces/title.interface';
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
  from?: 'titles' | 'archive' =
    this.activatedRoute.snapshot.queryParams['from'];

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
    if (this.mode == 'edit' && this.id && this.from)
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
      let decipheredData: string;
      if (source != 'jut.su') {
        const data = await this.editService.getHtmlContent(link);
        this.loadingMessage = 'Расшифровка...';
        decipheredData = await data.text();
      } else {
        decipheredData = await this.editService.getHtmlWindows1251Content(link);
      }
      this.loadingMessage = 'Обработка...';
      const root = parse(decipheredData);
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

  async saveTitle() {
    if (!this.title) {
      this.showToastrError('Null title error');
      return;
    }
    if (this.mode == 'add') {
      await this.database
        .list(
          `/${this.globalSharedService.currentListOwner.value}/${
            this.title.status == 'archive' ? 'archive' : 'titles'
          }/`,
        )
        .push(this.title);
    } else if (this.mode == 'edit') {
      await this.database
        .object(
          `/${this.globalSharedService.currentListOwner.value}/${this.from}/${this.id}`,
        )
        .set(this.title);
    }
    window.history.back();
  }

  async deleteTitle() {
    if (!this.title) {
      this.showToastrError('Null title error');
      return;
    }
    await this.database
      .object(
        `/${this.globalSharedService.currentListOwner.value}/${this.from}/${this.id}`,
      )
      .remove();
    window.history.back();
  }

  async archiveTitle() {
    if (!this.title) {
      this.showToastrError('Null title error');
      return;
    }
    //сначала добавляем в архив
    this.title.status = 'archive';
    await this.database
      .list(`/${this.globalSharedService.currentListOwner.value}/archive/`)
      .push(this.title);
    //потом удаляем из списка
    await this.database
      .object(
        `/${this.globalSharedService.currentListOwner.value}/${this.from}/${this.id}`,
      )
      .remove();
    window.history.back();
  }

  async moveTitleToList() {
    if (!this.title) {
      this.showToastrError('Null title error');
      return;
    }
    this.title.status = 'list';
    await this.database
      .object(
        `/${this.globalSharedService.currentListOwner.value}/${this.from}/${this.id}`,
      )
      .set(this.title);
    window.history.back();
  }

  showToastrError(error: string): void {
    this.toastr.error(error, undefined, {
      timeOut: 3000,
      closeButton: true,
    });
  }
}

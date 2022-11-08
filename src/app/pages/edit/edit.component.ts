import { Component, OnInit } from '@angular/core';
import {
  AngularFireDatabase,
  AngularFireObject,
} from '@angular/fire/compat/database';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import parse from 'node-html-parser';
import { TtileInfo } from 'src/app/common/interfaces/title.interface';
import { parseFromShikimori } from 'src/app/common/utils/parse.utils';
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
  from?: string = this.activatedRoute.snapshot.queryParams['from'];

  constructor(
    private database: AngularFireDatabase,
    private editService: EditService,
    private globalSharedService: GlobalSharedService,
    private activatedRoute: ActivatedRoute,
  ) {}
  loadingMessage?: string;
  title: TtileInfo = {
    shiki_link:
      // 'https://shikimori.one/animes/49918-boku-no-hero-academia-6th-season',
      'https://shikimori.one/animes/z5114-fullmetal-alchemist-brotherhood',
    votes: [],
  };
  ngOnInit(): void {
    console.log(this.activatedRoute.snapshot.queryParams);
    if (this.mode == 'edit' && this.id && this.from)
      (
        this.database.object(
          `/${this.globalSharedService.currentListOwner}/${this.from}/${this.id}`,
        ) as AngularFireObject<TtileInfo>
      )
        .snapshotChanges()
        .pipe(untilDestroyed(this))
        .subscribe((title) => {
          if (!title) alert('Ошибка - неверный/уже удаленный id');
          else this.title = title.payload.val()!;
        });
  }

  async parseFrom(source: 'shikimori') {
    if (this.title.shiki_link?.indexOf(source) !== -1) {
      //подготовка
      const timeout = setTimeout(() => {
        if (this.loadingMessage == 'Загрузка...')
          this.loadingMessage =
            'Скорее всего, прокси спит... Ожидание, пока проснется...';
      }, 3000);
      this.loadingMessage = 'Загрузка...';
      // await new Promise((resolve) => setTimeout(resolve, 5000));
      const data = await this.editService.getHtmlContent(
        this.title.shiki_link!,
      );
      this.loadingMessage = 'Расшифровка...';
      const decipheredData = await data.text();
      this.loadingMessage = 'Обработка...';
      const root = parse(decipheredData);
      //вызываем нужный парсер
      switch (source) {
        case 'shikimori':
          parseFromShikimori(root, this.title);
          break;
      }
      this.loadingMessage = undefined;
      clearTimeout(timeout);
    } else alert('Неправильная ссылка');
  }

  async saveTitle() {
    if (this.mode == 'add') {
      this.database
        .list(
          `/${this.globalSharedService.currentListOwner}/${
            this.title.status == 'archive' ? 'archive' : 'titles'
          }/`,
        )
        .push(this.title);
    } else if (this.mode == 'edit') {
      this.database
        .object(
          `/${this.globalSharedService.currentListOwner}/${
            this.title.status == 'archive' ? 'archive' : 'titles'
          }/${this.id}`,
        )
        .set(this.title);
    }
  }

  deleteTitle() {}

  archiveTitle() {}
}

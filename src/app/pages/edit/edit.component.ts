import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { ActivatedRoute } from '@angular/router';
import parse from 'node-html-parser';
import { TtileInfo } from 'src/app/common/interfaces/title.interface';
import { parseFromShikimori } from 'src/app/common/utils/parse.utils';
import { EditService } from './edit.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit {
  mode: string = this.activatedRoute.snapshot.data['mode'];
  constructor(
    private database: AngularFireDatabase,
    private editService: EditService,
    private activatedRoute: ActivatedRoute,
  ) {}
  loadingMessage?: string;
  title: TtileInfo = {
    shiki_link:
      // 'https://shikimori.one/animes/49918-boku-no-hero-academia-6th-season',
      'https://shikimori.one/animes/z5114-fullmetal-alchemist-brotherhood',
    votes: [],
  };
  ngOnInit(): void {}

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
    this.database
      .list(
        `/${'test'}/${this.title.status == 'archive' ? 'archive' : 'titles'}/`,
      )
      .push(this.title);
  }
}

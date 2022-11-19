import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  AngularFireDatabase,
  AngularFireObject,
} from '@angular/fire/compat/database';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs/operators';
import {
  TitleInfoWithId,
  TitleInfo,
  TitlePath,
} from 'src/app/common/interfaces/title.interface';
import { GlobalSharedService } from 'src/app/global.shared.service';
import { EditService } from '../edit/edit.service';
import parse from 'node-html-parser';
import { parseFromShikimori } from 'src/app/common/utils/parse.utils';

@UntilDestroy()
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  // width: string = 'undefined';
  // @ViewChild('container') container?: ElementRef;

  /** тест */
  test = undefined;
  /** режим работы листа по наву - список/архив */
  mode: TitlePath = this.activatedRoute.snapshot.data['mode'];
  /** режим работы листа по вкладке - вышло/не вышло */
  submode?: 'list' | 'ongoing' = this.activatedRoute.snapshot.data['submode'];
  /** список тайтлов */
  titles: TitleInfoWithId[] = [];
  /** открыто ли правое меню */
  rightMenuOpen: boolean = false;
  /** случайный тайтл в правом меню */
  randomTitle?: Partial<TitleInfoWithId>;
  /** список выбранных тайтлов для случайного выбора */
  checkedTitles: Record<string, boolean> = {};
  /** объект работы с обновлением онгоингов */
  ongoingUpdateData?: {
    total: number;
    processed: number;
    cameOutList: string[];
  };
  /** тип сортировки */
  sort: 'add' | 'release' | 'votes' | 'rating' =
    <'add' | 'release'>localStorage.getItem('sort') || 'add';
  constructor(
    private activatedRoute: ActivatedRoute,
    private database: AngularFireDatabase,
    private toastr: ToastrService,
    private globalSharedService: GlobalSharedService,
    private editService: EditService,
  ) {}
  ngOnInit(): void {
    // setInterval(()=>{
    // if (this.container?.nativeElement?.offsetWidth)
    //   this.width =this.container.nativeElement.offsetWidth;
    // }, 35)
    this.globalSharedService.currentListOwner
      .pipe(untilDestroyed(this))
      .subscribe((currentListOwner) => {
        (
          this.database.object(
            `/${currentListOwner}/${this.mode}`,
          ) as AngularFireObject<Record<string, TitleInfo>>
        )
          .valueChanges()
          .pipe(
            untilDestroyed(this),
            map((res) => {
              const list: TitleInfoWithId[] = Object.keys(res!)
                .map((id) => {
                  return {
                    id: id,
                    ...res![id],
                  };
                })
                .filter(
                  (title) =>
                    this.mode == 'archive' || title.status == this.submode,
                );
              // console.log(list);
              return list;
            }),
          )
          .subscribe((res) => {
            this.randomTitle = undefined;
            this.checkedTitles = {};
            this.titles = res;
          });
      });
  }

  /** сохранить текущий выбранный режим сортировки в localStorage */
  saveSortMode(){
    localStorage.setItem('sort', this.sort);
  }

  /** выбирает из списка тайтлов случайный и вставляет в правое меню */
  getRandomTitle() {
    let checkedTitles = Object.keys(this.checkedTitles).filter(
      (id) => this.checkedTitles[id],
    );
    let ids = checkedTitles.length
      ? checkedTitles
      : this.titles.map((t) => t.id);
    let sample = _.sample(ids);
    let title = this.titles.find((t) => t.id == sample);
    if (!title) {
      this.toastr.error('Неизвестная ошибка', undefined, {
        timeOut: 2000,
        closeButton: true,
      });
    } else {
      this.randomTitle = title;
      document.getElementById(title.id)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  /** начать обновление списка онгоингов */
  async initiateOngoingUpdate() {
    let titlesToUpdate = _.cloneDeep(this.titles).filter((title) =>
      title.shiki_link?.includes('shikimori'),
    );
    if (!titlesToUpdate.length) return;
    this.ongoingUpdateData = {
      total: titlesToUpdate.length,
      processed: 0,
      cameOutList: [],
    };
    for (let title of titlesToUpdate) {
      const oldStatus = title.status;
      const root = parse(
        await this.editService.getHtmlContent(title.shiki_link!),
      );
      parseFromShikimori(root, title);
      if (title.status != oldStatus)
        this.ongoingUpdateData.cameOutList.push(
          title.name ? title.name : 'Unnamed',
        );
      let id = title.id;
      delete (title as TitleInfo & { id?: string }).id;
      await this.editService.updateTitle(title, this.mode, id);
      this.ongoingUpdateData.processed++;
    }
  }
}

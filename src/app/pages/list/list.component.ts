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
} from 'src/app/common/interfaces/title.interface';
import { GlobalSharedService } from 'src/app/global.shared.service';

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
  mode: 'titles' | 'archive' = this.activatedRoute.snapshot.data['mode'];
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
  constructor(
    private activatedRoute: ActivatedRoute,
    private database: AngularFireDatabase,
    private toastr: ToastrService,
    private globalSharedService: GlobalSharedService,
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
  initiateOngoingUpdate(){
    
  }
}

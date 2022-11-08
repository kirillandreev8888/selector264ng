import { Component, OnInit } from '@angular/core';
import {
  AngularFireDatabase,
  AngularFireObject,
} from '@angular/fire/compat/database';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';
import { TitleInfoWithId, TtileInfo } from 'src/app/common/interfaces/title.interface';
import { GlobalSharedService } from 'src/app/global.shared.service';

@UntilDestroy()
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  mode: 'titles' | 'archive' = this.activatedRoute.snapshot.data['mode'];
  constructor(
    private activatedRoute: ActivatedRoute,
    private database: AngularFireDatabase,
    private globalSharedService: GlobalSharedService,
  ) {}
  titles: TitleInfoWithId[] = [];
  test = undefined;
  ngOnInit(): void {
    (
      this.database.object(
        `/${this.globalSharedService.currentListOwner}/titles`,
      ) as AngularFireObject<Record<string, TtileInfo>>
    )
      .valueChanges()
      .pipe(
        untilDestroyed(this),
        map((res) => {
          const list: TitleInfoWithId[] = Object.keys(res!).map((id) => {
            return {
              id: id,
              ...res![id],
            };
          });
          // console.log(list);
          return list;
        }),
      )
      .subscribe((res) => (this.titles = res));
  }
}

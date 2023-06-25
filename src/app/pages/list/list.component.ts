import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { map } from 'rxjs/operators';
import { TtileInfo } from 'src/app/common/interfaces/title.interface';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  constructor(private database: AngularFireDatabase) {}
  titles: TtileInfo[] = [];
  test = undefined;
  ngOnInit(): void {
    this.database
      .list('/test/titles')
      .valueChanges()
      .pipe(
        map((res) => {
          // console.log(res);
          return <TtileInfo[]>res;
        }),
      )
      .subscribe((res) => (this.titles = res));
  }
}

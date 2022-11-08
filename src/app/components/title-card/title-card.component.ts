import { Component, Input, OnInit } from '@angular/core';
import { TitleInfoWithId, TtileInfo } from 'src/app/common/interfaces/title.interface';

@Component({
  selector: 'titleCard',
  templateUrl: './title-card.component.html',
  styleUrls: ['./title-card.component.scss'],
})
export class TitleCardComponent implements OnInit {
  @Input()  mode?: 'titles' | 'archive';
  @Input() title!: TitleInfoWithId;
  constructor() {}

  ngOnInit(): void {}
}

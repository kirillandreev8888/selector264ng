import { Component, Input, OnInit } from '@angular/core';
import { TtileInfo } from 'src/app/common/interfaces/title.interface';

@Component({
  selector: 'titleCard',
  templateUrl: './title-card.component.html',
  styleUrls: ['./title-card.component.scss'],
})
export class TitleCardComponent implements OnInit {
  @Input() title!: TtileInfo;
  constructor() {}

  ngOnInit(): void {}
}

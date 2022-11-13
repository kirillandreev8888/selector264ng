import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TitleInfoWithId, TitleInfo } from 'src/app/common/interfaces/title.interface';

@Component({
  selector: 'titleCard',
  templateUrl: './title-card.component.html',
  styleUrls: ['./title-card.component.scss'],
})
export class TitleCardComponent implements OnInit {
  @Input()  mode?: 'titles' | 'archive';
  @Input() title!: TitleInfoWithId;
  @Input()  checked!: boolean;
  @Output() checkedChange = new EventEmitter<boolean>();
  constructor() {}

  ngOnInit(): void {}

  onCheck(){
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked)
  }
}

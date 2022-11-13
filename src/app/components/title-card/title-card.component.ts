import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  TitleInfoWithId,
  TitleInfo,
  VoteValue,
  Vote,
} from 'src/app/common/interfaces/title.interface';
import { GlobalSharedService } from 'src/app/global.shared.service';
@UntilDestroy()
@Component({
  selector: 'titleCard',
  templateUrl: './title-card.component.html',
  styleUrls: ['./title-card.component.scss'],
})
export class TitleCardComponent implements OnInit {
  @Input() mode?: 'titles' | 'archive';
  @Input() title!: TitleInfoWithId;
  @Input() checked!: boolean;
  @Output() checkedChange = new EventEmitter<boolean>();
  constructor(public globalSharedService: GlobalSharedService) {}
  userVote?: VoteValue = this.getUserVote();
  yesVotes: string[] = this.getVotes('yes');
  okVotes: string[] = this.getVotes('ok');
  noVotes: string[] = this.getVotes('no');

  ngOnInit(): void {}

  //обработка голосов
  /** выдать список пользователей, отдавших конкретный голос */
  getVotes(voteValue: VoteValue): string[] {
    return this.title?.votes
      ? this.title.votes
          .filter((v) => v.value == voteValue)
          .map((v) =>
            v.name == this.globalSharedService.currentUser.value
              ? 'Вы'
              : v.name,
          )
      : [];
  }
  getUserVote(): VoteValue | undefined {
    if (this.title?.votes)
      for (let vote of this.title.votes)
        if (vote.name == this.globalSharedService.currentUser.value)
          return vote.value;
    return undefined;
  }

  onCheck() {
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
  }

  voteClick(vote: VoteValue) {}
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import * as _ from 'lodash';
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
  constructor(
    public globalSharedService: GlobalSharedService,
    private database: AngularFireDatabase,
  ) {}
  /** за что отдан голос текущего пользователя */
  userVote?: VoteValue;
  // количество и расшифровка голосов
  yesVotes?: string;
  yesNumber = 0;
  okVotes?: string;
  okNumber = 0;
  noVotes?: string;
  noNumber = 0;
  topVotesNumber = 0;

  ngOnInit(): void {
    this.countVotes();
  }

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
  /** считает голоса при инициализации компонента и сохраняет в отображаемые переменные */
  countVotes() {
    this.userVote = this.getUserVote();
    this.yesVotes = this.getVotes('yes').join(', ');
    this.yesNumber = this.getVotes('yes').length;
    this.okVotes = this.getVotes('ok').join(', ');
    this.okNumber = this.getVotes('ok').length;
    this.noVotes = this.getVotes('no').join(', ');
    this.noNumber = this.getVotes('no').length;
    this.topVotesNumber = Math.max(
      this.yesNumber,
      this.okNumber,
      this.noNumber,
    );
  }

  onCheck() {
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
  }

  async voteClick(vote: VoteValue) {
    if (!this.title) return;
    if (!this.title.votes?.length) this.title.votes = [];
    let userVote = this.title.votes.find(
      (v) => v.name == this.globalSharedService.currentUser.value,
    );
    if (userVote) {
      if (userVote.value == vote)
        _.remove(this.title.votes, (v) => v.name == userVote?.name);
      userVote.value = vote;
    } else
      this.title.votes.push({
        name: this.globalSharedService.currentUser.value,
        value: vote,
      });
    await this.database
      .object(
        `/${this.globalSharedService.currentListOwner.value}/${this.mode}/${this.title.id}`,
      )
      .set(this.title);
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import {
  TitleInfoWithId,
  Vote,
  VoteValue,
} from 'src/app/common/interfaces/title.interface';

@Pipe({
  name: 'titlesSort',
})
export class TitlesSortPipe implements PipeTransform {
  transform(
    value: TitleInfoWithId[],
    sort: 'add' | 'release' | 'votes' | 'rating',
    archive?: boolean,
  ): TitleInfoWithId[] {
    if (!!archive) sort='add';
    if (sort == 'add') return _.reverse(_.cloneDeep(value));
    else if (sort == 'release')
      return _.cloneDeep(value).sort((a, b) => {
        if (!a.date || !b.date) return 0;
        else {
          let aDate = NgbDate.from(a.date);
          if (aDate?.before(b.date)) return 1;
          else if (aDate?.after(b.date)) return -1;
          else return 0;
        }
      });
    else if (sort == 'rating')
      return _.cloneDeep(value).sort((a, b) =>
        a.rating && b.rating ? b.rating - a.rating : 0,
      );
    else {
      return _.cloneDeep(value).sort((a, b) => {
        if (!a.votes || !b.votes) return 0;
        else return getVotesSum(b.votes) - getVotesSum(a.votes);
      });
    }
  }
}

const voteValueNumbers: Record<VoteValue, number> = {
  yes: 1,
  ok: 0,
  no: -1,
};
const getVotesSum = (votes: Vote[]) => {
  return _.sum(votes.map((vote) => voteValueNumbers[vote.value]));
};

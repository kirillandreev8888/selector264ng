import { Pipe, PipeTransform } from '@angular/core';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { TitleInfoWithId } from 'src/app/common/interfaces/title.interface';

@Pipe({
  name: 'titlesSort'
})
export class TitlesSortPipe implements PipeTransform {

  transform(value: TitleInfoWithId[], sort: 'add'|'release'): TitleInfoWithId[] {
    if (sort=='add') return value;
    else return _.cloneDeep(value).sort((a,b)=>{
      if (!a.date || !b.date) return 0;
      else{
        let aDate = NgbDate.from(a.date);
        if (aDate?.before(b.date)) return -1;
        else if (aDate?.after(b.date)) return 1;
        else return 0;
      }
    })
  }

}

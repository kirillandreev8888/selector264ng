import { Pipe, PipeTransform } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Pipe({
  name: 'ngbDate',
})
export class NgbDatePipe implements PipeTransform {
  transform(ngbDate?: NgbDateStruct): unknown {
    if (!ngbDate) return 'н/у';
    return new Intl.DateTimeFormat('ru', { dateStyle: 'long' }).format(
      new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day),
    );
  }
}

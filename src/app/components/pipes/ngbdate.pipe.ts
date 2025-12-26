import { Pipe, PipeTransform } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Pipe({
  name: 'ngbDate',
})
export class NgbDatePipe implements PipeTransform {
  transform(ngbDate?: NgbDateStruct): unknown {
    try {
      if (!ngbDate) throw new Error('Нет даты');
      return formatRussianDate(ngbDate);
    } catch (e) {
      if (e instanceof RangeError){
        console.error(ngbDate)
      }
      return 'н/у';
    }
  }
}

function formatRussianDate(date: Partial<NgbDateStruct> | null | undefined): string {
  if (!date || !date.year) return '';

  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  const parts: string[] = [];

  // Добавляем день (с ведущим нулем, если нужно)
  if (date.day) {
    parts.push(`${date.day}`);
  }

  // Добавляем название месяца (учитываем, что в NgbDateStruct январь = 1)
  if (date.month && date.month >= 1 && date.month <= 12) {
    parts.push(months[date.month - 1]);
  }

  // Добавляем год
  parts.push(`${date.year} г.`);

  return parts.join(' ');
}
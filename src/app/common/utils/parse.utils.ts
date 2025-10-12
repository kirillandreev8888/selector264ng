import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { HTMLElement } from 'node-html-parser';
import { TitleInfo } from '../interfaces/title.interface';

export const parseFromShikimori = (root: HTMLElement, title: TitleInfo) => {
  //имя
  const h1Text = root.querySelector('h1')?.innerHTML.split('<span')?.[0];
  if (h1Text?.toLowerCase().includes('эта страница содержит'))
    throw 'Ошибка парсинга - требуется регистрация.'
  title.name = h1Text;
  //картинка
  title.pic = root.querySelector('.c-poster img')?.getAttribute('src');
  //статус
  title.status =
    root.querySelector('.b-anime_status_tag')?.getAttribute('data-text') ===
    'вышло'
      ? 'list'
      : 'ongoing';
  //серии
  let keys = root.querySelectorAll('.line-container .line .key');
  for (let key of keys)
    if (key.textContent.includes('Эпизоды')) {
      title.episodes = key.nextElementSibling.innerText
        ?.replace(/[^0-9?//]/g, ' ')
        .trim();
    }
  //дата
  for (let key of keys)
    if (key.textContent.includes('Статус')) {
      const value = key.nextElementSibling.lastChild as HTMLElement;
      let dateString =
        value.nodeType == 1 ? value.getAttribute('title')! : value.rawText;
      // console.log(dateString)
      title.date = parseDateFromShikimori(dateString);
    }
  //теги
  title.tags = [];
  root
    .querySelectorAll('.genre-ru')
    .forEach((tag) => title.tags?.push(tag.innerText));
  //рейтинг
  const rating = Number(root.querySelector('.score-value')?.innerText);
  if (!isNaN(rating))
    title.rating = Number(root.querySelector('.score-value')?.innerText);
};
//TODO добавить в парсеры сброс тайтла
const parseDateFromShikimori = (dateString: string): NgbDateStruct => {
  // берем только 1 часть (начало выпуска), разделяем на массив символосочетаний
  let syms = dateString
    .split(/по|-/)[0]
    .split(' ')
    .filter((ch) => ch.length && (ch.length > 2 || !isNaN(Number(ch))));
  let day: number | undefined;
  let month: number | undefined;
  let year: number | undefined;
  // проходим по этому массиву
  for (let sym of syms) {
    let num = Number(sym);
    //если не число, то это должен быть месяц
    if (isNaN(num)) {
      if (sym.toLowerCase().startsWith('янв'.toLowerCase())) month = 1;
      else if (sym.toLowerCase().startsWith('фев'.toLowerCase())) month = 2;
      else if (sym.toLowerCase().startsWith('мар'.toLowerCase())) month = 3;
      else if (sym.toLowerCase().startsWith('апр'.toLowerCase())) month = 4;
      else if (
        sym.toLowerCase().startsWith('май'.toLowerCase()) ||
        sym.toLowerCase().startsWith('мая'.toLowerCase())
      )
        month = 5;
      else if (sym.toLowerCase().startsWith('июн'.toLowerCase())) month = 6;
      else if (sym.toLowerCase().startsWith('июл'.toLowerCase())) month = 7;
      else if (sym.toLowerCase().startsWith('авг'.toLowerCase())) month = 8;
      else if (sym.toLowerCase().startsWith('сен'.toLowerCase())) month = 9;
      else if (sym.toLowerCase().startsWith('окт'.toLowerCase())) month = 10;
      else if (sym.toLowerCase().startsWith('ноя'.toLowerCase())) month = 11;
      else if (sym.toLowerCase().startsWith('дек'.toLowerCase())) month = 12;
    } else {
      //если число, то либо день, либо год
      if (0 < num && num < 32) day = num;
      else if (1900 < num && num < 2100) year = num;
    }
  }
  return {
    day: day ? day : 1,
    month: month ? month : 6,
    year: year ? year : 9999,
  };
};

export const parseFromJutsu = (root: HTMLElement, title: TitleInfo) => {
  const str = root.querySelector('.all_anime_title')?.getAttribute('style');
  title.pic = str?.substring(str.indexOf('(') + 2, str.indexOf(')') - 1);
  let newName = root.querySelector('h1')?.innerHTML;
  // console.log(root.querySelector('h1'))
  newName = newName
    ?.replace('Смотреть ', '')
    .replace(' все серии', '')
    .replace(' и сезоны', '');
  title.name = newName;
  const newStat = root.querySelector('.under_video_additional')?.innerHTML;
  if (newStat?.indexOf('онгоинг') === -1) {
    title.status = 'list';
  } else {
    title.status = 'ongoing';
  }

  try {
    let episodes = root.querySelectorAll('a.the_hildi');
    let seasons: Record<number, number> = {};
    for (let episode of episodes) {
      let a = episode.innerHTML.split('</i>')[0];
      a = a.replace(/[^0-9]/g, '');
      if (!isNaN(Number(a))) {
        const b = Number(a);
        if (!seasons[b]) seasons[b] = 1;
        else seasons[b]++;
      }
    }
    const extra = seasons[0];
    delete seasons[0];
    if (seasons[1])
      title.episodes =
        Object.keys(seasons)
          .map((s) => `s${s}(${seasons[Number(s)]})`)
          .join(', ') + (extra ? ` + ${extra}` : '');
    else title.episodes = String(extra);

    let tags = root
      .querySelectorAll('.under_video_additional a')
      .map((meta) => {
        return _.last(meta.innerHTML.split('</i>'));
      })
      .filter((tag) => tag && !tag.match(/[0-9]/g))
      .map((t) => t![0].toUpperCase() + t!.substring(1));
    title.tags = tags;
  } catch {}
};

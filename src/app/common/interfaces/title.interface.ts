import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

export interface TitleInfo {
  name?: string;
  pic?: string;
  shiki_link?: string;
  status?: 'list' | 'ongoing' | 'archive';
  votes?: Vote[];
  watch_link?: string;
  torrent_link?: string;
  date?: NgbDateStruct;
  episodes?: string;
  tags?: string[];
  rating?: number;
  description?: string;
}
export interface Vote {
  name: string;
  value: VoteValue;
}

export type VoteValue = 'yes'|'ok'|'no';

export type TitleInfoWithId = TitleInfo & { id: string };

export interface UserInfo {
  userName: string;
  name: string;
  hasList: boolean;
}

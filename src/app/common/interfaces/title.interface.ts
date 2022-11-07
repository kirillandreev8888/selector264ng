import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

export interface TtileInfo {
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
  value: 'yes'|'ok'|'no';
}

export interface UserInfo {
  userName: string;
  name: string;
  hasList: boolean;
}

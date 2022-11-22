import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserInfo } from './common/interfaces/title.interface';

@Injectable({
  providedIn: 'root',
})
export class GlobalSharedService {
  constructor() {}

  currentUser = new BehaviorSubject<UserInfo>(
    getItemFromLocalStorage('currentUser') || {
      hasList: true,
      userName: 'ker264',
      name: 'Макс',
    },
  );
  currentListOwner = new BehaviorSubject<string>(
    localStorage.getItem('currentListOwner') || 'ker264',
    // 'test'
  );
}

const getItemFromLocalStorage = (key: string): UserInfo | null => {
  const value = localStorage.getItem(key);
  if (!value) return null;
  else
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
};

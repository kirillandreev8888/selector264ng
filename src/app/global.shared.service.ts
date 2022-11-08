import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalSharedService {
  constructor() {}

  currentUser: string = localStorage.getItem('currentUser') || 'Макс';
  currentListOwner: string = 'test'
    // localStorage.getItem('currentListOwner') || 'ker264';
}

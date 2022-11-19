import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlobalSharedService {
  constructor() {}

  currentUser = new BehaviorSubject<string>(
    localStorage.getItem('currentUser') || 'Макс',
  );
  currentListOwner = new BehaviorSubject<string>(
    localStorage.getItem('currentListOwner') || 'ker264',
    // 'test'
  );
}

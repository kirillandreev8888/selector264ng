import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { UserInfo } from 'src/app/common/interfaces/title.interface';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  users: UserInfo[] = [];

  currentUser: string = localStorage.getItem('currentUser')
    ? localStorage.getItem('currentUser')!
    : 'Макс';
  currentListOwner: string = localStorage.getItem('currentListOwner')
    ? localStorage.getItem('currentListOwner')!
    : 'ker264';

  setListOwner(listOwner: string) {
    this.currentListOwner = listOwner;
  }
  setUser(user: string) {
    this.currentUser = user;
  }
  constructor(private database: AngularFireDatabase) {}

  ngOnInit(): void {
    this.database
      .list('/users')
      .valueChanges()
      .subscribe((u) => (this.users = <UserInfo[]>u));
  }
}

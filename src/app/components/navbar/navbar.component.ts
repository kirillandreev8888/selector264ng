import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { UserInfo } from 'src/app/common/interfaces/title.interface';
import { GlobalSharedService } from 'src/app/global.shared.service';

@UntilDestroy()
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  users: UserInfo[] = [];



  setListOwner(listOwner: string) {
    this.globalSharedService.currentListOwner.next(listOwner);
  }
  setUser(user: string) {
    this.globalSharedService.currentUser.next(user);
  }
  constructor(
    private database: AngularFireDatabase,
    public globalSharedService: GlobalSharedService,
  ) {}

  ngOnInit(): void {
    this.database
      .list('/users')
      .valueChanges()
      .pipe(untilDestroyed(this))
      .subscribe((u) => (this.users = <UserInfo[]>u));
  }
}

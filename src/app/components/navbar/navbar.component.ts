import { Component, OnInit } from '@angular/core';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  users: { userName: string; name: string; hasList?: boolean }[] = [
    { name: 'Макс', userName: 'ker264', hasList: true },
    { name: 'Паша', userName: 'LordAsheron', hasList: true },
    { name: 'Ника', userName: 'Tecnika', hasList: true },
    { name: 'Кирилл', userName: 'uspdd' },
  ];

  constructor() {}

  ngOnInit(): void {}
}

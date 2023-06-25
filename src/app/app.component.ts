import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private database: AngularFireDatabase) {}

  ngOnInit(): void {
    // this.database.object('/').valueChanges().subscribe(res=>console.log(res))
  }
}

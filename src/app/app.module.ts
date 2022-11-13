import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NgxNavbarModule } from 'ngx-bootstrap-navbar';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { FIREBASE_CONFIG } from 'src/environments/firebase.config';
import { ListComponent } from './pages/list/list.component';
import { TitleCardComponent } from './components/title-card/title-card.component';
import { EditComponent } from './pages/edit/edit.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { NgbDatePipe } from './components/pipes/ngbdate.pipe';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [AppComponent, NavbarComponent, ListComponent, TitleCardComponent, EditComponent, NgbDatePipe],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    BrowserAnimationsModule,
    FormsModule,
    NgxNavbarModule,
    AngularFireModule.initializeApp(FIREBASE_CONFIG),
    AngularFireDatabaseModule,
    NgSelectModule,
    HttpClientModule,
    ToastrModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

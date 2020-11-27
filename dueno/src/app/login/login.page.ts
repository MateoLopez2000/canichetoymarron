import { Component, NgModule, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth'
import { AlertController } from '@ionic/angular';
import { FirestoreService } from '../services/data/firestore.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  user= {
    email: '',
    password: ''
  }

  constructor(
    private router: Router,
    public ngFireAuth: AngularFireAuth,
    private firestoreService: FirestoreService,
    private alertCtrl:AlertController
    ) { }

  ngOnInit() {
  }

  async login() {
    await this.ngFireAuth.signInWithEmailAndPassword(this.user.email, this.user.password).
    then(
      ()=>{
      this.router.navigate(['/tabs/sucursales']);
      },
      async error=> {
        const alert = await this.alertCtrl.create({
          message:error.message,
          buttons:[{text: 'ok',role:'cancel',handler:()=>{
          },},],
        },
        );
        await alert.present();
      }
    )
  }

  async register() {
    await this.ngFireAuth.createUserWithEmailAndPassword(this.user.email, this.user.password).
    then(
      ()=>{
      this.router.navigate(['/tabs/sucursales']);
      },
      async error=> {
        const alert = await this.alertCtrl.create({
          message:error.message,
          buttons:[{text: 'ok',role:'cancel',handler:()=>{
          },},],
        },
        );
        await alert.present();
      }
    )
    var split = this.user.email.split( '@' , 1 );
    this.firestoreService.insertMoto('Motos', this.user.email, split[0] );
  }
  async resetPassword() {
    this.router.navigate(['/password-recovery']);
  }
}

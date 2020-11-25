import { Component, NgModule, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth'
import { AlertController } from '@ionic/angular';

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
    private alertCtrl:AlertController
    ) { }

  ngOnInit() {
  }

  async login() {
    await this.ngFireAuth.signInWithEmailAndPassword(this.user.email, this.user.password).
    then(
      ()=>{
      this.router.navigate(['/tabs/maps']);
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
      this.router.navigate(['/tabs/maps']);
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
  async resetPassword() {
    this.router.navigate(['/password-recovery']);
  }
}

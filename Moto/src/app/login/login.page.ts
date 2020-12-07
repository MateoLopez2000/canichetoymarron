import { Component, NgModule, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/auth'
import { AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';

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
    private database: AngularFirestore, 
    public ngFireAuth: AngularFireAuth,
    private alertCtrl:AlertController,
    private firestoreService: AuthService,
    ) { }

  ngOnInit() {
  }

  async login() {
    await this.ngFireAuth.signInWithEmailAndPassword(this.user.email, this.user.password).
    then(
      ()=>{
        this.database.collection("Motos").doc(this.user.email).update({estado: "disponible"});
        this.router.navigate(['/tabs/map']);
        this.verifyFirstLogin();
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
  verifyFirstLogin(){
    this.firestoreService.getEspecificMoto("Motos", this.user.email).subscribe((moto: any) => {
      if (moto.flogin === true) {
        this.router.navigate(['/password-recovery']); 
        this.user.email= '';
        this.user.password= '';
        this.ngFireAuth.signOut();
      } else if (this.user.email !== '') {
        this.router.navigate(['/tabs/map']);
      }
    });
  }
  async resetPassword() {
    this.router.navigate(['/password-recovery']);
  }
}

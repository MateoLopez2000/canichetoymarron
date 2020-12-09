import { Component, OnInit } from '@angular/core';
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
  };

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
        this.firestoreService.getEspecificMoto("Motos", this.user.email).subscribe((moto: any) => {
          if (moto.rol === "dueno") {
            this.router.navigate(['/tabs/sucursales']);
          }else {
            alert("you don't belong here")
          }
        });
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

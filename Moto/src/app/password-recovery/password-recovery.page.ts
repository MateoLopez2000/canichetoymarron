import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth'
import { AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.page.html',
  styleUrls: ['./password-recovery.page.scss'],
})
export class PasswordRecoveryPage implements OnInit {
  user= {
    email: ''
  }

  constructor(
    private router: Router,
    public ngFireAuth: AngularFireAuth,
    private alertCtrl:AlertController,
    private firestoreService: AuthService,
  ) { }

  ngOnInit() {
  }

  async reset() {
    await this.ngFireAuth.sendPasswordResetEmail(this.user.email).
    then(
      async ()=> {
        const alert = await this.alertCtrl.create({
          message:'Check your Email to Reset Password',
          buttons:[{text: 'ok',role:'cancel',handler:()=>{
            this.firestoreService.updateEspecificlogin("Motos", this.user.email);
            this.router.navigateByUrl('');
          },},],
        },
        );
        await alert.present();
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

}

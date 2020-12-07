import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { FirestoreService } from '../services/data/firestore.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  user = {
    email: '',
    password: ''
  }
  rol:string;

  constructor(
    private router: Router,
    public ngFireAuth: AngularFireAuth,
    private firestoreService: FirestoreService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
  }

  async register() {
    console.log(this.rol);
    await this.ngFireAuth.createUserWithEmailAndPassword(this.user.email, this.user.password).
      then(
        () => {
          this.router.navigate(['/tabs/sucursales']);
        },
        async error => {
          const alert = await this.alertCtrl.create({
            message: error.message,
            buttons: [{
              text: 'ok', role: 'cancel', handler: () => {
              },
            },],
          },
          );
          await alert.present();
        }
      )
    var split = this.user.email.split('@', 1);
    this.firestoreService.insertMoto('Motos', this.user.email, split[0], this.rol);
    this.user.email = "";
    this.user.password = "";
  }

}

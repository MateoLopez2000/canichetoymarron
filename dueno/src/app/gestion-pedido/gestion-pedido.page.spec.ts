import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GestionPedidoPage } from './gestion-pedido.page';

describe('GestionPedidoPage', () => {
  let component: GestionPedidoPage;
  let fixture: ComponentFixture<GestionPedidoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestionPedidoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GestionPedidoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { Component, OnInit } from '@angular/core';
import {AuthService} from '../shared/services/auth.service';
import {JWTTokenService} from '../shared/services/jwt-token.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(
    public auth: AuthService,
    public jwtTokenService: JWTTokenService
  ) { }

  ngOnInit(): void {
  }

}

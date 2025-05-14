import { Component } from '@angular/core';

import { AccountService } from './services/account.service';
import { Role } from './models/role';

@Component({ selector: 'app', templateUrl: 'app.component.html' })
export class AppComponent {
    Role = Role;
    account: Account;

    constructor(private accountService: AccountService) {
        this.accountService.account.subscribe(x => this.account = x);
    }

    logout() {
        this.accountService.logout();
    }
}

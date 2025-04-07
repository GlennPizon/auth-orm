import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { Account } from '@app/_models';
import { AccountService, AlertService } from '@app/_service';

@Component({ 
    templateUrl: 'list.component.html',
    styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
    accounts: Account[] = [];
    loading = false;
    deletingId: string | null = null;

    constructor(
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.loadAccounts();
    }

    loadAccounts() {
        this.loading = true;
        this.accountService.getAll()
            .pipe(first())
            .subscribe({
                next: (accounts) => {
                    this.accounts = accounts;
                    this.loading = false;
                },
                error: (error) => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    deleteAccount(id: string) {
        const account = this.accounts.find(x => x.id === id);
        if (!account) return;

        if (!confirm(`Are you sure you want to delete ${account.firstName} ${account.lastName}?`)) {
            return;
        }

        account.isDeleting = true;
        this.deletingId = id;
        
        this.accountService.delete(id)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.accounts = this.accounts.filter(x => x.id !== id);
                    this.alertService.success('Account deleted successfully');
                },
                error: (error) => {
                    this.alertService.error(error);
                    account.isDeleting = false;
                },
                complete: () => {
                    this.deletingId = null;
                }
            });
    }
}
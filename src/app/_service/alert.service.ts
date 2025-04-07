import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Alert, AlertType } from '@app/models'; // Fixed path (assuming standard structure)

@Injectable({ providedIn: 'root' })
export class AlertService {
    private subject = new Subject<Alert>(); // Fixed generic type syntax
    private defaultId = 'default-alert';    // Fixed typo (`=` to `-`)

    // Enable subscribing to alerts observable
    onAlert(id: string = this.defaultId): Observable<Alert> {
        return this.subject.asObservable().pipe(
            filter(x => x && x.id === id)
        );
    }

    // Convenience methods
    success(message: string, options?: Partial<Alert>) {
        this.alert(new Alert({ ...options, type: AlertType.Success, message }));
    }

    error(message: string, options?: Partial<Alert>) {
        this.alert(new Alert({ ...options, type: AlertType.Error, message }));
    }

    info(message: string, options?: Partial<Alert>) {
        this.alert(new Alert({ ...options, type: AlertType.Info, message }));
    }

    warn(message: string, options?: Partial<Alert>) {
        this.alert(new Alert({ ...options, type: AlertType.Warning, message }));
    }

    // Core alert method
    alert(alert: Alert) {
        alert.id = alert.id || this.defaultId;
        alert.autoClose = (alert.autoClose === undefined) ? true : alert.autoClose; // Fixed ternary syntax
        this.subject.next(alert);
    }

    //clear alerts 
    clear(id = this.defaultId) {
        this.subject.next(new Alert({id}));
    }
}
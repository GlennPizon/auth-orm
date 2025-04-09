# UserManagementSystemFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

---

## Features Documentation

### 1. Profile Management
The **Profile Management** feature allows users to view and update their personal information.

#### Implementation Steps:
1. **Create a Profile Component**:
   ```bash
   ng generate component profile
   ```
2. **Add Profile Routes**:
   Add a route for the profile component in the `app-routing.module.ts`:
   ```typescript
   { path: 'profile', component: ProfileComponent }
   ```
3. **Bind User Data**:
   Use the `AccountService` to fetch and update user data:
   ```typescript
   this.accountService.getProfile().subscribe(profile => {
       this.profile = profile;
   });
   ```
4. **Update Profile**:
   Add a form to allow users to update their profile information.

---

### 2. Admin Dashboard
The **Admin Dashboard** provides an interface for administrators to manage users and view system statistics.

#### Implementation Steps:
1. **Create an Admin Module**:
   ```bash
   ng generate module admin --routing
   ```
2. **Generate Dashboard Component**:
   ```bash
   ng generate component admin/dashboard
   ```
3. **Add Admin Routes**:
   Add routes for the admin module in `admin-routing.module.ts`:
   ```typescript
   { path: 'admin', component: DashboardComponent }
   ```
4. **Implement Features**:
   - Add user management (CRUD operations).
   - Display system statistics using charts or tables.

---

### 3. Fake Backend
The **Fake Backend** is used for development and testing purposes to simulate API responses.

#### Implementation Steps:
1. **Create a Fake Backend Provider**:
   Implement a fake backend in `src/app/_helpers/fake-backend.ts`:
   ```typescript
   import { Injectable } from '@angular/core';
   import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
   import { Observable, of, throwError } from 'rxjs';
   import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

   @Injectable()
   export class FakeBackendInterceptor implements HttpInterceptor {
       intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
           const { url, method, headers, body } = request;

           // Simulate API responses
           if (url.endsWith('/users') && method === 'GET') {
               return of(new HttpResponse({ status: 200, body: [{ id: 1, name: 'John Doe' }] }))
                   .pipe(delay(500));
           }

           return next.handle(request);
       }
   }
   ```
2. **Register the Fake Backend**:
   Add the fake backend provider in `app.module.ts`:
   ```typescript
   providers: [
       { provide: HTTP_INTERCEPTORS, useClass: FakeBackendInterceptor, multi: true }
   ]
   ```

---

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
<<<<<<< HEAD
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
=======
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
>>>>>>> origin/ayoub

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
<<<<<<< HEAD
    provideHttpClient(withInterceptors([authInterceptor]))
=======
    provideHttpClient(),
>>>>>>> origin/ayoub
  ]
};

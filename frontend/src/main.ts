import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

<<<<<<< HEAD
bootstrapApplication(App, {
  providers: [provideRouter(routes)]
});
=======
bootstrapApplication(App, appConfig).catch(console.error);
>>>>>>> origin/ayoub

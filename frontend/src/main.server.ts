<<<<<<< HEAD
import 'zone.js';
import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
=======
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
>>>>>>> origin/ayoub
import { App } from './app/app';
import { config } from './app/app.config.server';

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(App, config, context);

export default  bootstrap;

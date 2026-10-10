import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { authInterceptor } from './auth-interceptor';
import {imageInterceptor} from './image-intereceptor';

export const httpInterceptorProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: imageInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useValue: authInterceptor, multi: true }
];


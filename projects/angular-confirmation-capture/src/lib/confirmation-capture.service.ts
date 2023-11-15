import { ApplicationRef, createComponent, Injectable } from '@angular/core';

import { ConfirmationCaptureComponent } from './confirmation-capture.component';
import { ConfirmationCaptureConfiguration } from './confirmation-capture-configuration';
import { Theme } from './theme';

/**
 * A singleton service to programmatically show a confirmation box to capture an user's consent.
 */
@Injectable({
  providedIn: 'root'
})
export class ConfirmationCaptureService {
  private static _defaultTheme = Theme.LIGHT;

  constructor(private readonly _applicationRef: ApplicationRef) {}

  /**
   * Set the default theme that will be used for all confirmation captures created in the future.
   *
   * @param theme The new theme to be used as the default.
   */
  static setDefaultTheme(theme: Theme) {
    ConfirmationCaptureService._defaultTheme = theme;
  }

  /**
   * Open a confirmation capture using the provided configuration. Return a promise that
   * resolves to `true` if confirm button is clicked, `false` otherwise.
   *
   * @param confirmationCaptureConfiguration The confirmation capture configuration object.
   */
  open(confirmationCaptureConfiguration: ConfirmationCaptureConfiguration) {
    return new Promise<boolean>(resolve => {
      const confirmationCaptureComponentRef = createComponent(ConfirmationCaptureComponent, {
        environmentInjector: this._applicationRef.injector
      });
      const confirmationCaptureComponent = confirmationCaptureComponentRef.instance;

      confirmationCaptureComponent.setOnConfirmListener(() => {
        resolve(true);

        confirmationCaptureComponentRef.location.nativeElement.onanimationend = () => {
          confirmationCaptureComponentRef.destroy();
        };
      });

      confirmationCaptureComponent.setOnCancelListener(() => {
        resolve(false);

        confirmationCaptureComponentRef.location.nativeElement.onanimationend = () => {
          confirmationCaptureComponentRef.destroy();
        };
      });

      this._applicationRef.attachView(confirmationCaptureComponentRef.hostView);

      document.body.appendChild(confirmationCaptureComponentRef.location.nativeElement);

      if (confirmationCaptureConfiguration.theme === undefined) {
        confirmationCaptureConfiguration.theme = ConfirmationCaptureService._defaultTheme;
      }
      confirmationCaptureComponent.open(confirmationCaptureConfiguration);
    });
  }
}

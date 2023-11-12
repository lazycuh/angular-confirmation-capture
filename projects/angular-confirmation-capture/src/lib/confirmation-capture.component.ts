import { Component, ViewEncapsulation } from '@angular/core';

import { ConfirmationCaptureConfiguration } from './confirmation-capture-configuration';
import { Theme } from './theme';

@Component({
  encapsulation: ViewEncapsulation.None,
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    '[class]':
      // eslint-disable-next-line max-len
      '"lc-confirmation-capture " + (_theme + " ") + (_enter ? "enter" : "leave") + (_className ? " " + _className : "")'
  },
  selector: 'lc-confirmation-capture',
  styleUrls: ['./confirmation-capture.component.scss'],
  templateUrl: './confirmation-capture.component.html'
})
export class ConfirmationCaptureComponent {
  /**
   * The confirmation message content.
   *
   * @private Used by template.
   */
  _content!: string;

  /**
   * @private Used by template.
   */
  _cancelButtonLabel?: string;

  /**
   * @private Used by template.
   */
  _confirmButtonLabel?: string;

  /**
   * Whether or not the confirmation capture is entering into view.
   *
   * @private Used by template.
   */
  _enter = false;

  /**
   * Whether or not the notification is entering into view.
   *
   * @private Used by template.
   */
  _theme = Theme.LIGHT;

  _className?: string;

  /**
   * Whether or not clicking on the backdrop will dismiss the confirmation capture.
   */
  private _dismissible = true;
  private _onConfirmListener?: () => void;
  private _onCancelListener?: () => void;

  open(confirmationCaptureConfiguration: ConfirmationCaptureConfiguration) {
    const defaultTheme = Theme.LIGHT;
    const defaultCancelButtonLabel = 'Cancel';
    const defaultConfirmButtonLabel = 'Confirm';

    this._cancelButtonLabel = confirmationCaptureConfiguration.cancelButtonLabel || defaultCancelButtonLabel;
    this._className = confirmationCaptureConfiguration.className;
    this._confirmButtonLabel = confirmationCaptureConfiguration.confirmButtonLabel || defaultConfirmButtonLabel;
    this._content = confirmationCaptureConfiguration.content;
    this._dismissible =
      confirmationCaptureConfiguration.dismissible !== undefined
        ? confirmationCaptureConfiguration.dismissible
        : this._dismissible;
    this._theme = confirmationCaptureConfiguration.theme || defaultTheme;
    this._enter = true;
  }

  setOnConfirmListener(fn: () => void) {
    this._onConfirmListener = fn;
  }

  setOnCancelListener(fn: () => void) {
    this._onCancelListener = fn;
  }

  /**
   * @private Used by template.
   */
  _onBackdropPointerUp() {
    if (this._dismissible) {
      this._enter = false;
      this._onCancelListener?.();
    }
  }

  /**
   * @private Used by template.
   */
  _onCancel() {
    this._enter = false;
    this._onCancelListener?.();
  }

  /**
   * @private Used by template.
   */
  _onConfirm() {
    this._enter = false;
    this._onConfirmListener?.();
  }
}

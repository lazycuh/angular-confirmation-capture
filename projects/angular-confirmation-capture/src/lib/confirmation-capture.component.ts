import { ChangeDetectionStrategy, Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeValue } from '@angular/platform-browser';

import { ConfirmationCaptureConfiguration } from './confirmation-capture-configuration';
import { Theme } from './theme';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]':
      // eslint-disable-next-line max-len
      '"lc-confirmation-capture " + (_theme() + " ") + (_enter() ? "enter" : "leave") + (_className() ? " " + _className() : "")'
  },
  selector: 'lc-confirmation-capture',
  standalone: true,
  styleUrls: ['./confirmation-capture.component.scss'],
  templateUrl: './confirmation-capture.component.html'
})
export class ConfirmationCaptureComponent {
  /**
   * The confirmation message content.
   */
  protected readonly _content = signal<SafeValue>('');
  protected readonly _cancelButtonLabel = signal<string | undefined>(undefined);
  protected readonly _confirmButtonLabel = signal<string | undefined>(undefined);

  /**
   * Whether or not the confirmation capture is entering into view.
   */
  protected readonly _enter = signal(false);

  /**
   * Whether or not the notification is entering into view.
   */
  protected readonly _theme = signal<Theme | undefined>(undefined);
  protected readonly _className = signal<string | undefined>(undefined);

  private readonly _domSanitizer = inject(DomSanitizer);

  /**
   * Whether or not clicking on the backdrop will dismiss the confirmation capture.
   */
  private _dismissible = true;
  private _onConfirmListener?: () => void;
  private _onCancelListener?: () => void;

  open(confirmationCaptureConfiguration: ConfirmationCaptureConfiguration) {
    this._cancelButtonLabel.set(confirmationCaptureConfiguration.cancelButtonLabel);
    this._className.set(confirmationCaptureConfiguration.className);
    this._confirmButtonLabel.set(confirmationCaptureConfiguration.confirmButtonLabel);

    if (confirmationCaptureConfiguration.bypassHtmlSanitization === true) {
      this._content.set(this._domSanitizer.bypassSecurityTrustHtml(confirmationCaptureConfiguration.content));
    } else {
      this._content.set(confirmationCaptureConfiguration.content);
    }

    this._dismissible = confirmationCaptureConfiguration.dismissible ?? this._dismissible;
    this._theme.set(confirmationCaptureConfiguration.theme);
    this._enter.set(true);
  }

  setOnConfirmListener(fn: () => void) {
    this._onConfirmListener = fn;
  }

  setOnCancelListener(fn: () => void) {
    this._onCancelListener = fn;
  }

  protected _onBackdropClick(event: Event) {
    event.stopPropagation();

    if (this._dismissible) {
      this._enter.set(false);
      this._onCancelListener?.();
    }
  }

  protected _onCancel(event: Event) {
    event.stopPropagation();

    this._enter.set(false);
    this._onCancelListener?.();
  }

  protected _onConfirm(event: Event) {
    event.stopPropagation();

    this._enter.set(false);
    this._onConfirmListener?.();
  }
}

import { Theme } from './theme';

/**
 * The configuration object for the confirmation capture to be created.
 */
export interface ConfirmationCaptureConfiguration {
  /**
   * Whether to bypass Angular's default sanitization rules for HTML content (such as removing inline style).
   * Default is `false`.
   */
  bypassHtmlSanitization?: boolean;

  /**
   * The optional label for the cancel button. Default is `Cancel`.
   */
  cancelButtonLabel?: string;

  /**
   * The optional class name to add for this confirmation capture.
   */
  className?: string;

  /**
   * The optional label for the confirm button. Default is `Confirm`.
   */
  confirmButtonLabel?: string;

  /**
   * The required confirmation capture's content to show. HTML is supported.
   *
   * If the HTML content contains inline style, it will be stripped out by Angular's default sanitization step,
   * to bypass this behavior, pass `true` to `bypassHtmlSanitization` option.
   */
  content: string;

  /**
   * Whether or not the confirmation capture can be closed by clicking the backdrop.
   */
  dismissible?: boolean;

  /**
   * The optional theme for the floating box. Default is `light`.
   */
  theme?: Theme;
}

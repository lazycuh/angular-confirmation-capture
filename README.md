# angular-confirmation-capture [![](https://circleci.com/gh/lazycuh/angular-confirmation-capture.svg?style=svg&logo=appveyor)](https://app.circleci.com/pipelines/github/lazycuh/angular-confirmation-capture?branch=main)

A singleton, global Angular service to programmatically show a confirmation box to capture an user's consent.

## Table of contents

<!-- toc -->

- [Angular compatibility](#angular-compatibility)
- [Installation](#installation)
- [Available APIs](#available-apis)
  - [`ConfirmationCaptureService`](#confirmationcaptureservice)
  - [`ConfirmationCaptureConfiguration`](#confirmationcaptureconfiguration)
  - [`Theme`](#theme)
- [Example Usage](#example-usage)
  - [Code example](#code-example)
  - [Result](#result)

<!-- tocstop -->

## Angular compatibility

| This library | Angular |
| ------------ | ------- |
| 1.x.x        | 16 - 18 |

## Installation

- `npm`
  ```
  npm i -S @lazycuh/angular-confirmation-capture
  ```
- `pnpm`
  ```
  pnpm i -S @lazycuh/angular-confirmation-capture
  ```
- `yarn`
  ```
  yarn add @lazycuh/angular-confirmation-capture
  ```

## Available APIs

### `ConfirmationCaptureService`

A singleton service to programmatically show a confirmation box to capture an user's consent.

```ts
class ConfirmationCaptureService {
  /**
   * Set the default theme that will be used for all confirmation captures created in the future.
   *
   * @param theme The new theme to be used as the default.
   */
  static setDefaultTheme(theme: Theme): void;

  /**
   * Set the default label for the cancel button. Default is `Cancel`.
   */
  static setDefaultCancelButtonLabel(label: string): void;

  /**
   * Set the default label for the confirm button. Default is `Confirm`.
   */
  static setDefaultConfirmButtonLabel(label: string): void;

  /**
   * Open a confirmation capture using the provided configuration. Return a promise that
   * resolves to `true` if confirm button is clicked, `false` otherwise.
   *
   * @param confirmationCaptureConfiguration The confirmation capture configuration object.
   */
  open(confirmationCaptureConfiguration: ConfirmationCaptureConfiguration): Promise<boolean>;
}
```

### `ConfirmationCaptureConfiguration`

The configuration object for the confirmation capture to be created.

```ts
interface ConfirmationCaptureConfiguration {
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
```

### `Theme`

```ts
type Theme = 'dark' | 'light';
```

<br/>

## Example Usage

### Code example

```typescript
// Import the service into your class to start using it
import { ConfirmationCaptureService } from '@lazycuh/angular-confirmation-capture';
import { NotificationService } from '@lazycuh/angular-notification';

@Component({
  selector: 'test-component',
  template: `
    <button
      type="button"
      (click)="openConfirmationCapture()">
      Click me
    </button>
  `
})
export class TestComponent {
  constructor(
    private readonly confirmationCaptureService: ConfirmationCaptureService,
    private readonly notificationService: NotificationService
  ) {}

  openConfirmationCapture() {
    this.confirmationCaptureService
      .open({
        content: 'Do you want to proceed?'
      })
      .then(confirmed => {
        if (confirmed) {
          this.notificationService.open({
            content: 'You clicked confirmed'
          });
        } else {
          this.notificationService.open({
            content: 'You clicked cancel'
          });
        }
      });
  }
}
```

### Result

- Dark theme
  ![Confirmation capture example with dark theme](docs/example-1-dark-theme.gif)

- Light theme
  ![Example for notification with light theme](./docs/example-2-light-theme.gif)

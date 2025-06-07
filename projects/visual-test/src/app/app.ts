import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmationCaptureService } from 'projects/angular-confirmation-capture/src/public-api';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'lc-root',
  styleUrl: './app.scss',
  templateUrl: './app.html'
})
export class App {
  private readonly _confirmationCaptureService = inject(ConfirmationCaptureService);

  openConfirmationCapture() {
    void this._confirmationCaptureService.open({
      cancelButtonLabel: 'Cancel',
      confirmButtonLabel: 'Confirm',
      content: 'Do you want to proceed with this action?'
    });
  }
}

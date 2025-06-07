/* eslint-disable @stylistic/quotes */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { fireEvent, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { delayBy, renderComponent } from 'projects/angular-confirmation-capture/test/helpers';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfirmationCaptureService } from './confirmation-capture.service';
import { ConfirmationCaptureConfiguration } from './confirmation-capture-configuration';

const DEFAULT_CONTENT = 'Are you sure?';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'lc-test',
  template: '<ng-container />'
})
export class TestComponentRenderer {
  readonly service = inject(ConfirmationCaptureService);

  openConfirmationCapture(config: Partial<ConfirmationCaptureConfiguration> = {}) {
    return this.service.open({
      content: DEFAULT_CONTENT,
      ...config
    });
  }
}

describe(ConfirmationCaptureService.name, () => {
  const classSelectorPrefix = '.lc-confirmation-capture';
  let testComponentRenderer: TestComponentRenderer;

  beforeEach(async () => {
    const renderResult = await renderComponent(TestComponentRenderer);
    testComponentRenderer = renderResult.fixture.componentInstance;
  });

  it('Should render a confirmation capture with the provided content', async () => {
    void testComponentRenderer.openConfirmationCapture({
      content: 'Do you want to proceed?'
    });

    await delayBy(16);

    expect(screen.getByText('Do you want to proceed?')).toBeInTheDocument();
  });

  it('Should render a confirmation capture with the provided content as HTML', async () => {
    void testComponentRenderer.openConfirmationCapture({
      content: '<strong>Do you want to proceed?</strong>'
    });

    await delayBy(16);

    expect(document.body.querySelector(`${classSelectorPrefix}__content`)!.innerHTML).toEqual(
      '<strong>Do you want to proceed?</strong>'
    );
  });

  it('Should sanitize/strip out inline style by default', async () => {
    void testComponentRenderer.openConfirmationCapture({
      content: '<strong style="font-weight: bold">Hello World</strong>'
    });

    await delayBy(16);

    expect(document.body.querySelector(`${classSelectorPrefix}__content`)!.innerHTML).toEqual(
      '<strong>Hello World</strong>'
    );
  });

  it('Should not sanitize/strip out inline style when bypass option is provided', async () => {
    void testComponentRenderer.openConfirmationCapture({
      bypassHtmlSanitization: true,
      content: '<strong style="font-weight: bold">Hello World</strong>'
    });

    await delayBy(16);

    expect(document.body.querySelector(`${classSelectorPrefix}__content`)!.innerHTML).toEqual(
      '<strong style="font-weight: bold">Hello World</strong>'
    );
  });

  it("Should render a confirmation capture whose cancel button's label has the provided value", async () => {
    void testComponentRenderer.openConfirmationCapture({
      cancelButtonLabel: 'Dismiss'
    });

    await delayBy(16);

    expect(screen.getByText('Dismiss')).toBeInTheDocument();
  });

  it("Should render a confirmation capture whose confirm button's label has the provided value", async () => {
    void testComponentRenderer.openConfirmationCapture({
      confirmButtonLabel: 'Agree'
    });

    await delayBy(16);

    expect(screen.getByText('Agree')).toBeInTheDocument();
  });

  it('Should use light theme by default', async () => {
    void testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    expect(document.body.querySelector(`${classSelectorPrefix}.light-theme`)).toBeInTheDocument();
  });

  it('Should be able to configure a different default theme', async () => {
    void testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    expect(document.body.querySelector(`${classSelectorPrefix}.dark-theme`)).not.toBeInTheDocument();
    expect(document.body.querySelector(`${classSelectorPrefix}.light-theme`)).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByText('Cancel'));

    await delayBy(500);

    ConfirmationCaptureService.setDefaultTheme('dark');

    void testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    expect(document.body.querySelector(`${classSelectorPrefix}.light-theme`)).not.toBeInTheDocument();
    expect(document.body.querySelector(`${classSelectorPrefix}.dark-theme`)).toBeInTheDocument();

    // Set back to the expected default
    ConfirmationCaptureService.setDefaultTheme('light');
  });

  it('Should render with the provided theme', async () => {
    void testComponentRenderer.openConfirmationCapture({
      theme: 'dark'
    });

    await delayBy(16);

    expect(document.body.querySelector(`${classSelectorPrefix}.light-theme`)).not.toBeInTheDocument();
    expect(document.body.querySelector(`${classSelectorPrefix}.dark-theme`)).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByText('Cancel'));

    await delayBy(500);

    void testComponentRenderer.openConfirmationCapture({
      theme: 'light'
    });

    await delayBy(16);

    expect(document.body.querySelector(`${classSelectorPrefix}.dark-theme`)).not.toBeInTheDocument();
    expect(document.body.querySelector(`${classSelectorPrefix}.light-theme`)).toBeInTheDocument();
  });

  it('Should add the provided class name', async () => {
    void testComponentRenderer.openConfirmationCapture({
      className: 'hello-world'
    });

    await delayBy(16);

    expect(document.body.querySelector(`${classSelectorPrefix}.hello-world`)).toBeInTheDocument();
  });

  it('Should be dismissible by default', async () => {
    void testComponentRenderer.openConfirmationCapture({
      content: 'Hello World'
    });

    await delayBy(16);

    expect(screen.getByText('Hello World')).toBeInTheDocument();

    fireEvent(document.querySelector(`${classSelectorPrefix}__backdrop`)!, new CustomEvent('click'));

    await delayBy(500);

    expect(screen.queryByText('Hello World')).not.toBeInTheDocument();
  });

  it('Should not be dismissible if `dismissible` is false', async () => {
    void testComponentRenderer.openConfirmationCapture({
      content: 'Hello World',
      dismissible: false
    });

    await delayBy(16);

    expect(screen.getByText('Hello World')).toBeInTheDocument();

    fireEvent(document.querySelector(`${classSelectorPrefix}__backdrop`)!, new CustomEvent('click'));

    await delayBy(500);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('Should insert the rendered confirmation capture as the direct child of body element', async () => {
    void testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    expect(document.body.lastElementChild).toEqual(document.body.querySelector(classSelectorPrefix));
  });

  it('Should close opened confirmation capture after cancel button is clicked', async () => {
    void testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    expect(screen.getByText(DEFAULT_CONTENT)).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByText('Cancel'));

    await delayBy(500);

    expect(screen.queryByText(DEFAULT_CONTENT)).not.toBeInTheDocument();
  });

  it('Should return a promise that resolves to false when cancel button is clicked', async () => {
    const onCancelSpy = vi.fn();

    void testComponentRenderer.openConfirmationCapture().then(onCancelSpy);

    await delayBy(16);

    const user = userEvent.setup();
    await user.click(screen.getByText('Cancel'));

    await delayBy(1000);

    expect(onCancelSpy).toHaveBeenCalledTimes(1);
    expect(onCancelSpy).toHaveBeenCalledWith(false);
  });

  it('Should close opened confirmation capture after confirm button is clicked', async () => {
    void testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    expect(screen.getByText(DEFAULT_CONTENT)).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByText('Confirm'));

    await delayBy(500);

    expect(screen.queryByText(DEFAULT_CONTENT)).not.toBeInTheDocument();
  });

  it('Should return a promise that resolves to true when confirm button is clicked', async () => {
    const onConfirmSpy = vi.fn();

    void testComponentRenderer.openConfirmationCapture().then(onConfirmSpy);

    await delayBy(16);

    const user = userEvent.setup();
    await user.click(screen.getByText('Confirm'));

    await delayBy(500);

    expect(onConfirmSpy).toHaveBeenCalledTimes(1);
    expect(onConfirmSpy).toHaveBeenCalledWith(true);
  });

  it('Should use "Cancel" as label for cancel button by default', async () => {
    void testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('Should be able to configure a different default label for cancel button', async () => {
    void testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    expect(screen.getByText('Cancel')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByText('Cancel'));

    await delayBy(500);

    ConfirmationCaptureService.setDefaultCancelButtonLabel('Dismiss');

    void testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    expect(screen.getByText('Dismiss')).toBeInTheDocument();

    // Set back to the expected default
    ConfirmationCaptureService.setDefaultCancelButtonLabel('Cancel');
  });

  it('Should use "Confirm" as label for confirm button by default', async () => {
    void testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('Should be able to configure a different default label for confirm button', async () => {
    void testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    expect(screen.getByText('Confirm')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByText('Confirm'));

    await delayBy(500);

    ConfirmationCaptureService.setDefaultConfirmButtonLabel('Yes');

    void testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();

    // Set back to the expected default
    ConfirmationCaptureService.setDefaultConfirmButtonLabel('Confirm');
  });

  it('Should stop click events from bubbling to window', async () => {
    const clickHandlerSpy = vi.fn();

    const stopPropagationSpy = vi.spyOn(CustomEvent.prototype, 'stopPropagation');

    window.addEventListener('click', clickHandlerSpy, false);

    void testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    expect(screen.getByText(DEFAULT_CONTENT)).toBeInTheDocument();

    fireEvent(document.body.querySelector(`${classSelectorPrefix}__backdrop`)!, new CustomEvent('click'));

    await delayBy(16);

    expect(clickHandlerSpy).not.toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalledTimes(1);

    window.removeEventListener('click', clickHandlerSpy, false);
  });
});

/* eslint-disable @typescript-eslint/quotes */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  assertThat,
  delayBy,
  findElementBySelector,
  fireEvent,
  getElementBySelector
} from '@babybeet/angular-testing-kit';

import { ConfirmationCaptureService } from './confirmation-capture.service';
import { ConfirmationCaptureConfiguration } from './confirmation-capture-configuration';

@Component({
  selector: 'lc-test',
  template: `<ng-container></ng-container>`
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class TestComponentRenderer {
  constructor(readonly service: ConfirmationCaptureService) {}

  openConfirmationCapture(config: Partial<ConfirmationCaptureConfiguration> = {}) {
    return this.service.open({
      content: 'Are you sure?',
      ...config
    });
  }
}

describe(ConfirmationCaptureService.name, () => {
  const classSelectorPrefix = '.lc-confirmation-capture';
  let fixture: ComponentFixture<TestComponentRenderer>;
  let testComponentRenderer: TestComponentRenderer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestComponentRenderer],
      providers: [ConfirmationCaptureService]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponentRenderer);
    testComponentRenderer = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('Should render a confirmation capture with the provided content', async () => {
    testComponentRenderer.openConfirmationCapture({
      content: 'Do you want to proceed?'
    });

    await delayBy(16);

    assertThat(`${classSelectorPrefix}__content`).hasTextContent('Do you want to proceed?');
  });

  it('Should render a confirmation capture with the provided content as HTML', async () => {
    testComponentRenderer.openConfirmationCapture({
      content: '<strong>Do you want to proceed?</strong>'
    });

    await delayBy(16);

    assertThat(`${classSelectorPrefix}__content`).hasInnerHtml('<strong>Do you want to proceed?</strong>');
    assertThat(`${classSelectorPrefix}__content`).hasTextContent('Do you want to proceed?');
  });

  it(`Should render a confirmation capture whose cancel button's label has the provided value`, async () => {
    testComponentRenderer.openConfirmationCapture({
      cancelButtonLabel: 'Dismiss'
    });

    await delayBy(16);

    assertThat(`${classSelectorPrefix}__action.cancel`).hasTextContentMatching('Dismiss');
  });

  it(`Should render a confirmation capture whose confirm button's label has the provided value`, async () => {
    testComponentRenderer.openConfirmationCapture({
      confirmButtonLabel: 'Agree'
    });

    await delayBy(16);

    assertThat(`${classSelectorPrefix}__action.confirm`).hasTextContentMatching('Agree');
  });

  it('Should use light theme by default', async () => {
    testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    assertThat(`${classSelectorPrefix}.light`).exists();
  });

  it('Should be able to configure a different default theme', async () => {
    testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    assertThat(`${classSelectorPrefix}.dark`).doesNotExist();
    assertThat(`${classSelectorPrefix}.light`).exists();

    fireEvent(`${classSelectorPrefix}__action.cancel`, 'click');

    await delayBy(500);

    ConfirmationCaptureService.setDefaultTheme('dark');

    testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    assertThat(`${classSelectorPrefix}.light`).doesNotExist();
    assertThat(`${classSelectorPrefix}.dark`).exists();

    // Set back to the expected default
    ConfirmationCaptureService.setDefaultTheme('light');
  });

  it('Should render with the provided theme', async () => {
    testComponentRenderer.openConfirmationCapture({
      theme: 'dark'
    });

    await delayBy(16);

    assertThat(`${classSelectorPrefix}.light`).doesNotExist();
    assertThat(`${classSelectorPrefix}.dark`).exists();

    fireEvent(`${classSelectorPrefix}__action.cancel`, 'click');

    await delayBy(500);

    testComponentRenderer.openConfirmationCapture({
      theme: 'light'
    });

    await delayBy(16);

    assertThat(`${classSelectorPrefix}.dark`).doesNotExist();
    assertThat(`${classSelectorPrefix}.light`).exists();
  });

  it('Should add the provided class name', async () => {
    testComponentRenderer.openConfirmationCapture({
      className: 'hello-world'
    });

    await delayBy(16);

    assertThat(`${classSelectorPrefix}.hello-world`).exists();
  });

  it('Should be dismissible by default', async () => {
    testComponentRenderer.openConfirmationCapture({
      content: 'Hello World'
    });

    await delayBy(16);

    assertThat(`${classSelectorPrefix}__content`.trim()).hasTextContent('Hello World');

    fireEvent(`${classSelectorPrefix}__backdrop`, 'click');

    await delayBy(500);

    assertThat(classSelectorPrefix).doesNotExist();
  });

  it('Should not be dismissible if `dismissible` is false', async () => {
    testComponentRenderer.openConfirmationCapture({
      content: 'Hello World',
      dismissible: false
    });

    await delayBy(16);

    assertThat(`${classSelectorPrefix}__content`).hasTextContent('Hello World');

    fireEvent(`${classSelectorPrefix}__backdrop`, 'click');

    await delayBy(500);

    expect(findElementBySelector(classSelectorPrefix)).not.toBeNull();
  });

  it('Should insert the rendered confirmation capture as the direct child of body element', async () => {
    testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    expect(document.body.lastElementChild).toEqual(getElementBySelector(classSelectorPrefix));
  });

  it('Should close opened confirmation capture after cancel button is clicked', async () => {
    testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    assertThat(classSelectorPrefix).exists();

    fireEvent(`${classSelectorPrefix}__action.cancel`, 'click');

    fixture.detectChanges();

    await delayBy(500);

    assertThat(classSelectorPrefix).doesNotExist();
  });

  it('Should return a promise that resolves to false when cancel button is clicked', async () => {
    const onCancelSpy = jasmine.createSpy();

    testComponentRenderer.openConfirmationCapture().then(onCancelSpy);

    await delayBy(16);

    fireEvent(`${classSelectorPrefix}__action.cancel`, 'click');

    fixture.detectChanges();

    await delayBy(1000);

    expect(onCancelSpy).toHaveBeenCalledTimes(1);
    expect(onCancelSpy).toHaveBeenCalledWith(false);
  });

  it('Should close opened confirmation capture after confirm button is clicked', async () => {
    testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    expect(findElementBySelector(classSelectorPrefix)).not.toBeNull();

    fireEvent(`${classSelectorPrefix}__action.confirm`, 'click');

    fixture.detectChanges();

    await delayBy(500);

    assertThat(classSelectorPrefix).doesNotExist();
  });

  it('Should return a promise that resolves to true when confirm button is clicked', async () => {
    const onConfirmSpy = jasmine.createSpy();

    testComponentRenderer.openConfirmationCapture().then(onConfirmSpy);

    await delayBy(16);

    fireEvent(`${classSelectorPrefix}__action.confirm`, 'click');

    fixture.detectChanges();

    await delayBy(500);

    expect(onConfirmSpy).toHaveBeenCalledTimes(1);
    expect(onConfirmSpy).toHaveBeenCalledWith(true);
  });

  it('Should use "Cancel" as label for cancel button by default', async () => {
    testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    assertThat(`${classSelectorPrefix}__action.cancel`).hasTextContentMatching('Cancel');
  });

  it('Should be able to configure a different default label for cancel button', async () => {
    testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    assertThat(`${classSelectorPrefix}__action.cancel`).hasTextContentMatching('Cancel');

    fireEvent(`${classSelectorPrefix}__action.cancel`, 'click');

    await delayBy(500);

    ConfirmationCaptureService.setDefaultCancelButtonLabel('Dismiss');

    testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    assertThat(`${classSelectorPrefix}__action.cancel`).hasTextContentMatching('Dismiss');

    // Set back to the expected default
    ConfirmationCaptureService.setDefaultCancelButtonLabel('Cancel');
  });

  it('Should use "Confirm" as label for confirm button by default', () => {
    testComponentRenderer.openConfirmationCapture();

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}__action.confirm`).hasTextContentMatching('Confirm');
  });

  it('Should be able to configure a different default label for confirm button', async () => {
    testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    assertThat(`${classSelectorPrefix}__action.confirm`).hasTextContentMatching('Confirm');

    fireEvent(`${classSelectorPrefix}__action.confirm`, 'click');

    await delayBy(500);

    ConfirmationCaptureService.setDefaultConfirmButtonLabel('Yes');

    testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    assertThat(`${classSelectorPrefix}__action.confirm`).hasTextContentMatching('Yes');

    // Set back to the expected default
    ConfirmationCaptureService.setDefaultConfirmButtonLabel('Confirm');
  });

  it('Should stop click events from bubbling to window', async () => {
    const clickHandlerSpy = jasmine.createSpy();

    const stopPropagationSpy = spyOn(CustomEvent.prototype, 'stopPropagation').and.callThrough();

    window.addEventListener('click', clickHandlerSpy, false);

    testComponentRenderer.openConfirmationCapture();

    await delayBy(16);

    assertThat(`${classSelectorPrefix}__content`).hasTextContent('Are you sure?');

    fireEvent(`${classSelectorPrefix}__backdrop`, 'click');

    await delayBy(16);

    expect(clickHandlerSpy).not.toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalledTimes(1);

    window.removeEventListener('click', clickHandlerSpy, false);
  });
});

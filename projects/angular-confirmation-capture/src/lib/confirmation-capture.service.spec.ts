/* eslint-disable @typescript-eslint/quotes */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {
  delayBy,
  extractTextContent,
  findElementBySelector,
  firePointerEvent,
  getElementBySelector
} from '../test-utils';

import { ConfirmationCaptureService } from './confirmation-capture.service';
import { ConfirmationCaptureConfiguration } from './confirmation-capture-configuration';
import { Theme } from './theme';

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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponentRenderer],
      providers: [ConfirmationCaptureService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponentRenderer);
    testComponentRenderer = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('Should render a confirmation capture with the provided content', () => {
    testComponentRenderer.openConfirmationCapture({
      content: 'Do you want to proceed?'
    });

    fixture.detectChanges();

    expect(extractTextContent(`${classSelectorPrefix}__content`).trim()).toEqual('Do you want to proceed?');
  });

  it('Should render a confirmation capture with the provided content as HTML', () => {
    testComponentRenderer.openConfirmationCapture({
      content: '<strong>Do you want to proceed?</strong>'
    });

    fixture.detectChanges();

    expect(getElementBySelector(`${classSelectorPrefix}__content`).innerHTML.trim()).toEqual(
      '<strong>Do you want to proceed?</strong>'
    );

    expect(extractTextContent(`${classSelectorPrefix}__content`).trim()).toEqual('Do you want to proceed?');
  });

  it(`Should render a confirmation capture whose cancel button's label has the provided value`, () => {
    testComponentRenderer.openConfirmationCapture({
      cancelButtonLabel: 'Dismiss'
    });

    fixture.detectChanges();

    expect(extractTextContent(`${classSelectorPrefix}__action.cancel`).trim()).toEqual('Dismiss');
  });

  it(`Should render a confirmation capture whose confirm button's label has the provided value`, () => {
    testComponentRenderer.openConfirmationCapture({
      confirmButtonLabel: 'Agree'
    });

    fixture.detectChanges();

    expect(extractTextContent(`${classSelectorPrefix}__action.confirm`).trim()).toEqual('Agree');
  });

  it('Should use light theme by default', () => {
    testComponentRenderer.openConfirmationCapture();

    fixture.detectChanges();

    expect(findElementBySelector(`${classSelectorPrefix}.light`)).not.toBeNull();
  });

  it('Should be able to configure a different default theme', async () => {
    testComponentRenderer.openConfirmationCapture();

    fixture.detectChanges();

    expect(findElementBySelector(`${classSelectorPrefix}.dark`)).toBeNull();
    expect(findElementBySelector(`${classSelectorPrefix}.light`)).not.toBeNull();

    firePointerEvent(`${classSelectorPrefix}__action.cancel`, 'click');

    await delayBy(1000);

    ConfirmationCaptureService.setDefaultTheme(Theme.DARK);

    testComponentRenderer.openConfirmationCapture();

    fixture.detectChanges();

    expect(findElementBySelector(`${classSelectorPrefix}.light`)).toBeNull();
    expect(findElementBySelector(`${classSelectorPrefix}.dark`)).not.toBeNull();

    // Set back to the expected default
    ConfirmationCaptureService.setDefaultTheme(Theme.LIGHT);
  });

  it('Should render with the provided theme', async () => {
    testComponentRenderer.openConfirmationCapture({
      theme: Theme.DARK
    });

    fixture.detectChanges();

    expect(findElementBySelector(`${classSelectorPrefix}.light`)).toBeNull();
    expect(findElementBySelector(`${classSelectorPrefix}.dark`)).not.toBeNull();

    firePointerEvent(`${classSelectorPrefix}__action.cancel`, 'click');

    await delayBy(1000);

    testComponentRenderer.openConfirmationCapture({
      theme: Theme.LIGHT
    });

    fixture.detectChanges();

    expect(findElementBySelector(`${classSelectorPrefix}.dark`)).toBeNull();
    expect(findElementBySelector(`${classSelectorPrefix}.light`)).not.toBeNull();
  });

  it('Should add the provided class name', () => {
    testComponentRenderer.openConfirmationCapture({
      className: 'hello-world'
    });

    fixture.detectChanges();

    expect(findElementBySelector(`${classSelectorPrefix}.hello-world`)).not.toBeNull();
  });

  it('Should be dismissible by default', async () => {
    testComponentRenderer.openConfirmationCapture({
      content: 'Hello World'
    });

    fixture.detectChanges();

    expect(extractTextContent(`${classSelectorPrefix}__content`).trim()).toEqual('Hello World');

    firePointerEvent(`${classSelectorPrefix}__backdrop`, 'pointerup');

    fixture.detectChanges();

    await delayBy(1000);

    expect(findElementBySelector(classSelectorPrefix)).toBeNull();
  });

  it('Should not be dismissible if `dismissible` is false', async () => {
    testComponentRenderer.openConfirmationCapture({
      content: 'Hello World',
      dismissible: false
    });

    fixture.detectChanges();

    expect(extractTextContent(`${classSelectorPrefix}__content`)?.trim()).toEqual('Hello World');

    firePointerEvent(`${classSelectorPrefix}__backdrop`, 'pointerup');

    fixture.detectChanges();

    await delayBy(1000);

    expect(findElementBySelector(classSelectorPrefix)).not.toBeNull();
  });

  it('Should insert the rendered confirmation capture as the direct child of body element', () => {
    testComponentRenderer.openConfirmationCapture();

    fixture.detectChanges();

    expect(document.body.lastElementChild).toEqual(getElementBySelector(classSelectorPrefix));
  });

  it('Should close opened confirmation capture after cancel button is clicked', async () => {
    testComponentRenderer.openConfirmationCapture();

    fixture.detectChanges();

    expect(findElementBySelector(classSelectorPrefix)).not.toBeNull();

    firePointerEvent(`${classSelectorPrefix}__action.cancel`, 'click');

    fixture.detectChanges();

    await delayBy(1000);

    expect(findElementBySelector(classSelectorPrefix)).toBeNull();
  });

  it('Should return a promise that resolves to false when cancel button is clicked', async () => {
    const onCancelSpy = jasmine.createSpy();

    testComponentRenderer.openConfirmationCapture().then(onCancelSpy);

    fixture.detectChanges();

    firePointerEvent(`${classSelectorPrefix}__action.cancel`, 'click');

    fixture.detectChanges();

    await delayBy(1000);

    expect(onCancelSpy).toHaveBeenCalledTimes(1);
    expect(onCancelSpy).toHaveBeenCalledWith(false);
  });

  it('Should close opened confirmation capture after confirm button is clicked', async () => {
    testComponentRenderer.openConfirmationCapture();

    fixture.detectChanges();

    expect(findElementBySelector(classSelectorPrefix)).not.toBeNull();

    firePointerEvent(`${classSelectorPrefix}__action.confirm`, 'click');

    fixture.detectChanges();

    await delayBy(1000);

    expect(findElementBySelector(classSelectorPrefix)).toBeNull();
  });

  it('Should return a promise that resolves to true when confirm button is clicked', async () => {
    const onConfirmSpy = jasmine.createSpy();

    testComponentRenderer.openConfirmationCapture().then(onConfirmSpy);

    fixture.detectChanges();

    firePointerEvent(`${classSelectorPrefix}__action.confirm`, 'click');

    fixture.detectChanges();

    await delayBy(1000);

    expect(onConfirmSpy).toHaveBeenCalledTimes(1);
    expect(onConfirmSpy).toHaveBeenCalledWith(true);
  });
});

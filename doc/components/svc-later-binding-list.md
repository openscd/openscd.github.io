# svc-later-binding-list

A sub element for showing all Sampled Value Controls.
A Sample Value Control can be edited using the standard wizard.
And when selecting a FCDA Element a custom event is fired, so other list can be updated.

## Properties

| Property              | Type                   |
|-----------------------|------------------------|
| `doc`                 | `XMLDocument`          |
| `resetSelection`      |                        |
| `selectedFcdaElement` | `Element \| undefined` |
| `selectedSvcElement`  | `Element \| undefined` |

## Methods

| Method       | Type                                             |
|--------------|--------------------------------------------------|
| `renderFCDA` | `(svcElement: Element, fcdaElement: Element): TemplateResult` |

# fcda-later-binding-list

A sub element for showing all Goose/Sampled Value Controls.
A control can be edited using the standard wizard.
And when selecting a FCDA Element a custom event is fired, so other list can be updated.

## Properties

| Property                 | Attribute    | Type                                    |
|--------------------------|--------------|-----------------------------------------|
| `controlTag`             | `controlTag` | `"SampledValueControl" \| "GSEControl"` |
| `doc`                    |              | `XMLDocument`                           |
| `resetSelection`         |              |                                         |
| `selectedControlElement` |              | `Element \| undefined`                  |
| `selectedFcdaElement`    |              | `Element \| undefined`                  |

## Methods

| Method       | Type                                             |
|--------------|--------------------------------------------------|
| `renderFCDA` | `(controlElement: Element, fcdaElement: Element): TemplateResult` |

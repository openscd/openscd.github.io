# gse-control-editor

## Properties

| Property                 | Type                           | Description                                      |
|--------------------------|--------------------------------|--------------------------------------------------|
| `doc`                    | `XMLDocument`                  | The document being edited as provided to plugins by [[`OpenSCD`]]. |
| `selectGSEControlButton` | `Button`                       |                                                  |
| `selectedGseControl`     | `Element \| null \| undefined` |                                                  |
| `selectionList`          | `FilteredList`                 |                                                  |

## Methods

| Method                | Type                 |
|-----------------------|----------------------|
| `renderSelectionList` | `(): TemplateResult` |

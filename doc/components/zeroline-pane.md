# zeroline-pane

[[`Zeroline`]] pane for displaying `Substation` and/or `IED` sections.

## Properties

| Property          | Attribute  | Type                                             | Default    | Description                                      |
|-------------------|------------|--------------------------------------------------|------------|--------------------------------------------------|
| `commmap`         |            | `IconButton`                                     |            |                                                  |
| `doc`             |            | `XMLDocument`                                    |            | The document being edited as provided to editor by [[`Zeroline`]]. |
| `getAttachedIeds` |            | `((element: Element) => Element[]) \| undefined` | "() => []" |                                                  |
| `readonly`        | `readonly` | `boolean`                                        | false      |                                                  |
| `showieds`        |            | `IconButtonToggle`                               |            |                                                  |

## Methods

| Method                       | Type                 | Description                                      |
|------------------------------|----------------------|--------------------------------------------------|
| `openCommunicationMapping`   | `(): void`           |                                                  |
| `openCreateSubstationWizard` | `(): void`           | Opens a [[`WizardDialog`]] for creating a new `Substation` element. |
| `renderIedContainer`         | `(): TemplateResult` |                                                  |
| `toggleShowIEDs`             | `(): void`           |                                                  |

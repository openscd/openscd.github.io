# zeroline-pane

[[`Zeroline`]] pane for displaying `Substation` and/or `IED` sections.

## Properties

| Property          | Attribute  | Type                                             | Default          | Description                                      |
|-------------------|------------|--------------------------------------------------|------------------|--------------------------------------------------|
| `doc`             |            | `XMLDocument`                                    |                  | The document being edited as provided to editor by [[`Zeroline`]]. |
| `getAttachedIeds` |            | `((element: Element) => Promise<Element[]>) \| undefined` | "async () => []" |                                                  |
| `readonly`        | `readonly` | `boolean`                                        | false            |                                                  |

## Methods

| Method                       | Type                          | Description                                      |
|------------------------------|-------------------------------|--------------------------------------------------|
| `openCreateSubstationWizard` | `(): void`                    | Opens a [[`WizardDialog`]] for creating a new `Substation` element. |
| `renderIedContainer`         | `(): Promise<TemplateResult>` |                                                  |
| `toggleShowIEDs`             | `(): void`                    |                                                  |

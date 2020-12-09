# substation-editor

[[`Substation`]] plugin subeditor for editing `Substation` sections.

## Properties

| Property                 | Attribute | Modifiers | Type             | Description                                      |
|--------------------------|-----------|-----------|------------------|--------------------------------------------------|
| `desc`                   | `desc`    | readonly  | `string \| null` | [[element \| `element.desc`]]                    |
| `element`                | `element` |           | `Element`        | The edited `Element`, a common property of all Substation subeditors. |
| `name`                   | `name`    | readonly  | `string`         | [[element \| `element.name`]]                    |
| `substationWizardAction` |           |           |                  |                                                  |

## Methods

| Method                   | Type                                             | Description                                      |
|--------------------------|--------------------------------------------------|--------------------------------------------------|
| `newUpdateAction`        | `(name: string, desc: string \| null): EditorAction` |                                                  |
| `openEditWizard`         | `(): void`                                       | Opens a [[`WizardDialog`]] for editing [[`element`]]. |
| `openLNodeWizard`        | `(): void`                                       | Opens a [[`WizardDialog`]] for editing `LNode` connections. |
| `openVoltageLevelWizard` | `(): void`                                       | Opens a [[`WizardDialog`]] for adding a new `VoltageLevel`. |
| `remove`                 | `(): void`                                       | Deletes [[`element`]].                           |
| `renderHeader`           | `(): TemplateResult`                             |                                                  |
| `substationWizardAction` | `(inputs: WizardInput[], dialog: CloseableElement): EditorAction[]` |                                                  |

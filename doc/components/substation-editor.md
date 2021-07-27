# substation-editor

[[`Substation`]] plugin subeditor for editing `Substation` sections.

## Properties

| Property          | Attribute  | Modifiers | Type                                             | Default                              | Description                                      |
|-------------------|------------|-----------|--------------------------------------------------|--------------------------------------|--------------------------------------------------|
| `desc`            | `desc`     | readonly  | `string \| null`                                 |                                      | [[element \| `element.desc`]]                    |
| `element`         |            |           | `Element`                                        |                                      | The edited `Element`, a common property of all Substation subeditors. |
| `getAttachedIeds` |            |           | `((element: Element) => Promise<Element[]>) \| undefined` | "async () => {\n    return [];\n  }" |                                                  |
| `name`            | `name`     | readonly  | `string`                                         |                                      | [[element \| `element.name`]]                    |
| `readonly`        | `readonly` |           | `boolean`                                        | false                                |                                                  |

## Methods

| Method                   | Type                          | Description                                      |
|--------------------------|-------------------------------|--------------------------------------------------|
| `openEditWizard`         | `(): void`                    | Opens a [[`WizardDialog`]] for editing [[`element`]]. |
| `openLNodeWizard`        | `(): void`                    | Opens a [[`WizardDialog`]] for editing `LNode` connections. |
| `openVoltageLevelWizard` | `(): void`                    | Opens a [[`WizardDialog`]] for adding a new `VoltageLevel`. |
| `remove`                 | `(): void`                    | Deletes [[`element`]].                           |
| `renderHeader`           | `(): TemplateResult`          |                                                  |
| `renderIedContainer`     | `(): Promise<TemplateResult>` |                                                  |

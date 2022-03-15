# substation-editor

[[`Substation`]] plugin subeditor for editing `Substation` sections.

## Properties

| Property          | Attribute  | Modifiers | Type                                             | Default                        | Description                                      |
|-------------------|------------|-----------|--------------------------------------------------|--------------------------------|--------------------------------------------------|
| `addButton`       |            |           | `IconButton`                                     |                                |                                                  |
| `addMenu`         |            |           | `Menu`                                           |                                |                                                  |
| `element`         |            |           | `Element`                                        |                                | The edited `Element`, a common property of all Substation subeditors. |
| `getAttachedIeds` |            |           | `((element: Element) => Element[]) \| undefined` | "() => {\n    return [];\n  }" |                                                  |
| `header`          | `header`   | readonly  | `string`                                         |                                |                                                  |
| `readonly`        | `readonly` |           | `boolean`                                        | false                          |                                                  |

## Methods

| Method                            | Type                 | Description                                      |
|-----------------------------------|----------------------|--------------------------------------------------|
| `openEditWizard`                  | `(): void`           | Opens a [[`WizardDialog`]] for editing [[`element`]]. |
| `openLNodeWizard`                 | `(): void`           | Opens a [[`WizardDialog`]] for editing `LNode` connections. |
| `remove`                          | `(): void`           | Deletes [[`element`]].                           |
| `renderIedContainer`              | `(): TemplateResult` |                                                  |
| `renderPowerTransformerContainer` | `(): TemplateResult` |                                                  |

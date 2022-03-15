# voltage-level-editor

[[`Substation`]] subeditor for a `VoltageLevel` element.

## Properties

| Property          | Attribute  | Modifiers | Type                                             | Default                        |
|-------------------|------------|-----------|--------------------------------------------------|--------------------------------|
| `addButton`       |            |           | `IconButton`                                     |                                |
| `addMenu`         |            |           | `Menu`                                           |                                |
| `element`         |            |           | `Element`                                        |                                |
| `getAttachedIeds` |            |           | `((element: Element) => Element[]) \| undefined` | "() => {\n    return [];\n  }" |
| `header`          | `header`   | readonly  | `string`                                         |                                |
| `readonly`        | `readonly` |           | `boolean`                                        | false                          |
| `voltage`         | `voltage`  | readonly  | `string \| null`                                 |                                |

## Methods

| Method                            | Type                 | Description                                      |
|-----------------------------------|----------------------|--------------------------------------------------|
| `openEditWizard`                  | `(): void`           |                                                  |
| `openLNodeWizard`                 | `(): void`           | Opens a [[`WizardDialog`]] for editing `LNode` connections. |
| `remove`                          | `(): void`           |                                                  |
| `renderIedContainer`              | `(): TemplateResult` |                                                  |
| `renderPowerTransformerContainer` | `(): TemplateResult` |                                                  |

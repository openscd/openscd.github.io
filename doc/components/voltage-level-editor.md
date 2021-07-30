# voltage-level-editor

[[`Substation`]] subeditor for a `VoltageLevel` element.

## Properties

| Property          | Attribute  | Modifiers | Type                                             | Default                        |
|-------------------|------------|-----------|--------------------------------------------------|--------------------------------|
| `desc`            | `desc`     | readonly  | `string \| null`                                 |                                |
| `element`         | `element`  |           | `Element`                                        |                                |
| `getAttachedIeds` |            |           | `((element: Element) => Element[]) \| undefined` | "() => {\n    return [];\n  }" |
| `name`            | `name`     | readonly  | `string`                                         |                                |
| `readonly`        | `readonly` |           | `boolean`                                        | false                          |
| `voltage`         | `voltage`  | readonly  | `string \| null`                                 |                                |

## Methods

| Method               | Type                 | Description                                      |
|----------------------|----------------------|--------------------------------------------------|
| `openBayWizard`      | `(): void`           |                                                  |
| `openEditWizard`     | `(): void`           |                                                  |
| `openLNodeWizard`    | `(): void`           | Opens a [[`WizardDialog`]] for editing `LNode` connections. |
| `remove`             | `(): void`           |                                                  |
| `renderHeader`       | `(): TemplateResult` |                                                  |
| `renderIedContainer` | `(): TemplateResult` |                                                  |

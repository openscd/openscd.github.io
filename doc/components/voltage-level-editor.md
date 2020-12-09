# voltage-level-editor

[[`Substation`]] subeditor for a `VoltageLevel` element.

## Properties

| Property  | Attribute | Modifiers | Type             |
|-----------|-----------|-----------|------------------|
| `desc`    | `desc`    | readonly  | `string \| null` |
| `element` | `element` |           | `Element`        |
| `name`    | `name`    | readonly  | `string`         |
| `voltage` | `voltage` | readonly  | `string \| null` |

## Methods

| Method            | Type                 |
|-------------------|----------------------|
| `openBayWizard`   | `(): void`           |
| `openEditWizard`  | `(): void`           |
| `openLNodeWizard` | `(): void`           |
| `remove`          | `(): void`           |
| `renderHeader`    | `(): TemplateResult` |

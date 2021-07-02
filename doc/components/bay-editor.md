# bay-editor

[[`SubstationEditor`]] subeditor for a `Bay` element.

## Properties

| Property  | Attribute | Modifiers | Type             |
|-----------|-----------|-----------|------------------|
| `desc`    | `desc`    | readonly  | `string \| null` |
| `element` |           |           | `Element`        |
| `name`    | `name`    | readonly  | `string`         |

## Methods

| Method                          | Type                 |
|---------------------------------|----------------------|
| `openConductingEquipmentWizard` | `(): void`           |
| `openEditWizard`                | `(): void`           |
| `openLNodeWizard`               | `(): void`           |
| `remove`                        | `(): void`           |
| `renderHeader`                  | `(): TemplateResult` |

# bay-editor

[[`SubstationEditor`]] subeditor for a `Bay` element.

## Properties

| Property    | Attribute | Modifiers | Type             |
|-------------|-----------|-----------|------------------|
| `container` |           |           | `Element`        |
| `desc`      | `desc`    | readonly  | `string \| null` |
| `element`   | `element` |           | `Element`        |
| `header`    |           |           | `Element`        |
| `name`      | `name`    | readonly  | `string`         |

## Methods

| Method                          | Type                 |
|---------------------------------|----------------------|
| `openAddLNodeWizard`            | `(): void`           |
| `openConductingEquipmentWizard` | `(): void`           |
| `openEditWizard`                | `(): void`           |
| `remove`                        | `(): void`           |
| `renderHeader`                  | `(): TemplateResult` |

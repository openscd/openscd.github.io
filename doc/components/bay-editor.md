# bay-editor

[[`SubstationEditor`]] subeditor for editing `Bay` elements.

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
| `openConductingEquipmentWizard` | `(): void`           |
| `openEditWizard`                | `(): void`           |
| `openLNodeAddWizard`            | `(): void`           |
| `removeAction`                  | `(): void`           |
| `renderHeader`                  | `(): TemplateResult` |

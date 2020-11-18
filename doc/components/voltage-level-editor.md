# voltage-level-editor

## Properties

| Property    | Attribute | Modifiers | Type             |
|-------------|-----------|-----------|------------------|
| `container` |           |           | `Element`        |
| `desc`      | `desc`    | readonly  | `string \| null` |
| `element`   | `element` |           | `Element`        |
| `header`    |           |           | `Element`        |
| `name`      | `name`    | readonly  | `string`         |
| `voltage`   | `voltage` | readonly  | `string \| null` |

## Methods

| Method            | Type                 |
|-------------------|----------------------|
| `openBayWizard`   | `(): void`           |
| `openEditWizard`  | `(): void`           |
| `openLNodeWizard` | `(): void`           |
| `removeAction`    | `(): void`           |
| `renderHeader`    | `(): TemplateResult` |

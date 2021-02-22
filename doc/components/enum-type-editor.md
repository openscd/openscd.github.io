# enum-type-editor

[[`Templates`]] plugin subeditor for editing `EnumType` sections.

## Properties

| Property  | Attribute | Modifiers | Type             | Description                   |
|-----------|-----------|-----------|------------------|-------------------------------|
| `desc`    | `desc`    | readonly  | `string \| null` | [[element \| `element.desc`]] |
| `eID`     | `eID`     | readonly  | `string`         | [[element \| `element.id`]]   |
| `element` | `element` |           | `Element`        |                               |
| `size`    | `size`    | readonly  | `number`         | Number of enum values.        |

## Methods

| Method           | Type       | Description                                      |
|------------------|------------|--------------------------------------------------|
| `openEditWizard` | `(): void` | Opens a [[`WizardDialog`]] for editing [[`element`]]. |

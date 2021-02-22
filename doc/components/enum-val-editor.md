# enum-val-editor

[[`Templates`]] plugin subeditor for editing `EnumVal`s.

## Properties

| Property  | Attribute | Modifiers | Type             | Description                           |
|-----------|-----------|-----------|------------------|---------------------------------------|
| `desc`    | `desc`    | readonly  | `string \| null` | [[element \| `element.desc`]]         |
| `element` | `element` |           | `Element`        |                                       |
| `ord`     | `ord`     | readonly  | `string`         | [[element \| `element.ord`]]          |
| `value`   | `value`   | readonly  | `string`         | [[element \| `element.textContent` ]] |

## Methods

| Method           | Type       | Description                                      |
|------------------|------------|--------------------------------------------------|
| `openEditWizard` | `(): void` | Opens a [[`WizardDialog`]] for editing [[`element`]]. |

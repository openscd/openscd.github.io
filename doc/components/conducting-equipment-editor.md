# conducting-equipment-editor

[[`SubstationEditor`]] subeditor for a `ConductingEquipment` element.

## Properties

| Property   | Attribute  | Modifiers | Type      | Default |
|------------|------------|-----------|-----------|---------|
| `element`  | `element`  |           | `Element` |         |
| `name`     | `name`     | readonly  | `string`  |         |
| `readonly` | `readonly` |           | `boolean` | false   |

## Methods

| Method            | Type       | Description                                      |
|-------------------|------------|--------------------------------------------------|
| `openEditWizard`  | `(): void` |                                                  |
| `openLNodeWizard` | `(): void` | Opens a [[`WizardDialog`]] for editing `LNode` connections. |
| `remove`          | `(): void` |                                                  |

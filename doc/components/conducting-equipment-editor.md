# conducting-equipment-editor

[[`SubstationEditor`]] subeditor for a `ConductingEquipment` element.

## Properties

| Property        | Attribute       | Modifiers | Type      | Default | Description                                      |
|-----------------|-----------------|-----------|-----------|---------|--------------------------------------------------|
| `element`       |                 |           | `Element` |         | SCL element ConductingEquipment                  |
| `name`          | `name`          | readonly  | `string`  |         | ConductingEquipment name attribute               |
| `showfunctions` | `showfunctions` |           | `boolean` | false   | Whether `EqFunction` and `SubEqFunction` are rendered |

## Methods

| Method              | Type                 |
|---------------------|----------------------|
| `remove`            | `(): void`           |
| `renderContentIcon` | `(): TemplateResult` |
| `renderContentPane` | `(): TemplateResult` |
| `renderEqFunctions` | `(): TemplateResult` |

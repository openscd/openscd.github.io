# powertransformer-editor

[[`SubstationEditor`]] subeditor for a child-less `PowerTransformer` element.

## Properties

| Property        | Attribute       | Modifiers | Type         | Default | Description                                      |
|-----------------|-----------------|-----------|--------------|---------|--------------------------------------------------|
| `addButton`     |                 |           | `IconButton` |         |                                                  |
| `addMenu`       |                 |           | `Menu`       |         |                                                  |
| `element`       |                 |           | `Element`    |         | SCL element PowerTransformer                     |
| `name`          | `name`          | readonly  | `string`     |         | PowerTransformer name attribute                  |
| `showfunctions` | `showfunctions` |           | `boolean`    | false   | Whether `EqFunction` and `SubEqFunction` are rendered |

## Methods

| Method              | Type                 |
|---------------------|----------------------|
| `renderContentIcon` | `(): TemplateResult` |
| `renderContentPane` | `(): TemplateResult` |
| `renderEqFunctions` | `(): TemplateResult` |

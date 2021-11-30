# bay-editor

[[`SubstationEditor`]] subeditor for a `Bay` element.

## Properties

| Property          | Attribute  | Modifiers | Type                                             | Default                        |
|-------------------|------------|-----------|--------------------------------------------------|--------------------------------|
| `addButton`       |            |           | `IconButton`                                     |                                |
| `addMenu`         |            |           | `Menu`                                           |                                |
| `element`         |            |           | `Element`                                        |                                |
| `getAttachedIeds` |            |           | `((element: Element) => Element[]) \| undefined` | "() => {\n    return [];\n  }" |
| `header`          | `header`   | readonly  | `string`                                         |                                |
| `readonly`        | `readonly` |           | `boolean`                                        | false                          |

## Methods

| Method               | Type                 | Description                                      |
|----------------------|----------------------|--------------------------------------------------|
| `openEditWizard`     | `(): void`           |                                                  |
| `openLNodeWizard`    | `(): void`           | Opens a [[`WizardDialog`]] for editing `LNode` connections. |
| `remove`             | `(): void`           |                                                  |
| `renderIedContainer` | `(): TemplateResult` |                                                  |

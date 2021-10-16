# bay-editor

[[`SubstationEditor`]] subeditor for a `Bay` element.

## Properties

| Property          | Attribute  | Type                                             | Default                        |
|-------------------|------------|--------------------------------------------------|--------------------------------|
| `element`         |            | `Element`                                        |                                |
| `getAttachedIeds` |            | `((element: Element) => Element[]) \| undefined` | "() => {\n    return [];\n  }" |
| `readonly`        | `readonly` | `boolean`                                        | false                          |

## Methods

| Method               | Type                 | Description                                      |
|----------------------|----------------------|--------------------------------------------------|
| `openEditWizard`     | `(): void`           |                                                  |
| `openLNodeWizard`    | `(): void`           | Opens a [[`WizardDialog`]] for editing `LNode` connections. |
| `remove`             | `(): void`           |                                                  |
| `renderIedContainer` | `(): TemplateResult` |                                                  |

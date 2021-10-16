# substation-editor

[[`Substation`]] plugin subeditor for editing `Substation` sections.

## Properties

| Property          | Attribute  | Type                                             | Default                        | Description                                      |
|-------------------|------------|--------------------------------------------------|--------------------------------|--------------------------------------------------|
| `element`         |            | `Element`                                        |                                | The edited `Element`, a common property of all Substation subeditors. |
| `getAttachedIeds` |            | `((element: Element) => Element[]) \| undefined` | "() => {\n    return [];\n  }" |                                                  |
| `readonly`        | `readonly` | `boolean`                                        | false                          |                                                  |

## Methods

| Method               | Type                 | Description                                      |
|----------------------|----------------------|--------------------------------------------------|
| `openEditWizard`     | `(): void`           | Opens a [[`WizardDialog`]] for editing [[`element`]]. |
| `openLNodeWizard`    | `(): void`           | Opens a [[`WizardDialog`]] for editing `LNode` connections. |
| `remove`             | `(): void`           | Deletes [[`element`]].                           |
| `renderIedContainer` | `(): TemplateResult` |                                                  |

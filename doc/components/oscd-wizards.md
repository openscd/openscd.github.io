# oscd-wizards

`LitElement` mixin that adds a `workflow` property which [[`Wizard`]]s are
queued onto on incoming [[`WizardEvent`]]s, first come first displayed.

## Properties

| Property   | Attribute | Type              | Default | Description                             |
|------------|-----------|-------------------|---------|-----------------------------------------|
| `host`     | `host`    | `HTMLElement`     |         |                                         |
| `wizardUI` |           | `WizardDialog`    |         |                                         |
| `workflow` |           | `WizardFactory[]` | []      | FIFO queue of [[`Wizard`]]s to display. |

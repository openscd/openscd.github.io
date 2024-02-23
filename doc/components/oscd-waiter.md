# oscd-waiter

## Properties

| Property         | Attribute | Type                                    | Default                         | Description                                      |
|------------------|-----------|-----------------------------------------|---------------------------------|--------------------------------------------------|
| `onPendingState` |           |                                         |                                 |                                                  |
| `waiting`        | `waiting` | `boolean`                               | false                           | Whether the element is currently waiting for some async work. |
| `workDone`       |           | `Promise<PromiseSettledResult<void>[]>` | "Promise.allSettled(this.work)" | A promise which resolves once all currently pending work is done. |

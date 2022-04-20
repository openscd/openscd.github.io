# subscriber-ied-list-smv

An sub element for subscribing and unsubscribing IEDs to Sampled Values messages.

## Properties

| Property                      | Type                           | Default | Description                                      |
|-------------------------------|--------------------------------|---------|--------------------------------------------------|
| `availableIeds`               | `IED[]`                        | []      | List holding all current avaialble IEDs which are not subscribed. |
| `currentDataset`              | `Element \| null \| undefined` |         | The current selected dataset                     |
| `currentSampledValuesControl` | `Element \| undefined`         |         | Current selected Sampled Values element          |
| `currentSampledValuesIEDName` | `string \| null \| undefined`  |         | The name of the IED belonging to the current selected Sampled Values |
| `doc`                         | `XMLDocument`                  |         |                                                  |
| `onIEDSubscriptionEvent`      |                                |         |                                                  |
| `onSampledValuesDataSetEvent` |                                |         |                                                  |
| `subscribedIeds`              | `IED[]`                        | []      | List holding all current subscribed IEDs.        |
| `subscriberWrapper`           | `Element`                      |         |                                                  |

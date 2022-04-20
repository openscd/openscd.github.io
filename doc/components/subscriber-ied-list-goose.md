# subscriber-ied-list-goose

An sub element for subscribing and unsubscribing IEDs to GOOSE messages.

## Properties

| Property                 | Type                           | Default | Description                                      |
|--------------------------|--------------------------------|---------|--------------------------------------------------|
| `availableIeds`          | `IED[]`                        | []      | List holding all current avaialble IEDs which are not subscribed. |
| `currentDataset`         | `Element \| null \| undefined` |         | The current selected dataset                     |
| `currentGooseIEDName`    | `string \| null \| undefined`  |         | The name of the IED belonging to the current selected GOOSE |
| `currentGseControl`      | `Element \| undefined`         |         | Current selected GSEControl element              |
| `doc`                    | `XMLDocument`                  |         |                                                  |
| `onGOOSEDataSetEvent`    |                                |         |                                                  |
| `onIEDSubscriptionEvent` |                                |         |                                                  |
| `subscribedIeds`         | `IED[]`                        | []      | List holding all current subscribed IEDs.        |
| `subscriberWrapper`      | `Element`                      |         |                                                  |

## Methods

| Method                       | Type                                             |
|------------------------------|--------------------------------------------------|
| `renderFullSubscribers`      | `(): TemplateResult`                             |
| `renderPartiallySubscribers` | `(ieds: IED[]): TemplateResult`                  |
| `renderSubscriber`           | `(status: SubscribeStatus, element: Element): TemplateResult` |
| `renderUnSubscribers`        | `(ieds: IED[]): TemplateResult`                  |

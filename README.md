[![npm version](https://img.shields.io/npm/v/eventemitterzero.svg)](https://www.npmjs.com/package/eventemitterzero)
[![Downloads](https://img.shields.io/npm/dm/eventemitterzero.svg)](https://www.npmjs.com/package/eventemitterzero)
![Uses TypeScript](https://img.shields.io/badge/Uses-Typescript-294E80.svg)


# eventemitterzero

This event emitter is the smallest possible event emitter, providing a fully typesafe API and modern features.

Here is the implementation (with type annotations removed for clarity):

```ts
export class EventEmitter{
  private eventTarget = new EventTarget();

  emit = (event, eventObject) => {
    this.eventTarget.dispatchEvent(
      new CustomEvent(event, { detail: eventObject })
    );
  };

  on = (event, listener) => {
    const wrappedListener = (e) => {
      listener(e.detail);
    };
    this.eventTarget.addEventListener(event, wrappedListener);
    return () => {
      this.eventTarget.removeEventListener(event, wrappedListener);
    };
  };
}
```


## Benefits
- ESM
- Small implementation
- Zero dependencies
- Typescript
  - Checks that event objects match the event names.
  - Allows void event types to either 1) omit the second `emit` arg, or 2) pass an undefined/optional typed arg.
  - Checks that the listener function params match the event object type. 
- Uses native [`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget) and [`CustomEvent`]() APIs to propagate events.
- The `on` function returns a **deregistration function**, as opposed to having an `off` function. This helps avoid memory leak bugs, and overall results in cleaner code.
  - The deregistration function can safely be called multiple times.
- Uses the **event object** pattern, which is preferable to using multiple event args.
- Allows events without an event object.
- No binding needed for function members.
- No silly aliases or context binding features.
- This package is built by GitHub Actions with provenance.


## Usage
```ts
import { EventEmitter } from 'eventemitterzero';

// Create an event emitter instance, passing the interface describing all of its events.
const myEventEmitter = new EventEmitter<{
  eventA: IEventA;
  eventB: IEventB;
  eventC: void; // Setting `void` here means that the event has no event object/value.
}>();

// To emit an event:
myEventEmitter.emit('eventA', { ... });
myEventEmitter.emit('eventB', { ... });
myEventEmitter.emit('eventC');
myEventEmitter.emit('eventC', undefined); // this also works (typically this would be a variable instead of literal `undefined`).

// To listen for events
const unlisten = myEventEmitter.on('eventA', (eventObject) => {
  // handle eventA
});
// To clean up, call unlisten. This removes the registered event listener, avoiding memory leaks.
unlisten();
```

There is no `once` function, but you can easily achieve it like this:
```ts
const unlisten = myEventEmitter('eventA', () => {
  unlisten();
});
// Later, clean up if never called:
unlisten();
```
Using this pattern you can do a **conditional once** — only deregistering when a certain condition is the case.


/**
 * Emit events.
 *
 * @example
 * ```ts
 * import { EventEmitter } from 'eventemitterzero';
 *
 * // Create an event emitter instance, passing the interface describing all of its events.
 * const myEventEmitter = new EventEmitter<{
 *   eventA: IEventA;
 *   eventB: IEventB;
 *   eventC: void; // Setting `void` here means that the event has no event object/value.
 * }>();
 * // Assuming these interfaces exist:
 * interface IEventA { a: string; b: number }
 * interface IEventB { z: boolean }
 *
 * // To emit an event:
 * myEventEmitter.emit('eventA', { a: 'bob', b: 2 });
 * myEventEmitter.emit('eventB', { z: true });
 * myEventEmitter.emit('eventC');
 * myEventEmitter.emit('eventC', undefined); // this also works (typically this would be a variable instead of literal `undefined`).
 *
 * // To listen for events
 * const unlisten = myEventEmitter.on('eventA', ({a, b}) => {
 *   // handle event
 * });
 * // To clean up, call unlisten. This removes the registered event listener, avoiding memory leaks.
 * unlisten();
 *
 *
 * // There is no `once` function, but you can easily achieve it like this:
 * const unlisten = myEventEmitter('eventC', () => {
 *   unlisten();
 * });
 * // Later, clean up if never called:
 * unlisten();
 * ```
 */
export class EventEmitter <TEvents extends Record<string, unknown>> {
  private eventTarget = new EventTarget();

  emit = <K extends keyof TEvents> (
    event: K,
    // support zero args if the event K is a void type, or one arg otherwise.
    ...args: TEvents[K] extends void ? ([] | [undefined]) : [TEvents[K]]
  ): void => {
    const eventObject = args[0] as TEvents[K];
    const customEvent = new CustomEvent(event as string, { detail: eventObject });
    this.eventTarget.dispatchEvent(customEvent);
  };

  on = <K extends keyof TEvents> (
    event: K,
    listener: (eventObject: TEvents[K]) => void,
  ): () => void => {
    const wrappedListener = (e: Event) => {
      const eventObject = (e as CustomEvent<TEvents[K]>).detail;
      listener(eventObject);
    };
    this.eventTarget.addEventListener(event as string, wrappedListener as EventListener);

    return () => {
      this.eventTarget.removeEventListener(event as string, wrappedListener as EventListener);
    };
  };
}

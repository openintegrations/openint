import type {Viewer} from '@openint/cdk'
import type {Event} from './events'

/**
 * Interface for dispatching events
 */
export interface Dispatcher {
  /**
   * Dispatch an event to all registered listeners. Await should be optional
   * @param event The event to dispatch
   */
  dispatch(event: Event, viewer: Viewer | null | undefined): Promise<void>
}

// /**
//  * Creates a new Dispatcher instance
//  * @param listener Function that will be called when events are dispatched
//  * @returns A Dispatcher instance
//  */
// export function createDispatcher(listener: (event: Event) => Promise<void>) {
//   return {
//     async dispatch(event) {
//       await listener(event)
//     },
//   } satisfies Dispatcher
// }

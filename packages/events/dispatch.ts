import type {Id} from '@openint/cdk'
import type {Event} from './events'

/**
 * Interface for dispatching events, not used at the omment but is good for documentation
 */
export interface Dispatcher {
  dispatch<T extends Event>(event: T): Promise<T & {id: Id['evt']}>
}

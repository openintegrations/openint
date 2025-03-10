import {generateConnectorServer} from '../_defaults'
import {def} from './def'

// TODO: shouldn't have to cast as any, figure out what the right generic should be
export const server = generateConnectorServer(def as any)

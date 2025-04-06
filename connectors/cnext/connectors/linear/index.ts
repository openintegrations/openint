import {generateOAuth2Server} from '../../_defaults'
import {def, jsonDef} from './def'

export const server = generateOAuth2Server(def, jsonDef.auth)

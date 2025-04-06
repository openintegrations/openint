import {generateOAuth2Server} from '../../oauth2'
import {def, jsonDef} from './def'

export const server = generateOAuth2Server(def, jsonDef.auth)

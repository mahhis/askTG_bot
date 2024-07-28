import * as dotenv from 'dotenv'
import { cleanEnv, str } from 'envalid'
import { cwd } from 'process'
import { resolve } from 'path'

dotenv.config({ path: resolve(cwd(), '.env') })

// eslint-disable-next-line node/no-process-env
export default cleanEnv(process.env, {
  TOKEN: str(),
  MONGO: str(),
  API_HASH: str(),
  API_ID: str(),
  SESSION: str(),
})

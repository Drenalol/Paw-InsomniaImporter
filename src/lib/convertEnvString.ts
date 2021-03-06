import Paw from '../types-paw-api/paw'
import EnvironmentManager from './EnvironmentManager'
import {makeDs, makeEnvDv} from './dynamicStringUtils'


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const convertEnvString = (s: string, baseEnvironmentManager: EnvironmentManager, environmentManager: EnvironmentManager): string | DynamicString => {
  const re = /{{([^}]+)}}/g
  let match
  const components: Paw.DynamicStringComponent[] = []
  let idx = 0

  // eslint-disable-next-line no-cond-assign
  while (match = re.exec(s)) {
    // push any string here before
    if (match.index > idx) {
      components.push(s.substr(idx, match.index - idx))
    }

    // push env variable
    const envVarName = match[1].trim();
    const envVar = baseEnvironmentManager.getEnvironmentVariable(envVarName) || environmentManager.getEnvironmentVariable(envVarName);

    if (!envVar) {
      console.error(`${envVarName} Env Var not found`);
      return "";
    }

    components.push(makeEnvDv(envVar.id));
    idx = match.index + match[0].length
  }

  // add remaining string
  if (idx < s.length) {
    components.push(s.substr(idx))
  }

  // return
  if (components.length === 0) {
    return "";
  }
  if (components.length === 1 && typeof components[0] === 'string') {
    return components[0];
  }

  return makeDs(...components);
}

export default convertEnvString

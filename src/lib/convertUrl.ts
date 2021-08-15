/* eslint-disable no-param-reassign */
import EnvironmentManager from './EnvironmentManager';
import convertEnvString from './convertEnvString';


const convertUrl = (url: string, baseEnvironmentManager: EnvironmentManager, environmentManager: EnvironmentManager): string | DynamicString | null => {
  if (!url) {
    return null;
  }

  return convertEnvString(url, baseEnvironmentManager, environmentManager)
}

export default convertUrl

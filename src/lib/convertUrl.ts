/* eslint-disable no-param-reassign */
import EnvironmentManager from './EnvironmentManager';
import convertEnvString from './convertEnvString';


const convertUrl = (url: string, environmentManager: EnvironmentManager): string | DynamicString | null => {
  if (!url) {
    return null;
  }

  return convertEnvString(url, environmentManager)
}

export default convertUrl

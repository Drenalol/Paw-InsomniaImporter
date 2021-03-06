/* eslint-disable no-param-reassign */
import Paw from '../types-paw-api/paw'
import EnvironmentManager from './EnvironmentManager'
import convertEnvString from './convertEnvString'
import {makeDs, makeRequestDv} from './dynamicStringUtils'
import Insomnia from "../types-paw-api/insomnia";

const convertParameter = (
  header: Insomnia.Parameter,
  request: Paw.Request,
  isHeaders: boolean,
  baseEnvironmentManager: EnvironmentManager,
  environmentManager: EnvironmentManager
): Paw.KeyValue => {
  const headerName = convertEnvString((header.name || ''), baseEnvironmentManager, environmentManager)
  let headerValue = convertEnvString((header.value || ''), baseEnvironmentManager, environmentManager)

  const variable = request.addVariable(headerName as string, headerValue, '');
  headerValue = makeDs(makeRequestDv(variable.id));

  if (isHeaders) {
    return request.addHeader(headerName, headerValue);
  }

  return request.addUrlParameter(headerName, headerValue);
}

const convertParameters = (
  headers: Insomnia.Parameter[],
  pawRequest: Paw.Request,
  baseEnvironmentManager: EnvironmentManager,
  environmentManager: EnvironmentManager,
  isHeaders = false
): void => {
  if (!headers || !Array.isArray(headers)) {
    return;
  }
  headers.forEach((header) => {
    convertParameter(header, pawRequest, isHeaders, baseEnvironmentManager, environmentManager);
  })
}

export default convertParameters;
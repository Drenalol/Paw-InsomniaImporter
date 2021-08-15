/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-param-reassign */
import Paw from '../types-paw-api/paw'
import {convertAuthenticationToRecords, getInsomniaAuthParam} from './insomniaUtils'
import {makeDs, makeDv} from './dynamicStringUtils'
import EnvironmentManager from './EnvironmentManager'
import convertEnvString from './convertEnvString'
import Insomnia from "../types-paw-api/insomnia";

const getDynamicInsomniaAuthParam = (authentication: Record<string, string>, key: string, environmentManager: EnvironmentManager): string | DynamicString | null => {
  const val = getInsomniaAuthParam(authentication, key)
  if (!val) {
    return null
  }
  return convertEnvString(val, environmentManager)
}

const convertAuthBearer = (authentication: Record<string, string>, pawRequest: Paw.Request, environmentManager: EnvironmentManager): void => {
  const token = getDynamicInsomniaAuthParam(authentication, 'token', environmentManager);
  pawRequest.addHeader('Authorization', `Bearer ${(token || '')}`);
}

const convertAuthBasic = (authentication: Record<string, string>, pawRequest: Paw.Request, environmentManager: EnvironmentManager): void => {
  const username = getDynamicInsomniaAuthParam(authentication, 'username', environmentManager);
  const password = getDynamicInsomniaAuthParam(authentication, 'password', environmentManager);
  pawRequest.httpBasicAuth = {
    username,
    password,
  }
}

const convertAuthOAuth1 = (authentication: Record<string, string>, pawRequest: Paw.Request, environmentManager: EnvironmentManager): void => {
  const consumerKey = getDynamicInsomniaAuthParam(authentication, 'consumerKey', environmentManager);
  const consumerSecret = getDynamicInsomniaAuthParam(authentication, 'consumerSecret', environmentManager);
  const token = getDynamicInsomniaAuthParam(authentication, 'tokenKey', environmentManager);
  const tokenSecret = getDynamicInsomniaAuthParam(authentication, 'tokenSecret', environmentManager);
  const signatureMethod = getInsomniaAuthParam(authentication, 'signatureMethod');

  pawRequest.oauth1 = {
    oauth_consumer_key: consumerKey,
    oauth_consumer_secret: consumerSecret,
    oauth_token: token,
    oauth_token_secret: tokenSecret,
    oauth_nonce: undefined,
    oauth_timestamp: undefined,
    oauth_callback: undefined,
    oauth_signature: undefined,
    oauth_signature_method: (signatureMethod || undefined),
    oauth_version: undefined,
    oauth_additional_parameters: undefined,
  }
}

const convertAuthOAuth2 = (authentication: Record<string, string>, pawRequest: Paw.Request, environmentManager: EnvironmentManager): void => {
  const grantType = getDynamicInsomniaAuthParam(authentication, 'grantType', environmentManager);
  const authorizationUrl = getDynamicInsomniaAuthParam(authentication, 'authorizationUrl', environmentManager);
  const accessTokenUrl = getDynamicInsomniaAuthParam(authentication, 'accessTokenUrl', environmentManager);
  const clientId = getDynamicInsomniaAuthParam(authentication, 'clientId', environmentManager);
  const clientSecret = getDynamicInsomniaAuthParam(authentication, 'clientSecret', environmentManager);
  const redirectUrl = getDynamicInsomniaAuthParam(authentication, 'redirectUrl', environmentManager);

  pawRequest.oauth2 = {
    client_id: clientId,
    client_secret: clientSecret,
    authorization_uri: authorizationUrl,
    access_token_uri: accessTokenUrl,
    redirect_uri: redirectUrl,
    scope: undefined,
    state: undefined,
    token: undefined,
    token_prefix: undefined,
    grant_type: grantType as string,
  }
}

const convertAuth = (authentication: Insomnia.Authentication, pawRequest: Paw.Request, environmentManager: EnvironmentManager): void => {
  if (!authentication) {
    return
  }

  const records = convertAuthenticationToRecords(authentication);

  switch (authentication.type) {
    case 'bearer':
      convertAuthBearer(records, pawRequest, environmentManager)
      break;
    case 'basic':
      convertAuthBasic(records, pawRequest, environmentManager)
      break;
    case 'oauth1':
      convertAuthOAuth1(records, pawRequest, environmentManager)
      break;
    case 'oauth2':
      convertAuthOAuth2(records, pawRequest, environmentManager)
      break;
    default:
      break;
  }
}

export default convertAuth

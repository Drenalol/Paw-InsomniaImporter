import Paw from '../types-paw-api/paw'

const makeDv = (type: string, properties?: { [key: string]: any }): DynamicValue => {
  return new DynamicValue(type, properties)
}

const makeDs = (...components: Paw.DynamicStringComponent[]): DynamicString => {
  return new DynamicString(...components)
}

const makeJsonDv = (object: {}): DynamicValue => {
  return makeDv("com.luckymarmot.JSONDynamicValue", {json: JSON.stringify(object)});
}

const makeXPathExtensionsDv = (requestId: string, xpath: string, depthRequestPath: number, showXPathInName: boolean): DynamicValue => {
  return makeDv("com.yanysh.Paw.XPath2Evaluator", {
    request: requestId,
    xpath: xpath.concat("/text()"),
    depthRequestPath,
    showXPathInName
  });
}

const makeJsonPathExtensionDv = (requestId: string, jsonPath: string): DynamicValue => {
  return makeDv("com.luckymarmot.ResponseBodyPathDynamicValue", {
    request: requestId,
    format: 1,
    filterName: "JSONPath",
    keyPath: jsonPath
  });
}

const makeEnvDv = (variableId: string): DynamicValue => {
  return makeDv('com.luckymarmot.EnvironmentVariableDynamicValue', {
    environmentVariable: variableId
  })
}

const makeRequestDv = (variableId: string): DynamicValue => {
  return makeDv('com.luckymarmot.RequestVariableDynamicValue', {
    variableUUID: variableId
  })
}

const makeFileDv = (): DynamicValue => {
  return makeDv('com.luckymarmot.FileContentDynamicValue', {
    bookmarkData: null
  })
}

export {makeDv, makeDs, makeEnvDv, makeRequestDv, makeFileDv, makeJsonDv, makeXPathExtensionsDv, makeJsonPathExtensionDv}
/* eslint-disable class-methods-use-this,no-underscore-dangle */
import Paw, {DynamicStringComponent} from './types-paw-api/paw'
import Insomnia, {Resource} from './types-paw-api/insomnia'
import EnvironmentManager from "./lib/EnvironmentManager";
import {makeDs, makeJsonDv, makeJsonPathExtensionDv, makeXPathExtensionsDv} from "./lib/dynamicStringUtils";
import convertUrl from "./lib/convertUrl";
import convertParameters from "./lib/convertParameters";
import convertAuth from "./lib/convertAuth";
import {decode} from "js-base64";

class InsomniaImporter implements Paw.Importer {
  static identifier = "com.yanysh.Paw.InsomniaImporter";
  static title = "Insomnia Collection Importer";
  static help = "https://github.com/Drenalol/Paw-InsomniaImporter"
  static inputs = [
    InputField("depthRequestPath", "(XPath extension) Depth path of request", "Number", {
      defaultValue: 0,
      minValue: 0
    }),
    InputField("showXPathInName", "(XPath extension) Show XPath", "Checkbox", {
      defaultValue: true
    }),
  ];

  depthRequestPath: number;
  showXPathInName: boolean;
  context: Paw.Context;
  resources: Record<string, Record<string, Insomnia.Resource>>;
  requestGroups: Record<string, Paw.RequestGroup>;
  requests: Record<string, Paw.Request>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public canImport(context: Paw.Context, items: Paw.ExtensionItem[]): number {
    return items.reduce((acc, item) => {
      try {
        const insomnia = JSON.parse(item.content) as Insomnia.Insomnia
        return (
          insomnia.__type === 'export' &&
          insomnia.__export_format === 4 &&
          Array.isArray(insomnia.resources) &&
          insomnia.resources.length > 0
        )
      } catch (error) {
        return false
      }
    }, true) ? 1 : 0
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public import(context: Paw.Context, items: Paw.ExtensionItem[], options: Paw.ExtensionOption): boolean {
    this.context = context;
    this.depthRequestPath = options.inputs["depthRequestPath"];
    this.showXPathInName = options.inputs["showXPathInName"];
    items.forEach((item) => {
      try {
        this.importCollection(item);
      } catch (error) {
        console.error(`Error while converting collection. ${error}`);
      }
    })
    return true
  }

  private importCollection(item: Paw.ExtensionItem): void {
    let insomniaCollection: Insomnia.Insomnia;
    try {
      insomniaCollection = JSON.parse(item.content) as Insomnia.Insomnia
    } catch (error) {
      throw new Error('Insomnia Collection is not a valid JSON');
    }

    // Group Insomnia resources by type
    this.resources = insomniaCollection.resources.reduce((acc, next) => {
      const grouping = acc[next._type];

      if (grouping) {
        acc[next._type] = {...grouping, [next._id]: next};
      } else {
        acc[next._type] = {[next._id]: next};
      }

      return acc;
    }, {} as Record<string, Record<string, Insomnia.Resource>>);

    const requestGroups$ = {...this.resources.workspace, ...this.resources.request_group};

    // RequestGroups
    if (requestGroups$) {
      this.requestGroups = {};

      Object
        .keys(requestGroups$)
        .forEach(requestGroupKey => {
          const group = requestGroups$[requestGroupKey];

          if (!this.requestGroups[requestGroupKey]) {
            this.requestGroups[requestGroupKey] = this.createRequestGroup(group);
          }
        });

    }

    // Environment
    const baseEnvironmentManager = new EnvironmentManager(this.context, "Insomnia Base Environment");
    const environmentManager = new EnvironmentManager(this.context, "Insomnia Environments");

    if (this.resources.environment) {
      Object
        .keys(this.resources.environment)
        .forEach(environmentKey => {
          const insomniaEnv = this.resources.environment[environmentKey];
          let envManager: EnvironmentManager;

          if (insomniaEnv.name === "Base Environment") {
            envManager = baseEnvironmentManager;
          } else {
            envManager = environmentManager;
          }

          const env = envManager.getOrCreateEnvironment(insomniaEnv.name);
          const insomniaEnvVars = insomniaEnv.data;

          Object
            .keys(insomniaEnvVars)
            .forEach(variableKey => {
              const environmentVariable = insomniaEnvVars[variableKey];
              envManager.getOrCreateEnvironmentVariable(variableKey);

              if (typeof environmentVariable === 'string') {
                env.setVariablesValues({[variableKey]: environmentVariable});
              } else {
                env.setVariablesValues({[variableKey]: makeDs(makeJsonDv(environmentVariable))});
              }
            });
        });

    }

    // Requests
    if (this.resources.request) {
      this.requests = {};

      Object
        .keys(this.resources.request)
        .forEach(requestKey => {
          const insomniaRequest = this.resources.request[requestKey];
          const request = this.createRequest(insomniaRequest, baseEnvironmentManager, environmentManager);

          if (insomniaRequest.parentId) {
            const parent = this.requestGroups[insomniaRequest.parentId];

            if (!parent) {
              console.error(`Parent not found. Request name: ${insomniaRequest.name}`);
            } else {
              parent.appendChild(request);
            }
          }

          this.requests[requestKey] = request;
        });

      // Convert 'Insomnia Response Raw Value' to DynamicValue
      Object
        .keys(this.requests)
        .forEach(requestKey => {
          const request = this.requests[requestKey];

          if (request.body) {
            request.body = this.convertToDynamicString(request.body as string);

            const requestHeaders = request.headers;
            if (requestHeaders) {
              Object
                .keys(requestHeaders)
                .forEach(headerName => {
                  const headerValue = requestHeaders[headerName];
                  const headerDynamicString = this.convertToDynamicString(headerValue as string);
                  request.setHeader(headerName, headerDynamicString);
                });
            }
          }
        });
    }
  }

  private createRequestGroup(resource: Insomnia.Resource): Paw.RequestGroup {
    const {parentId} = resource;
    let parent: Paw.RequestGroup | null = null;

    if (parentId) {
      parent = this.requestGroups[parentId];

      if (!parent) {
        parent = this.createRequestGroup(this.resources.request_group[parentId]);
        this.requestGroups[parentId] = parent;
      }
    }

    const child = this.context.createRequestGroup(resource.name);

    if (parent) {
      parent.appendChild(child);
    }

    return child;
  }

  private createRequest(resource: Resource, baseEnvironmentManager: EnvironmentManager, environmentManager: EnvironmentManager): Paw.Request {
    const url = convertUrl(resource.url, baseEnvironmentManager, environmentManager);
    const request = this.context.createRequest(resource.name, resource.method, url, resource.description);

    if (resource.body && ("mimeType" in resource.body)) {
      if (resource.body.mimeType === "application/json") {
        try {
          request.jsonBody = JSON.parse(resource.body.text);
        } catch {
          request.body = resource.body.text;
        }
      } else {
        request.body = resource.body.text;
      }
    }

    if (resource.headers) {
      convertParameters(resource.headers, request, baseEnvironmentManager, environmentManager, true);
    }

    if (resource.parameters) {
      convertParameters(resource.parameters, request, baseEnvironmentManager, environmentManager);
    }

    if (resource.authentication && "type" in resource.authentication) {
      convertAuth(resource.authentication, request, baseEnvironmentManager, environmentManager);
    }

    request.followRedirects = true;
    request.redirectAuthorization = true;

    return request;
  }

  private convertToDynamicString(sourceBody: string): DynamicString | string {
    const insomniaEvalRegExp = /{% response 'body', '(.+?)', '(.+?)', .+%}/g;

    if (!insomniaEvalRegExp.test(sourceBody))
      return sourceBody;

    const dynamicValues: Record<number, DynamicValue> = {};

    let examined = 0;
    const body = sourceBody.replace(insomniaEvalRegExp, (match, p1, p2, offset) => {
      const base64RegExp = /b64::(.+?)::46b/g;
      const requestRefId = p1;
      const requestBase64 = base64RegExp.exec(p2);

      if (requestRefId && requestBase64) {
        const requestRefPath = decode(requestBase64[1]);
        const pawRequest = this.requests[requestRefId];
        const contentType = pawRequest.getHeaderByName("Content-Type") as string;

        if (contentType) {
          if (contentType.indexOf("xml") > 0)
            dynamicValues[offset - examined] = makeXPathExtensionsDv(pawRequest.id, requestRefPath, this.depthRequestPath, this.showXPathInName);
          else if (contentType.indexOf("json") > 0)
            dynamicValues[offset - examined] = makeJsonPathExtensionDv(pawRequest.id, requestRefPath);
        }
      }

      examined += match.length;
      return "";
    });

    const components: DynamicStringComponent[] = [];

    let prevKey = 0;
    Object
      .keys(dynamicValues)
      .forEach(dynamicValueKey => {
        const key = Number(dynamicValueKey);

        if (key !== 0)
          components.push(body.substr(prevKey, key - prevKey));

        prevKey = key;
        components.push(dynamicValues[key]);
      })

    if (prevKey < body.length) {
      components.push(body.substr(prevKey));
    }

    return new DynamicString(...components);
  }
}

registerImporter(InsomniaImporter)

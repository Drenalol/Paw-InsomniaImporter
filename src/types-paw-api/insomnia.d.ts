export interface Insomnia {
    __type: string,
    __export_format: number,
    resources: Resource[]
}

export interface Resource {
    _id: string,
    _type: string,
    parentId: string | null,
    url: string,
    name: string,
    data: Record<string, string | {}>
    method: string,
    description: string,
    created: number,
    parameters: Parameter[] | [],
    headers: Parameter[] | [],
    authentication: Authentication | {},
    body: Body | {}
}

export interface Parameter {
    name: string,
    value: string
}

export interface Authentication {
    type: string,

    // Bearer
    token: string,

    // Basic
    username: string,
    password: string

    // OAuth 1
    signatureMethod: string,
    consumerKey: string,
    consumerSecret: string,
    tokenKey: string,
    tokenSecret: string,
    privateKey: string,
    version: string,
    nonce: string,
    timestamp: string,
    callback: string,
    realm: string,
    verifier: string

    // OAuth 2
    grantType: string,
    authorizationUrl: string,
    accessTokenUrl: string,
    clientId: string,
    clientSecret: string,
    redirectUrl: string
}

export interface Body {
    mimeType: string,
    text: string
}
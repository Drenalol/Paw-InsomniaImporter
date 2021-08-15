# Insomnia Collection Importer for Paw

A [Paw Extension](https://paw.cloud/extensions) to import Insomnia Collection JSON v4 files to Paw.

## How to use?

1. In Paw, go to File menu, then Import...
2. Pick the saved Insomnia Collection file, and make sure the Format is "Insomnia Collection Importer"

## Insomnia supported

| Format | Support |
| ------ | ------- |
| Insomnia JSON Collection v4.0 | ✅ |
| Insomnia YAML Collection v4.0 | ❌ |
| Insomnia HAR | ❌ |

## Data supported

| Data | Support |
| ------ | ------- |
| Workspaces | ✅ |
| Folders | ✅ |
| Requests | ✅ |
| Response - Body Attributes (JsonPath) | ✅ |
| Response - Body Attributes (XPath) * | ✅ |
| Files | ❌ |
| Environments, and Environment Variables in Headers, Parameters ** | ✅ |
| Cookies | ❌ |
| Authentication (Basic, JWT, OAuth) | ✅ |
| Headers | ✅ |

### Insomnia 'Response - Body Attributes'
Importer checks for this in Requests, Headers and convert it to Dynamic Values.

### * Response - Body Attributes (XPath)
PAW doesn't support XPath for XML

But you can relax, the importer will convert it to my extension so that they work, you just need to install it via the [LINK](https://www.github.com/Drenalol/Paw-XPath2DynamicValue)

### ** Environments
Insomnia has a "Base Environment" that is available for all environments, but the Paw does not have such a thing.

Importer will convert it like normal environment.

Mapping:

`String => String`

`Any Other => Paw JSON`

### Feedback
Feel free to create Issue for bugs/suggestions.

### Manual Installation
- Clone this repo
- run npm paw
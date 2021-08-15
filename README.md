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
| Response - Body Attributes * | ✅ |
| File | ✅ |
| Environments ** | ✅ |
| Cookies | ❌ |

### * Response - Body Attributes
Dynamic response values with JsonPath are fully supported, because XPath not supported by Paw,

you must install my own extension: 

### ** Environments
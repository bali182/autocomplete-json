#autocomplete-json
This package enables semantic autocompletion for JSON files.

![Demo image](https://cloud.githubusercontent.com/assets/3879181/12522353/700e3c9c-c150-11e5-9a99-eae9d6fddce1.gif "Demo")

#currently supported schemas

1. `package.json` - for node package configuration
2. `tsconfig.json` - for TypeScript project configuration

#proposals for your json
This package provides a very convenient way to add support for your own json completions, but
first you need to be familiar with the [atom provider-consumer API](https://atom.io/docs/v1.0.4/behind-atom-interacting-with-packages-via-services)

##proposals for schemas ([v4](http://json-schema.org/documentation.html))
This is the easier of the two ways, you can provide completions. To get started, create an entry in your `package.json` file:
```json
{
  "main": "./main",
  "providedServices": {
    "jsonschema.provider": {
      "versions": {
        "1.0.0": "myProviderMethod"
      }
    }
  }
}
```
From now on your package provides the `jsonschema.provider` services, which `autocomplete-json` consumes and uses, unless you deactivate your package.

The service itself needs to return a single instance or an array of the following type of objects:

```ts
interface IJsonSchemaProvider {
  getSchemaURI(): string;
  getFilePattern(): string;
}
```

And in your `main.js` (or compiled `.ts`, or uncompiled `.coffe`) file:

```js
"use babel"; // this might not be necessary now

import * as path from 'path';

export function myProviderMethod() {
  return {
    getSchemaURI() {
      return path.join(__dirname, './my-json-schema.json')
    }
    
    getFilePattern() {
      return 'my-json.json';
    }
  }
}
```

This will enable autocomplete in `my-json.json` files, and the completions will consider the given schema, when providing the completions.

##custom proposals
When you need to provide custom completions, based on the contex (take a look at `lib/providers/package-dependencies`), you want to use the other, slightly more complex way.

As usual register your provider, but this time for the `jsonautocomplete.provider` consumer.

```json
{
  "main": "./main",
  "providedServices": {
    "jsonautocomplete.provider": {
      "versions": {
        "1.0.0": "provideProposalProviders"
      }
    }
  }
}
```

From this point you need to consider the following two interfaces:

```ts
/**
 * This is the object you recieve, when providing proposals. 
 */
export interface IRequest {
  /** The partially parsed json object in the edited file. Might be null */
  contents: Object,
  /** The prefix of the word, the user is typing. might be "" */
  prefix: string,
  /** The path where the user invoked your proposal eg.: ["a", 0, "b"] -> { "a": [ {"b": ˇ } ]} */
  segments: Array<string | number>,
  /** The edited token. might be the same as prefix. */
  token: string,
  /** True if the user edits an objects key position. */
  isKeyPosition: boolean,
  /** True if the user edits an objects value position. */
  isValuePosition: boolean,
  /** True, if the users cursor was between "" when the provider was invoked. */
  isBetweenQuotes: boolean,
  /** True, if the file was empty, when the provider was invoked */
  isFileEmpty: boolean,
  /** True, if editing in the middle of an object, and a comma should be added. */
  shouldAddComma: boolean
}

/**
 * The interface for providing proposals. This is what you need to implement. 
 */
export interface IProposalProvider {
  /** Returns an array of IProposals, which are described in the autocomplete plus package. */
  getProposals(request: IRequest): Promise<Array<IProposal>>;
  /** Same file pattern as before. */
  getFilePattern(): string;
}
```

And in your main file:

```js
"use babel"; // this might not be necessary now

import * as path from 'path';

export function myProviderMethod() {
  return {
    getProposals(request) {
      const {segments, isKeyPosition, isValuePosition} = request;
      if (segments.length === 1 && isKeyPosition && segments[0] === 'test') {
        // You are in here { "test": { ˇ }}
        return Promise.resolve([{"text": '"my proposal for test key"'}])
      }
      return Promise.resolve([]);
    }
    
    getFilePattern() {
      return 'my-json.json';
    }
  }
}
```

The complexity of this can vary, so I encourage you to look at the `lib/providers/package-dependencies` in this package.

#development

###requirements:

1. `npm install -g gulp`
2. `npm install -g tsd`

###start development:

1. `git clone <this repository>`
2. `cd <cloned repository>`
3. `npm install`
4. `tsd install` - Installs TypeScript definitions.
5. `gulp watch` - Watches for all `.ts` and `.json` file changes in `lib`.
6. `apm link .` - This will tell atom, to include this package.
7. `atom -d .` - Start atom in this folder in development mode.
8. `CTRL (CMD) + ALT + I` - Open developer console if needed.

###before pull request:

1. `gulp build` - Cleans then populates the `dist` folder.

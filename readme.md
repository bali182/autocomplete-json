#autocomplete-json
**Semantic autocompletion for JSON files**

##how this works
Since 5.0 (it supposed to be 2.0 but I messed up `apm publish`) was released, this is the way this package works:

1. Load the available schema "manifest" from [schemastore.org](http://schemastore.org/api/json/catalog.json)
2. Once a `.json` file is opened, and autocompletion is activated (CTRL+Space usually), the file name is matched against the `fileMatch` field in each schema descriptor, and if there's a match, that schema is loaded and used for autocompletion in the given file.
3. There are also some extra features, like autocompletion for files and dependencies. These are available for the most frequently used schemas, like `package.json` and `tsconfig.json`.

**The 5.0 release will most likely cause a lots of issues and bugs, please [report](https://github.com/bali182/autocomplete-json/issues) if you find any!**

##features

####json schema

![JSON schema autocomplete](https://cloud.githubusercontent.com/assets/3879181/12832986/cfc5926e-cb9d-11e5-916e-721790721fc4.gif)

####npm dependencies

![Autocomplete npm dependencies](https://cloud.githubusercontent.com/assets/3879181/12832997/e4f12630-cb9d-11e5-8cbf-589ad68e4b08.gif)

####files

![Autocomplete files](https://cloud.githubusercontent.com/assets/3879181/12832990/d6bd7d2a-cb9d-11e5-9f47-88f3efffb2ad.gif)

####babelrc 6+ plugins and presets

![Autocomplete babelrc plugins and presets](https://cloud.githubusercontent.com/assets/3879181/12832973/c3e5be4c-cb9d-11e5-99e1-50d2f316215e.gif)


##development

Wiki about [development](https://github.com/bali182/autocomplete-json/wiki/Contributing)

##support for your schema

Wiki about [providers](https://github.com/bali182/autocomplete-json/wiki/CreateProviders)

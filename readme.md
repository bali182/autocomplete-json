#autocomplete-json
This package enables semantic autocompletion for JSON files.

![Demo image](https://cloud.githubusercontent.com/assets/3879181/12522353/700e3c9c-c150-11e5-9a99-eae9d6fddce1.gif "Demo")

#currently supported schemas

1. `package.json` - for node package configuration
2. `tsconfig.json` - for TypeScript project configuration
3. `bower.json` - for bower configuration **(package completions missing - need help with versions)**
3. `.babelrc` - for babel 6+ configuration. **To make this work, you have to remove `.*` from the autocomplete-plus blacklist!** `File` -> `Settings` -> `Packages` -> `autocomplete-plus` -> `Settings` -> override default `.*` with a space for example

#development & plugins

Check out the [wiki](https://github.com/bali182/autocomplete-json/wiki)

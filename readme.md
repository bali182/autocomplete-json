#autocomplete-json
This package enables semantic autocompletion for JSON files.

#features

###Autocomplete using JSON schema

![JSON schema autocomplete](https://cloud.githubusercontent.com/assets/3879181/12832986/cfc5926e-cb9d-11e5-916e-721790721fc4.gif)

###Autocomplete npm dependencies

![Autocomplete npm dependencies](https://cloud.githubusercontent.com/assets/3879181/12832997/e4f12630-cb9d-11e5-8cbf-589ad68e4b08.gif)

###Autocomplete files

![Autocomplete files](https://cloud.githubusercontent.com/assets/3879181/12832990/d6bd7d2a-cb9d-11e5-9f47-88f3efffb2ad.gif)

###Autocomplete babelrc 6+ plugins and presets

![Autocomplete babelrc plugins and presets](https://cloud.githubusercontent.com/assets/3879181/12832973/c3e5be4c-cb9d-11e5-99e1-50d2f316215e.gif)


#currently supported schemas

1. `package.json` - for node package configuration
2. `tsconfig.json` - for TypeScript project configuration
3. `bower.json` - for bower configuration **(package completions missing - need help with versions)**
4. `.babelrc` - for babel 6+ configuration. **To make this work, you have to remove `.*` from the autocomplete-plus blacklist!** `File` -> `Settings` -> `Packages` -> `autocomplete-plus` -> `Settings` -> override default `.*` with a space for example
5. `composer.json` - for the popular php package manager

#development & plugins

Check out the [wiki](https://github.com/bali182/autocomplete-json/wiki)

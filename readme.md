#autocomplete-json
This package enables semantic autocompletion for JSON files.

![Demo image](https://cloud.githubusercontent.com/assets/3879181/12522353/700e3c9c-c150-11e5-9a99-eae9d6fddce1.gif "Demo")

#currently supported schemas
1. `package.json` - for node package configuration
2. `tsconfig.json` - for TypeScript project configuration

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

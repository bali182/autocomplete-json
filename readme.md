#autocomplete-json
This package enables semantic autocompletion for JSON files.

![Demo image](/demo.gif "Demo")

#currently supported schemas
1. `package.json` - for node package configuration
2. `tsconfig.json` - for TypeScript project configuration

#development

1. `git clone <this repository>`
2. `cd <cloned repository>`
3. `npm install`
4. `tsd install`
5. `tsc -w`
6. `apm link .` - This will tell atom, to include this package.
7. `atom -d .` - Start atom in this folder in development mode.
8. `CTRL (CMD) + ALT + I` - Open developer console if needed.

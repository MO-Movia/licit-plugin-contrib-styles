
# Customstyle ProseMirror Plugin For Licit



  

## Build

  

### Dependency
 
- Pack [licit-ui-components](https://github.com/MO-Movia/licit-ui-components/tree/initial) and copy _modusoperandi-licit-ui-commands-0.0.1.tgz_ to the root folder.

  

### Commands

- npm install

- npm pack

  

#### To use this in Licit

Run these commands before npm install.

Put the _modusoperandi-licit-customstyles-0.0.1-0.tgz_ file in your project location, open command prompt and run:

- npm install *modusoperandi-licit-customstyles-0.0.1-0.tgz*


Include plugin in licit component 

- import CustomstylePlugin 

- add CustomstylePlugin instance in licit's plugin array

```

import {CustomstylePlugin} from  '@modusoperandi/licit-customstyles';

Expecting a CustomStyleRuntime to configure the style service to licit expects methods like saveStyle(),getStyles(),renameStyle() and removeStyle(). Please refer *licit\client\CustomStyleRuntime.js* for getting more detailed idea.

import CustomStyleRuntime from  './CustomStyleRuntime';
const styleRuntime = new CustomStyleRuntime();
const plugins = [new CustomstylePlugin(styleRuntime)]

ReactDOM.render(<Licit docID={0} plugins={plugins}/>
  

```
 

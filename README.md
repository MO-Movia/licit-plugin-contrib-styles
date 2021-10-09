
# Customstyle ProseMirror Plugin For Licit
![Build Status](https://github.com/MO-Movia/licit-plugin-contrib-styles/workflows/build/badge.svg?branch=master)
![GitHub last commit](https://img.shields.io/github/last-commit/MO-Movia/licit-plugin-contrib-styles)
[![codecov](https://codecov.io/gh/MO-Movia/licit-plugin-contrib-styles/branch/master/graph/badge.svg?token=NATCWSTFE6)](https://codecov.io/gh/MO-Movia/licit-plugin-contrib-styles)



  

## Build

  

### Dependency

- Build [licit-doc-attrs-step](https://github.com/MO-Movia/licit-doc-attrs-step) and copy _modusoperandi-licit-doc-attrs-step-0.0.1.tgz_ to the root folder.

  

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
 

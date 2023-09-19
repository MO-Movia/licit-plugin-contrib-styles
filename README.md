
# Customstyle ProseMirror Plugin For Licit
![Build Status](https://github.com/MO-Movia/licit-plugin-contrib-styles/workflows/build/badge.svg?branch=master)
![GitHub last commit](https://img.shields.io/github/last-commit/MO-Movia/licit-plugin-contrib-styles)
[![codecov](https://codecov.io/gh/MO-Movia/licit-plugin-contrib-styles/branch/master/graph/badge.svg?token=NATCWSTFE6)](https://codecov.io/gh/MO-Movia/licit-plugin-contrib-styles)



  

## Build
  

### Commands
 
- npm install 

- npm pack 

#### To use this in Licit

Run these commands before npm install.

Put the _modusoperandi-licit-custom-styles-0.1.0.tgz_ file in your project location, open command prompt and run:

- npm install *modusoperandi-licit-custom-styles-0.1.0.tgz*

Include plugin in licit component 

- import CustomstylePlugin 

- add CustomstylePlugin instance in licit's plugin array

```
import {CustomstylePlugin} from  '@modusoperandi/licit-custom-styles';

Expecting two parameters in CustomstylePlugin and the parameters are:

 1.A CustomStyleRuntime to configure the style service to licit expects methods like saveStyle(),getStyles(),renameStyle() and removeStyle(). Please refer *licit\client\CustomStyleRuntime.js* for getting more detailed idea.
 2. A boolean flag that indicating the custom style numbering should be displayed or not for the document. For hide numbering pass true.

import CustomStyleRuntime from  './CustomStyleRuntime';
const styleRuntime = new CustomStyleRuntime();
const plugins = [new CustomstylePlugin(styleRuntime,false)]

ReactDOM.render(<Licit docID={''} plugins={plugins}/>
```
#### To load the custom style list drop down and the style editor UI to an angular project
 -  import the customstyle.css file in the default global CSS file (src\styles.scss) of the angular project.
 ```
@import  "~@modusoperandi/licit-custom-styles/dist/customstyle.css";
```

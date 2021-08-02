
# Customstyle ProseMirror Plugin For Licit



  

## Build

  

### Dependency

- Build [licit-doc-attrs-step](https://github.com/MO-Movia/licit-doc-attrs-step) and copy _modusoperandi-licit-doc-attrs-step-0.0.1.tgz_ to the root folder.

  

### Commands

- npm install

- npm pack

  

#### To use this in Licit

Run these commands before npm install.

- npm install *modusoperandi-licit-doc-attrs-step-0.0.1.tgz*

- npm install *mo-licit-customstyles-0.0.1-0.tgz*


Include plugin in licit component 

- import CustomstylePlugin 

- add CustomstylePlugin instance in licit's plugin array

```

import {CustomstylePlugin} from  '@mo/licit-customstyles';


const  plugins = [new  CustomstylePlugin()]

ReactDOM.render(<Licit docID={0} plugins={plugins}/>
  

```
 

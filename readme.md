This repo contains an isometric game engine. You can implement it as a jQuery plugin.The root folder of this project contains a node.js server script that requires express. When installed it loads TMX xml maps from the open source tile editor "Tiled". For downloading and information about this editor see http://www.mapeditor.org/

To install node.js dependencies automaticly please try node package manager, try... 
npm install

...then type:
node app.js

For the use of sound, you can install the jplayer in the javascript folder and as script tag in layout.jade. Then in main.js you can change the default sound value to true.

Most of the settings are in main.js in the root of the javascripts folder.

- Known issues
In Chrome, when frame ticker is set off, the nested objects will not be updated every frame. In firefox this seems no problem.

- To do:
Movable Sprites
Docs
Some refactoring
###Isometric tile editor###
#####a javaScript html5 jQuery plugin#####
 
<p>This repo contains a html5 / javascript isometric game engine.</p> 

You can see a demo [here](http://rstr74.github.com/iso-tile-world-engine/)

You can implement it like this:
```javascript
$(function() {
	$("#isoWorldContainer").isoWorldEngine({
		logging : false,
		sound : false,
		cropH : 10,
		cropW : 10,
		fps : 100,
		showObjectBorders : false,
		showTicker:true,
		tmxFilePath : "world/",
		tmxFile : "map.tmx"
	});

defaults:

sound---------------[false]

logging-------------[false] Just for console logging in browser
logFilter-----------["some filter for logging"] filter logging

showInfoText--------[true] 
infoText------------["Some info text"]
fps-----------------[24]
showTicker----------[false] show fps indicator

tmxFilePath---------["world/"] folder placed in public, slash!
tmxFile-------------["map.tmx"] 

showObjectBorders---[true] 
container-----------["isoWorldContainer"]

cropH---------------[10] canvas cropping Height
cropW---------------[10] canvas cropping Width
cropX---------------[0]  canvas cropping X
cropY---------------[0]  canvas cropping Y
offsetX-------------[0]  change offsetX at startup
offsetY-------------[0]  change offsetY at startup

```
The root folder of this project contains a node.js server script that requires express. When installed it loads TMX xml maps from the open source tile editor "Tiled". For downloading and information about this editor see [this site](http://www.mapeditor.org/)
You can see a demo [here](http://rstr74.github.com/iso-tile-world-engine/)

####install####
To install node.js dependencies automaticly please try node package manager, try...

- npm install

then type:

- node app.js

For the use of sound, you can install the jplayer in the javascript folder and as script tag in layout.jade. Then in main.js you can change the default sound value to true.

Most of the settings are in main.js in the root of the javascripts folder.

####Known issues:####
In Chrome, when frame ticker is set off, 
the nested objects will not be updated every frame.
In firefox this seems no problem.

####To do:#####
- Movable Sprites API
- Tile actions and commands
- now.js server setup
- Docs
- Some refactoring
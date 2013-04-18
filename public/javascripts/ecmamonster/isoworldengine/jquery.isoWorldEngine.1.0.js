/*
 *	jQuery IsoWorldEngine 1.0
 *
 *	Copyright (c) 2012 Robbert Streng
 *	www.robbertstreng.nl
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	http://en.wikipedia.org/wiki/MIT_License
 *	http://en.wikipedia.org/wiki/GNU_General_Public_License
 *
 *
 */

(function($) {
	$.fn.isoWorldEngine = function(o) {
	
		this.constants = {
			extensionName : 'IsoWorldEngine',
			author : "ecmaMonster"
		};

		/**
		 * this init constructor function is "automaticly"
		 * called when an instance is created of the isoWorldEngine plugin
		 * @constructor
		 * @param {object} object that overrides the defaults
		 * @returns {void} nothing
		 */
		this.init = function(o) {
		
			o.container=$(this).attr("id").replace("#","");
			opts = $.extend(true, {}, $.fn.isoWorldEngine.defaults, o);
			if(!o.tmxFilePath) {
				log("No tile editor TMX filePath provided, now using default at world/map.tmx ", "WARNING");
			}
			// getting TMX world data from file
			jQuery.ajax({
				type : "GET",
				url : opts.tmxFilePath + opts.tmxFile,
				dataType : "xml",
			})
			// it worked, now parsing data....
			.success(function(XMLresponse) {

				log("tmx Map loaded successful", "INIT");
				opts.tmxAsXML = XMLresponse;
			})
			// something went wrong....
			.error(function() {
				log("error: loading tmx file:" + opts.tmxFilePath + " failed", "ERROR");
			})
			// paring is done
			.complete(function() {
				startEngine();

			});
		};

		return this.init(o);
	};

	function allTileSetsLoaded() {
		return false;
	}


	$.fn.isoWorldEngine.defaults = {
		// sound on?
		sound : false,
		// some debugging features
		logging : false,
		logFilter : "",
		showInfoText : true,
		infoText : "ISO_TILE_ENGINE_V.0.0.1_(c)_2012_Robbert_Streng",
		fps : 24,
		showTicker:false,
		
		// dir + slash for tmx file
		tmxFilePath : "world/",
		tmxFile : "map.tmx",
		tmxAsXML : null,
		// for multiple users
		server : false,
		tileSetsReference : [],
		tileSets : {},

		tileLayerReference : [],
		tileLayers : {},

		objectGroupsReference : [],
		objectGroups : {},
		showObjectBorders:true,
		
		container : "",
		// visual section of the map, this will be masking the tile, sprite and object layers.
		cropH : 10,
		cropW : 10,
		cropX : 0,
		cropY : 0,

		// this can be set for aligning the map in some way: in pixels!
		offsetX : 0,
		offsetY : 0,

		// optional debugging feature
		showGrid : false,
		gridColor : "#CCCCCC",

		// basic values from the TMX map element:
		// Just the general tile height/width in pixels
		isoWorldTileWidth : 0,
		isoWorldTileHeight : 0,
		// count of total tiles h/w of world
		isoWorldTileHCount : 0,
		isoWorldTileWCount : 0,

		isoWorldDummyBackgroundColor : "lightblue",

		// all tile, sprite and object layer inherit this style
		isoWorldCanvasStyle : "",

		// optional text for no canvas fallback
		isoWorldCanvasNoCanvas : "",

		//tile set image buffer array
		tileSetImage : []
	};

	/*
	 * PRIVATE FUNCTIONS
	 */
	function startEngine() {
		log("loading TMX data complete.", "INFO");
		parseMetaData();
		log("parsing Metadata", "INIT");
		parseTileSets();
		log("parsing TileSets", "INIT");
		parseTileLayers();
		log("parsing Base Layers", "INIT");
		parseObjectGroups();
		log("parsing Object Groups", "INIT");
		drawAllTileLayers();

		createObjectLayer();
		placeGroupObjects(opts.objectGroupsReference.length - 1);
		log("drawing Tiles", "INIT");
		//createGridCanvas();
		//log("creating Grid Canvas", "INIT");
		if(opts.showInfoText) {
			createInfoLayer()
		};
		log("creating Info Layer", "INIT");

		if(opts.sound == true) {
			log("starting sounds", "INIT");
			$("body").append('<div id="jquery_jplayer_1"/>');
			$("#jquery_jplayer_1").jPlayer({
				ready : function(event) {
					$(this).jPlayer("setMedia", {
						oga : "sounds/contemplation.ogg"
					}).jPlayer("play");
				},
				swfPath : "http://www.jplayer.org/2.1.0/js",
				supplied : "oga",
				loop : true
			});
		} else {
			log("sound is off", "INFO");
		}

		drawText(10, 20, "READY");

		var player = new $.fn.isoWorldEngine.FrameBasedAnimation();
		player.setFrameSpeed(opts.fps);
		player.myTickerEvent.subscribe($.fn.isoWorldEngine.update);

		$.fn.isoWorldEngine.onReady();
	}

	function createInfoLayer() {
		var startX = 10;
		var startY = 10;
		opts.infoLayer = addCanvas(opts.container, "infoLayer", (opts.cropW - opts.cropX) * opts.isoWorldTileWidth, (opts.cropH - opts.cropY) * opts.isoWorldTileHeight, "", opts.isoWorldCanvasNoCanvas);

		drawText(startX, startY, opts.infoText)

	}

	function drawText(offsetX, offsetY, text) {

		if(opts.fontImage) {
			var fontW = 6;
			var fontH = 7;
			var context = opts.infoLayer.getContext("2d");
			var _text = text;
			var code = 0;
			var len = _text.length;
			var i = 0;
			for( i = 0; i < len; i++) {
				code = text.charCodeAt(i) - 33;
				context.drawImage(opts.fontImage, code * fontW, 0, fontW, fontH, offsetX + (i * fontW), offsetY, fontW, fontH);
			}
		} else {
			opts.fontImage = new Image();
			var text = "" + text;
			opts.fontImage.onload = function() {
				var fontW = 6;
				var fontH = 7;
				var context = opts.infoLayer.getContext("2d");
				var _text = text;
				var code = 0;
				var len = _text.length;
				var i = 0;
				for( i = 0; i < len; i++) {
					code = text.charCodeAt(i) - 33;
					context.drawImage(this, code * fontW, 0, fontW, fontH, offsetX + (i * fontW), offsetY, fontW, fontH);
				}
			}
			opts.fontImage.src = "images/bitmapfont.png";
		}

	}


	$.fn.isoWorldEngine.drawText = function(offsetX, offsetY, text) {
		drawText(offsetX, offsetY, text);
	}
	function getTileSet(forLayerIndex) {
		// now get the right tileSet for this layer
		return opts.tileSets["" + opts.tileSetsReference[0]];
	}

	function getTileData(forLayerIndex) {
		return opts.tileLayers["" + opts.tileLayerReference[forLayerIndex]].tiles;
	}

	function setTileData(dx, dy, forLayerIndex, newValue) {
		// now get the right tileSet
		var tileSet = getTileSet(forLayerIndex);

		var tileData = getTileData(forLayerIndex);
		tileData[tileSet.getDataIndex(dx, dy)] = newValue;
	}

	function getTileData(forLayerIndex) {
		return opts.tileLayers["" + opts.tileLayerReference[forLayerIndex]].tiles;
	}

	function drawAllTileLayers() {

		$("#" + opts.container).append('<div id="tileAndObjectsDummy"/>').css("position", "relative");
		for(var forIndexOfLayer = 0; forIndexOfLayer < opts.tileLayerReference.length; forIndexOfLayer++) {
			createTileLayerCanvas(forIndexOfLayer);
			drawTilesOn(forIndexOfLayer);
		}
	}

	function drawTilesOn(forLayerIndex) {
		// get the right cavas
		var canvasLayerContext = $("#" + opts.tileLayerReference[forLayerIndex])[0].getContext("2d");

		// now get the right tileSet
		var tileSet = getTileSet(forLayerIndex);

		var tileData = getTileData(forLayerIndex);

		var interval = setInterval(function() {

			if($(tileSet.image).prop('complete') == true) {
				clearInterval(interval);
				for(var worldTileY = 0; worldTileY <= opts.isoWorldTileHCount - 1; worldTileY++) {
					for(var worldTileX = 0; worldTileX <= opts.isoWorldTileWCount - 1; worldTileX++) {
						var tileResult = tileData[tileSet.getDataIndex(worldTileX, worldTileY)];
						if(tileResult != 0) {
							drawATileFromTileSet(canvasLayerContext, tileSet, tileResult, worldTileX, worldTileY, tileSet.image);
						}
					}
				}
			} else {
				log("preloading image....", "INFO");
			}
		}, 1000);
	}

	function drawATileFromTileSet(context, tileSet, singleTileDataEntry, dx, dy, image) {
		var bounds = tileSet.getBounds(singleTileDataEntry);
		var ith = opts.isoWorldTileHeight;
		var itw = opts.isoWorldTileWidth;
		var tileX = tileSet.getTileX(dx, dy, itw, ith);
		var tileY = tileSet.getTileY(dx, dy, itw, ith);
		context.drawImage(image, bounds.sx, bounds.sy, bounds.sw, bounds.sh, opts.offsetX - (bounds.sw / 2) + ((opts.isoWorldTileWCount / 2) * bounds.sw) + tileX, opts.offsetY - (bounds.sw / 2) + tileY, bounds.sw, bounds.sh);
	}

	function createTileLayerCanvas(forLayerIndex) {
		// currently the engine draw just one tile layer
		addLayerCanvas($("#tileAndObjectsDummy"), opts.tileLayerReference[forLayerIndex], opts.isoWorldCanvasWidth, opts.isoWorldCanvasHeight, opts.isoWorldCanvasStyle, opts.isoWorldCanvasNoCanvas);
	}

	function createGridCanvas() {
		// currently the engine draw just one tile layer
		var gridCanvas = addCanvas(opts.container, "grid", opts.isoWorldTileWidth * opts.isoWorldTileWCount, opts.isoWorldTileHeight * opts.isoWorldTileHCount, "", opts.isoWorldCanvasNoCanvas);
		drawGrid(gridCanvas);
	}

	function drawGrid(gridCanvas) {
		drawAGrid(gridCanvas.getContext("2d"), "1", opts.isoWorldTileWCount, opts.isoWorldTileHCount, opts.isoWorldTileWidth * opts.isoWorldTileWCount, opts.isoWorldTileHeight * opts.isoWorldTileHCount, opts.gridColor);
	}

	function drawAGrid(context, p, countW, countH, w, h, color) {
		for(var x = 0; x <= countW; x++) {
			for(var y = 0; y <= countH; y++) {
				context.strokeRect(x * w, y * h, w, h);
				context.strokeStyle = color;
				context.stroke();
			}
		}
	}

	function addLayerCanvas(target, canvasId, width, height, style, nocanvas) {

		var target = target;
		$("#" + opts.container).css("background-color", opts.isoWorldDummyBackgroundColor);
		$(target).css("opacity", 1);
		$(target).css("position", "relative");
		$("#" + opts.container).css("overflow", "hidden");
		$("#" + opts.container).css("width", ((-opts.cropX + opts.cropW) * opts.isoWorldTileWidth) + "px");
		$("#" + opts.container).css("height", ((-opts.cropY + opts.cropH) * opts.isoWorldTileHeight) + "px");

		if(!nocanvas) {
			nocanvas = "your browser does not support the canvas tag"
		}
		var canvas = $('<canvas />', {
			id : canvasId,
			style : style
		});
		canvas.append(nocanvas);
		target.append(canvas);
		canvas[0].height = (opts.isoWorldTileHeight * opts.isoWorldTileHCount);
		canvas[0].width = (opts.isoWorldTileWidth * opts.isoWorldTileWCount);

		canvas.css("position", "absolute");
		canvas.css("opacity", 1);
		return canvas[0];
	}

	function addLayerDiv(target, divId, width, height, style, nocanvas) {
		console.log($("#" + opts.container));
		var target = target;
		console.log(target);
		$(target).css("opacity", 1);
		$(target).css("position", "relative");
		
		
		var container=$("#" + opts.container);		
		var w=parseInt(((-opts.cropX + opts.cropW) * (opts.isoWorldTileWidth)));
		var h=parseInt(((-opts.cropY + opts.cropH) * (opts.isoWorldTileHeight)));
	
		container.css(
			{	backgroundColor:opts.isoWorldDummyBackgroundColor,
				width:w,
				height:h,
				overflow:"hidden"				
			});
		
			

		if(!nocanvas) {
			nocanvas = "your browser does not support the canvas tag"
		}
		var div = $('<div />', {
			id : divId,
			style : style
		});
		target.append(div);

		div.css("height", (opts.isoWorldTileHeight * opts.isoWorldTileHCount) + "px");
		div.css("width", (opts.isoWorldTileWidth * opts.isoWorldTileWCount) + "px");
		div.css("opacity", 1);
		return div;
	}

	function addCanvas(target, canvasId, width, height, style, nocanvas) {
		var target = $("#" + target);
		if(!nocanvas) {
			nocanvas = "your browser does not support the canvas tag"
		}
		var canvas = $('<canvas />', {
			id : canvasId,
			style : style
		});
		canvas.append(nocanvas);
		target.append(canvas);
		canvas[0].height = height;
		canvas[0].width = width;
		canvas.css("position", "absolute");
		canvas.css("opacity", 1);
		return canvas[0];
	}

	function parseMetaData() {
		opts.isoWorldTileWCount = $(opts.tmxAsXML).find("map").attr("width");
		opts.isoWorldTileHCount = $(opts.tmxAsXML).find("map").attr("height");
		opts.isoWorldTileWidth = $(opts.tmxAsXML).find("map").attr("tilewidth");
		opts.isoWorldTileHeight = $(opts.tmxAsXML).find("map").attr("tileheight");
	}

	function createObjectLayer() {
		opts.objectLayer = addLayerDiv($("#tileAndObjectsDummy"), "objectLayer", opts.isoWorldTileWCount * opts.isoWorldTileWidth, opts.isoWorldTileHCount * opts.isoWorldTileHeight, "", opts.isoWorldCanvasNoCanvas);
	}

	function parseObjectGroups() {
		// parsing objectgroup
		$(opts.tmxAsXML).find("objectgroup").each(function() {
			var objects = [];
			
		
			
			$(this).find("object").each(function(index, object) {
				log($(this));
				if($(this).attr("gid")) {
					objects.push({
						gid : $(this).attr("gid"),
						x : parseInt($(this).attr("x")),
						y : parseInt($(this).attr("y")),
						create : function(element) {
							var tileSet = getTileSet(0);
							var bounds = tileSet.getBounds(this.gid);
	
							var aantalTilesBreedte = opts.isoWorldTileWCount;
							var tileBreedteInPixels = opts.isoWorldTileWidth;

							var left = 	-opts.isoWorldTileHeight+(aantalTilesBreedte*tileBreedteInPixels/2+this.x)+(this.y*-1);
							var top =  -opts.isoWorldTileWidth+(this.y+this.x)/2;

							$("#" + element).append('<div id="obj-' + this.x + '-' + this.y + '"><div/>');
							$("#" + 'obj-' + this.x + '-' + this.y).css("position", "absolute");
							$("#" + 'obj-' + this.x + '-' + this.y).css("position", "absolute");

							$("#" + 'obj-' + this.x + '-' + this.y).css("background-image", "url(" + tileSet.src + ")");
							$("#" + 'obj-' + this.x + '-' + this.y).css("background-repeat", "no-repeat");
							$("#" + 'obj-' + this.x + '-' + this.y).css("backgroundPosition", "-" + bounds.sx + "px -" + bounds.sy + "px")
							$("#" + 'obj-' + this.x + '-' + this.y).css("width", tileSet.tileWidthInPixels + "px");
							$("#" + 'obj-' + this.x + '-' + this.y).css("height", tileSet.tileHeightInPixels + "px");
							$("#" + 'obj-' + this.x + '-' + this.y).css("left", left + "px");
							$("#" + 'obj-' + this.x + '-' + this.y).css("top", top + "px");
							if(opts.showObjectBorders) {
								$("#" + 'obj-' + this.x + '-' + this.y).css("border", "dotted 1px #000000");
							}
						}
					});
				} 
				//$("#loader").text(index);
				//$("#loader").css("width", index / 100 + "px");
			})
			var width = $(this).attr("width");
			var height = $(this).attr("height");

			opts.objectGroupsReference.push($(this).attr("name"));
			opts.objectGroups["" + $(this).attr("name")] = {
				objects : objects,
				width : width,
				height : height
			};

		});

	}

	function getGroupObjects(ofGroupIndex) {
		return opts.objectGroups[opts.objectGroupsReference[ofGroupIndex]];
	}

	function placeGroupObjects(ofGroupIndex) {

		var groupObjects = getGroupObjects(ofGroupIndex);
		log(groupObjects, "groupObjects");
		for(var objectSlice in groupObjects.objects) {
			log(groupObjects.objects[objectSlice], "groupObjects");
			// now get the right tileSet
			var tileSet = getTileSet(0);
			groupObjects.objects[objectSlice].create("objectLayer", tileSet);
		}
	}

	function createAllGroupObjects() {
	}

	function parseTileLayers() {
		// parsing tileLayers
		$(opts.tmxAsXML).find("layer").each(function() {
			var tiles = [];
			$(this).find("data tile").each(function(index, object) {
				tiles.push($(this).attr("gid"));
				$("#loader").text(index);
				$("#loader").css("width", index + "px");
			})
			if($(this).find("data").attr("encoding") == "base64") {
				//	var data = Base64.decode();
			} else {
				//$(this).find("tile").each(function(index) {
				//});
			}
			var width = $(this).attr("width");
			var height = $(this).attr("height");
			var name = $(this).attr("name").split(' ').join('_');
			opts.tileLayerReference.push("" + name);
			opts.tileLayers["" + name] = {
				tiles : tiles,
				width : width,
				height : height
			};
		});
	}

	function parseTileSets(callback) {
		// parsing tilesets
		$(opts.tmxAsXML).find("tileset").each(function() {
			var tileWidthInPixels = $(this).attr("tilewidth");
			var tileHeightInPixels = $(this).attr("tileheight");
			var firstgid = $(this).attr("firstgid");
			var src = $(this).find("image").attr("source");
			var width = $(this).find("image").attr("width");
			var height = $(this).find("image").attr("height");

			// how many sprite in the image horizontal
			var spriteWCount = Math.floor(width / tileWidthInPixels);

			// how many sprite in the image vertical
			var spriteHCount = Math.floor(height / tileHeightInPixels);
			var name = $(this).attr("name").split(' ').join('_');

			var isloaded = false;
			var _image = new Image();
			var callback = callback;
			var self = this;
			opts.tileSetsReference.push(name);
			_image.onload = function() {
				isloaded = true;

			}
			_image.src = opts.tmxFilePath + src;
			opts.tileSets["" + name] = {
				src : opts.tmxFilePath + src,
				tileWidthInPixels : tileWidthInPixels,
				tileHeightInPixels : tileHeightInPixels,
				spriteWCount : spriteWCount,
				spriteHCount : spriteHCount,
				getDataIndex : function(worldTileX, worldTileY) {
					return (worldTileY * (opts.isoWorldTileWCount)) + worldTileX;
				},
				getBounds : function(gid) {
					var colfills = Math.floor(gid / this.spriteWCount);
					var colsleft = Math.round(((gid / this.spriteWCount - colfills)) * this.spriteWCount);
					var colsOffset = this.spriteWCount - (this.spriteWCount - colsleft);
					var sy = (colfills) * this.tileHeightInPixels;
					var sx = (colsOffset - 1) * this.tileWidthInPixels;

					if(colsleft == 0) {
						var sy = (colfills - 1) * this.tileWidthInPixels;
						var sx = (this.spriteWCount - 1) * this.tileWidthInPixels;
					}

					var sw = this.tileWidthInPixels;
					var sh = this.tileHeightInPixels;

					return {
						sx : sx,
						sy : sy,
						sw : sw,
						sh : sh
					}
				},
				getTileX : function(dx, dy, isw, ish) {
					return ((dx - dy) * isw / 2);
				},
				getTileY : function(dx, dy, isw, ish) {
					return (dx + dy) * ish / 2;
				},
				image : _image,
				isloaded : isloaded,
				firstgid : firstgid,
				width : width,
				height : height
			};

		});

		//
		//	}
	}

	function checkLoaded() {
		var l = $(opts.tmxAsXML).find("tileset").length;
		if(opts.tileSets[opts.tileSetsReference[l - 1]].image.isLoaded)
		;
	}

	function log(m, level) {
		if(opts.logging) {
			if( typeof m == 'string') {
				m = "" + level + ": " + m;
			} else {
				var n = "" + level + ":";
			}
			if(opts.logFilter != level && opts.logFilter != "") {
				return false;
			}
			if(window.console && window.console.log)
				if(!n) {
					window.console.log(m);
				} else {
					window.console.log(n);
					window.console.log(m);
				}
			else
				try {
					if(!n) {
						console.log(m);
					} else {
						console.log(n);
						console.log(m);
					}
				} catch (err) {
				}

			return false;
		}
	};

	CustomEvent = function() {
		//name of the event
		this.eventName = arguments[0];
		var mEventName = this.eventName;

		//function to call on event fire
		var eventActions = new Object();

		//subscribe a function to the event
		this.subscribe = function(fn) {
			if(!eventActions[this.eventName]) {
				eventActions[this.eventName] = new Array();
			}
			eventActions[this.eventName].push(fn);
		};

		//unsubscribe a function to the event
		this.unsubscribe = function(fn) {
			var eventArr = new Array();
			for(var i = 0; i < eventActions[this.eventName].length; i++) {
				if(eventActions[this.eventName][i] != fn) {
					eventArr.push(eventActions[this.eventName][i]);
				}
			}

			eventActions[this.eventName] = eventArr;

		};

		//fire the event
		this.fire = function(sender, eventArgs) {
			if(eventActions[this.eventName] != null) {
				for(var i = 0; i < eventActions[this.eventName].length; i++) {
					eventActions[this.eventName][i](sender, eventArgs);
				}
			} else {
				log('There was no function subscribed to the ' + mEventName + ' event!', "WARNING");
			}
		};
	};

	/*
	 * PUBLIC FUNCTIONS
	 */
	$.fn.isoWorldEngine.update = function() {
	}
	// use this function to update a certain tile in a certain layer (index number of tileLayer)
	$.fn.isoWorldEngine.updateTileData = function(dx, dy, forLayerIndex, newValue, redraw) {
		// setting new value
		setTileData(dx, dy, forLayerIndex, newValue);

		if(redraw || redraw != undefined || redraw != null) {
			drawTilesOn(forLayerIndex);
		}
	}
	$.fn.isoWorldEngine.FrameBasedAnimation = function() {
		this.init();
		self = this;
	}

	$.fn.isoWorldEngine.FrameBasedAnimation.prototype.init = function() {

		this.tickCount = 1;
		this.framespeed = 100;
		this.interval

		this.isPlaying = false;
		this.myTickerEvent
		this.frameCount = 0;
		this.frameCountNow = 0;

		this.debug('start');
		setInterval(this.frameSpeedIndicator, 1000);
		this.setFrameSpeed(this.framespeed);
	}

	$.fn.isoWorldEngine.FrameBasedAnimation.prototype.loopFunction = function(sender, object) {
		self.tickCount++;
		self.frameCount++;
		var offsetX = ((opts.cropW - opts.cropX) * 64) - 55;
		var offsetY = 10
		if(opts.showTicker) {
		drawText(offsetX, offsetY, "" + self.frameCountNow);
		drawText(offsetX + 15, offsetY, "" + self.tickCount);
		drawText(offsetX + 30, offsetY, "" + self.framespeed);
		}
	}

	$.fn.isoWorldEngine.FrameBasedAnimation.prototype.frameSpeedIndicator = function() {
		self.frameCountNow = self.frameCount;
		self.frameCount = 0;
		self.tickCount = 0;
	}

	$.fn.isoWorldEngine.FrameBasedAnimation.prototype.broadCastTickerEvent = function() {
		self.myTickerEvent.fire("myEvent", {
			message : 'tick'
		});
	}

	$.fn.isoWorldEngine.FrameBasedAnimation.prototype.debug = function(message) {
	}

	$.fn.isoWorldEngine.FrameBasedAnimation.prototype.stopPlaying = function() {
		if(this.isPlaying) {
			clearInterval(this.interval);
			this.myTickerEvent.unsubscribe(this.loopFunction);
			this.debug('removing myTickerEvent');
			this.isPlaying = false;
		}
		this.debug('stopPlaying');
	}

	$.fn.isoWorldEngine.FrameBasedAnimation.prototype.startPlaying = function() {
		this.setFrameSpeed(this.framespeed);
		this.debug('startPlaying at framespeed:' + this.framespeed);
	}

	$.fn.isoWorldEngine.FrameBasedAnimation.prototype.setFrameSpeed = function(speed) {
		this.framespeed = speed;

		if(this.isPlaying) {
			clearInterval(this.interval);
			this.myTickerEvent.unsubscribe(this.loopFunction);
			this.debug('removing myTickerEvent');
			this.isPlaying = false;
		}

		this.debug('creating myTickerEvent');
		this.debug('playing at framespeed:' + this.framespeed);
		this.myTickerEvent = new CustomEvent("tick");
		this.myTickerEvent.subscribe(this.loopFunction);
		this.interval = setInterval(this.broadCastTickerEvent, 1000 / this.framespeed);
		this.isPlaying = true;

	}

	$.fn.isoWorldEngine.KeyControl = function() {

		$(document).keydown(this._keypress);
		$(document).keyup(this._keyup);
	}

	$.fn.isoWorldEngine.KeyControl.prototype._keyup = function(e) {
		// console.log( "_keyup: e.which="+e.which );
		if($.fn.isoWorldEngine.KeyControl._keydirs[e.keyCode]) {
			$.fn.isoWorldEngine.KeyControl._keydirs[e.keyCode][0] = false;
		}
	}

	$.fn.isoWorldEngine.KeyControl.prototype._keypress = function(e) {
		// console.log( "_keypress: e.which="+e.which );
		if($.fn.isoWorldEngine.KeyControl._keydirs[e.keyCode]) {
			$.fn.isoWorldEngine.KeyControl._keydirs[e.keyCode][0] = true;
		}
	}

	$.fn.isoWorldEngine.KeyControl.prototype.getDirection = function() {

		//left
		if($.fn.isoWorldEngine.KeyControl._keydirs[37][0]) {
			//up
			if($.fn.isoWorldEngine.KeyControl._keydirs[38][0])
				return $.fn.isoWorldEngine.KeyControlConstants.dirs.LEFT_UP;
			//down
			if($.fn.isoWorldEngine.KeyControl._keydirs[40][0])
				return $.fn.isoWorldEngine.KeyControlConstants.dirs.LEFT_DOWN;
			//left
			return $.fn.isoWorldEngine.KeyControl._keydirs[37][1];
		}

		//up
		if($.fn.isoWorldEngine.KeyControl._keydirs[38][0]) {
			//left
			if($.fn.isoWorldEngine.KeyControl._keydirs[37][0])
				return $.fn.isoWorldEngine.KeyControlConstants.dirs.LEFT_UP;
			//right
			if($.fn.isoWorldEngine.KeyControl._keydirs[39][0])
				return $.fn.isoWorldEngine.KeyControlConstants.dirs.RIGHT_UP;
			//up
			return $.fn.isoWorldEngine.KeyControl._keydirs[38][1];
		}

		//right
		if($.fn.isoWorldEngine.KeyControl._keydirs[39][0]) {
			//up
			if($.fn.isoWorldEngine.KeyControl._keydirs[38][0])
				return $.fn.isoWorldEngine.KeyControlConstants.dirs.RIGHT_UP;
			//down
			if($.fn.isoWorldEngine.KeyControl._keydirs[40][0])
				return $.fn.isoWorldEngine.KeyControlConstants.dirs.RIGHT_DOWN;
			//right
			return $.fn.isoWorldEngine.KeyControl._keydirs[39][1];

		}

		//down
		if($.fn.isoWorldEngine.KeyControl._keydirs[40][0]) {
			//left
			if($.fn.isoWorldEngine.KeyControl._keydirs[37][0])
				return $.fn.isoWorldEngine.KeyControlConstants.dirs.LEFT_DOWN;
			//right
			if($.fn.isoWorldEngine.KeyControl._keydirs[39][0])
				return $.fn.isoWorldEngine.KeyControlConstants.dirs.RIGHT_DOWN;
			//down
			return $.fn.isoWorldEngine.KeyControl._keydirs[40][1];
		}
		return 8;
	}

	$.fn.isoWorldEngine.KeyControlConstants = {};

	$.fn.isoWorldEngine.KeyControlConstants.dirs = {
		DOWN : 0,
		LEFT_DOWN : 1,
		LEFT : 2,
		LEFT_UP : 3,
		UP : 4,
		RIGHT_UP : 5,
		RIGHT : 6,
		RIGHT_DOWN : 7
	}

	$.fn.isoWorldEngine.KeyControl._keydirs = [];
	$.fn.isoWorldEngine.KeyControl._keydirs[37] = [false, $.fn.isoWorldEngine.KeyControlConstants.dirs.LEFT];
	$.fn.isoWorldEngine.KeyControl._keydirs[38] = [false, $.fn.isoWorldEngine.KeyControlConstants.dirs.UP];
	$.fn.isoWorldEngine.KeyControl._keydirs[39] = [false, $.fn.isoWorldEngine.KeyControlConstants.dirs.RIGHT];
	$.fn.isoWorldEngine.KeyControl._keydirs[40] = [false, $.fn.isoWorldEngine.KeyControlConstants.dirs.DOWN];

	$.fn.isoWorldEngine.getMap = function() {
		log("getting MapData", "INFO");
		return opts.map;
	};
	$("isoWorld").isoWorldEngine.onReady = function() {
		log("iso engine ready", "event")
	}
	$.fn.isoWorldEngine.setMap = function(map) {
		opts.map = map;
		return $.fn.isoWorldEngine;
	};

	$.fn.isoWorldEngine.getWorldData = function(WorldLayer) {
		return opts.map;
	};

	$.fn.isoWorldEngine.setWorldData = function(WorldLayer) {
		opts.map = map;
		return $.fn.isoWorldEngine;
	};

})(jQuery)
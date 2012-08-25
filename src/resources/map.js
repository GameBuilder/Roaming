define(['dollar', 'lib/util', 'lib/Promise', 'resources/terrain'], function($, util, Promise, terrainTypes){
  
  var pluck = util.pluck, 
      values = util.values, 
      keys = util.keys;
  
  function Map(options){
    util.mixin(this, options || {});
    if(!this.id){
      this.id = 'map_'+Math.floor(Date.now() * Math.random());
    }
  }
  Map.prototype = {
    initialized: false,
    tileSize: 10,
    startX: 0, 
    startY: 0, 
    showCoords: false,
    
    init: function(){
      if(!this.initialized){
        var canvas = this.canvasNode || ( this.canvasNode = document.createElement("canvas") );
        // canvas.style.cssText = "display:block;margin:4px auto";
        if(! canvas.id){
          canvas.id = this.id +"_canvas";
        }
        this.initialized = true;
      }
      return this;
    },
    render: function(mapData, options) {
      options = options || {};
      // loop over the array of locations
      var tile = null, 
          img = null,
          terrain = null,
          tileSize = options.tileSize ||this.tileSize,
          canvasNode = options.canvasNode || this.canvasNode,
          ctx = canvasNode.getContext("2d"), 
          startX = options.startX || this.startX, 
          startY = options.startY || this.startY, 
          showCoords = ('showCoords' in options) ? options.showCoords : this.showCoords;  
      
      console.log("renderMap at ", tileSize);
      for(var i=0; i<mapData.length; i++){
        tile = mapData[i];
        terrain = terrainTypes[tile.type];
        
        if(terrain){
          img = terrain.img;
          if(img){
            // console.log("render image for type: ", tile.type, " with url: ", terrainTypes[tile.type].url);
            ctx.drawImage(
                img,                    // image
                0,                      // source-x
                0,                      // source-y
                tileSize,               // source-width
                tileSize,               // source-height
                tileSize*(tile.x-startX),        // dest-x
                tileSize*(tile.y-startY),        // dest-y (relative to moveTo)
                tileSize,               // dest-width
                tileSize                // dest-height
            );
            // console.log("drawImage: ", img, tileSize*tile.x, tileSize*tile.y, tileSize, tileSize);
          } else {
            console.log("no img property in: ", terrainTypes[tile.type]);
          }
          if(showCoords) {
            ctx.fillStyle = 'rgba(51,51,51,0.5)';
            ctx.fillRect(tileSize*(tile.x-startX), tileSize*(tile.y-startY), 24, 12);
            ctx.fillStyle = "#ffc";
            ctx.textBaseline = 'top';
            ctx.font = 'normal 9px sans-serif';
            ctx.fillText( 
              tile.x+","+tile.y, 
              tileSize*(tile.x-startX)+1, 
              tileSize*(tile.y-startY)+1
            );
          }
          
        } else {
          console.warn("unknown terrain type in: ", tile);
        }
      }
      return canvasNode;
    },
    reset: function(options){
      // some props need to be unbound, or set to defaults?
      util.mixin(this, options || {})
    }
  };
  
  Map.create = function(options){
    return new Map(options);
  };
  
  return Map;
});
define([
  'dollar', 
  'knockout', 
  'lib/koHelpers',
  'lib/util', 
  'resources/template',
  'lib/event',
  'models/Map',
  'text!resources/templates/player.html',
  'text!resources/templates/tile.html'
], function($, ko, koHelpers, util, template, Evented, Map, playerTemplate, tileTemplate){

  function importTemplate(id, tmpl, bindProperty){
    // setup templates
    var tmplNode = document.createElement('script'); 
    tmplNode.setAttribute('type', 'text/html');
    tmplNode.id = id;
    var tmplText = document.createTextNode( tmpl );
    tmplNode.appendChild(tmplText);
    return document.body.appendChild( tmplNode );
  }
  // viewModel 
  var ui = {
    _inited: false
  };

  var viewModel = ui.viewModel = {
    messages: ko.observableArray([]),
    status: ko.observableArray(['loading']),
    onMessagesClick: onMessagesClick,
    onTileClick: onTileClick,
    tile: null
  };
  
  importTemplate('player-template', playerTemplate, 'player');
  importTemplate('location-template', tileTemplate, 'location');

  
  ui.initSidebar = function(player, world){
    // player.inventory.on('afteradd', function(evt){
    //   $inventoryNode.empty();
    //   for(var i=0; i<player.inventory.length; i++){
    //     $inventoryNode.append("<li>"+ player.inventory[i].name +"</li>");
    //   }
    // });
    // player.inventory.on('afterdrop', function(evt){
    //   $inventoryNode.empty();
    //   for(var i=0; i<player.inventory.length; i++){
    //     $inventoryNode.append("<li>"+ player.inventory[i].name +"</li>");
    //   }
    // });
  };

  util.mixin(ui, Evented);

  var MINIMAP_TILE_SIZE = 12;
  
  ui.init = function(player, tile, region, game){
    if(this._inited && (
      this.game === game
    )){
      return;
    }

    this.game = game;
    viewModel.player = player;
    viewModel.tile = ko.observable( tile );

    var minimap =this.minimap = new Map({ 
      id: 'minimap',
      canvasNode: document.getElementById('minimap'),
      tileSize: MINIMAP_TILE_SIZE 
    });


    // minimap.render( region.tiles, { });
    // this.initHud(player, world);
    // this.initSidebar(player, world);
    // this.initMain(player, world);
    console.log("UI.init with region: ", region);

    // var ids = region.tileIds().slice(0, 6); // koHelpers.resolveObservable( );
    // console.log("Load tiles: ", ids);
    
    // console.log("viewModel.player: ", viewModel.player);
    ko.applyBindings( viewModel );

    game.on('locationenter', function(evt){
      var centerTile = evt.target; 
      if(viewModel.tile.id === centerTile.id) {
        return;
      }

      var cx = centerTile.x, 
          cy = centerTile.y;

      console.log("UI: location enter: ", cx, cy);
      /////////////////////////////////////
      // Update the mini map for this tile

      var nearest9 = [centerTile].concat( region.getEdges(cx, cy) );
      region.loadTiles(nearest9).then(function( tiles ){
        minimap.startX = centerTile.x-1;
        minimap.startY = centerTile.y-1;
        minimap.render( tiles );
      });

      /////////////////////////////////////
      viewModel.tile(centerTile);

    });
    this._inited = true;
  };

  ui.flush = function(id){
    // $("#"+id).empty();
  };
  
  ui.main = function(cont){
     viewModel.messages.push(cont);
     setTimeout(function(){
        var msgs = $('#messages > ul > li.message');
        if(msgs.length) {
          msgs[msgs.length-1].scrollIntoView();
        }
     }, 0);
  };

  ui.status = function(cont){
    cont = cont || "";
    cont = cont.split('\n');
    ui.main('<p class="status">'+cont.join('<br>')+'</p>');
  };

  function tileAt(x, y){
    // resolve pixel coordinates to a region tile

  }

  function findPos(obj) {
    var curleft = curtop = 0;
    do {
      curleft += obj.offsetLeft;
      curtop += obj.offsetTop;
    } while (obj = obj.offsetParent);
    return { x: curleft, y: curtop };
  }
  
  function onTileClick(vm, evt){
    var map = ui.minimap;
    var pixelX = evt.pageX - $(evt.target).offset().left;
    var pixelY = evt.pageY - $(evt.target).offset().top;

    var tileSize = map.tileSize;

    // resolve click coordinates to a value from the map's 0,0
    // and get a region coordinate
    var x = Math.floor(pixelX / tileSize) + map.startX, 
        y = Math.floor(pixelY / tileSize) + map.startY;

    // console.log("click x: %s, y: %s, node offset x: %s, y: %s: ", evt.clientX, evt.clientY, mapOffsets.x, mapOffsets.y);
    // console.log("pixelX: %s, pixelY: %s", pixelX, pixelY, x, y);

    if(game.canMoveTo(x,y)) {
      // how to handle moving between regions? 
      var hash = '#'+game.locationToString(x,y);
      window.location.hash = hash;
    } else {
      console.log("Unable to move to: %s,%s", x, y);
    }
  }

  function onMessagesClick(vm, evt){
    $('#messages').toggleClass('collapsed');
  }

  return ui;

});

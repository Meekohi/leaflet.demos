(function () {
var m = L.map('mapID').setView([38.035, -78.495], 14);
var baseMaps = [
  "MapQuestOpen.OSM",
  // "Stamen.Watercolor",
	// "OpenStreetMap.Mapnik",
	// "OpenStreetMap.DE",
	// "Esri.WorldImagery"
];
var lc = L.control.layers.provided(baseMaps,{},{collapsed:false}).addTo(m);
m.addHash({lc:lc});
var data={}, layers={}, fills =[
  "rgb(255,0,0)",
	"rgb(83,142,252)",
	"rgb(213, 62, 79)",
	"rgb(84, 39, 136)",
	"rgb(247,64,247)",
	"rgb(244, 109, 67)",
	"rgb(184,225,134)",
	"rgb(127,188,65)",
	"rgb(69, 117, 180)"
];

var colorScale = d3.scale.quantize().domain([moment("July 2013").unix(), moment("May 2014").unix()]).range(colorbrewer.PuBu[9].slice(4));
d3.json("json/lort.json", dealwithData);

function dealwithData(oa){
  console.log(oa.features[0]);
	data.json= oa.features.map(function(v){
    return [v.geometry.coordinates[0],v.geometry.coordinates[1], v.properties.thumbnail, v.properties.created_time];
	});

  //centroids();
  points(0,1000);
  //removePoints(0,1000);
  //lc.addOverlay(layers.points,"Instagram");
  //veronoi();
  //delaunay();
  //clusters();
  //quadtree();
}

function points(index, chunkSize){
  //console.log(index,"of",data.json.length);
  var dataSlice = data.json.slice(index,index+chunkSize);
  if(dataSlice.length === 0) {
    // all done, start over!
    setTimeout(function(){points(0,chunkSize);},1);
    return;
  }
  var bounds = m.getBounds();
  dataSlice = _.filter(dataSlice,function(v){
    return bounds.contains(L.latLng(v[0],v[1]));
  });
  layers.points = L.layerGroup(dataSlice.map(function(v){
    var hasThumb = v[2] ? true : false;
    var c = L.circleMarker(L.latLng(v[0],v[1]),{
      radius:2,
      stroke:false,
      fillOpacity:0.4,
      clickable:hasThumb,
      color:colorScale(moment(v[3]).unix())
    });
    if(hasThumb)
      c.bindPopup("<img src='"+v[2]+"'/><br/><small>"+moment.unix(v[3]).format('MMM Do YYYY, h:mm a')+"</small>+<br/><small>"+v[0]+", "+v[1]+"</small>",{maxWidth:150,minWidth:150,maxHeight:150});
    return c;
	}));
  layers.points.addTo(m);
  setTimeout(function(){points(index+chunkSize,chunkSize);},1);
}
function centroids(){
  // Thingy to spam dots for every centroid
  dots = [];
  for(var lat = 0; lat < 90; lat += 0.089)
  {
    if(lat < 37) continue;
    if(lat > 40) continue;
    for(var lon = -180; lon < 180; lon += 0.089)
    {
      if(lon < -80) continue;
      if(lon > -74) continue;
      dots.push([lat,lon]);
    }
  }
  console.log(dots.length);
  var rects = L.layerGroup(dots.map(function(v){
    //var bounds = [[v[0]-0.089/2,v[1]-0.089*Math.cos(v[0] * Math.PI/180)/2],[v[0]+0.089/2,v[1]+0.089*Math.cos(v[0] * Math.PI/180)/2]];
    var bounds = [[v[0]-0.089/2,v[1]-0.089/2],[v[0]+0.089/2,v[1]+0.089/2]];
    var cc = L.rectangle(bounds,{
      weight:1,
      color:fills[2],
      clickable:true
    });
    cc.bindPopup(v[0].toFixed(3)+", "+v[1].toFixed(3));
    return cc;
  }));
  rects.addTo(m);
}
function delaunay(){
  data.delaunay = d3.geom.delaunay(data.json);
  layers.delaunay = L.layerGroup(data.delaunay.map(function(v){
		return L.polygon(v,{stroke:false,fillOpacity:0.7,color:fills[Math.floor((Math.random()*9))]});
	}));
	lc.addOverlay(layers.delaunay,"delaunay");
}
function clusters(){
  layers.clusters= new L.MarkerClusterGroup();
	layers.clusters.addLayers(data.json.map(function(v){
		return L.marker(L.latLng(v));
	}));
	lc.addOverlay(layers.clusters,"clusters");
}
function quadtree(){
  data.quadtree = d3.geom.quadtree(data.json.map(function(v){return {x:v[0],y:v[1]};}));
	layers.quadtree = L.layerGroup();
	data.quadtree.visit(function(quad, lat1, lng1, lat2, lng2){
		layers.quadtree.addLayer(L.rectangle([[lat1,lng1],[lat2,lng2]],{fillOpacity:0,weight:1,color:"#000",clickable:false}));
	});
	lc.addOverlay(layers.quadtree,"quadtree");
}

window.public = {};
window.public.data = data;
window.public.layers = layers;
}());
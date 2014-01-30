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
d3.json("json/flickr.json", dealwithData);

function dealwithData(oa){
	data.json= oa.features.map(function(v){
    return [v.geometry.coordinates[0],v.geometry.coordinates[1], v.properties.thumbnail];
	});
  points(0);
  //lc.addOverlay(layers.points,"Instagram");
  //veronoi();
  //delaunay();
  //clusters();
  //quadtree();
}

function points(index){
  layers.points = L.layerGroup(data.json.slice(index,index+1000).map(function(v){
    var c = L.circleMarker(L.latLng(v[0],v[1]),{radius:2,stroke:false,fillOpacity:0.4,clickable:true,color:fills[0]});
    c.bindPopup("<img src='"+v[2]+"'/>",{maxWidth:150,minWidth:150,maxHeight:150});
    return c;
	}));
  layers.points.addTo(m);
  setTimeout(function(){points(index+1000);},1);
}
function veronoi(){
  data.veronoi = d3.geom.voronoi(data.json);
  layers.veronoi = L.layerGroup(data.veronoi.map(function(v){
		return L.polygon(v,{stroke:false,fillOpacity:0.7,color:fills[Math.floor((Math.random()*9))]});
	}));
	lc.addOverlay(layers.veronoi,"veronoi");
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


// layers.svg=L.d3("json/ma.topo.json",{
// 	topojson:"TOWNS",
// 	svgClass : "Spectral",
// 	pathClass:function(d) {
// 		return "town q" + (10-layers.svg.quintile(d.properties.pop/layers.svg.path.area(d)))+"-11";
// 	},
// 	before: function(data){
// 		var _this = this;
// 		this.quintile=d3.scale.quantile().domain(data.geometries.map(function(d){return d.properties.pop/_this.path.area(d);})).range(d3.range(11));
// 	}
// });
// layers.svg.bindPopup(function(p){
// 	var out =[];
// 	for(var key in p){
// 	if(key !== "FOURCOLOR"){
// 		out.push("<strong>"+key+"</strong>: "+p[key]);
// 		}
// 	}
// 	return out.join("<br/>");
// 	});
// lc.addOverlay(layers.svg,"Population density");


window.public = {};
window.public.data = data;
window.public.layers = layers;
}());
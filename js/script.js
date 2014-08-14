var m = L.map('mapID').setView([38.035, -78.495], 14);
(function () {
var arqgram = L.tileLayer('http://localhost/~meekohi/instagramtiles/{z}/{x}/{y}.png',{zIndex:5}).addTo(m);
var arqstreet = L.tileLayer('http://localhost/~meekohi/streetviewtiles/{z}/{x}/{y}.png',{zIndex:4}).addTo(m);
//var arqgram2 = L.tileLayer('http://localhost/~meekohi/instagramtiles2/{z}/{x}/{y}.png',{zIndex:4}).addTo(m);
//var arqworld = L.tileLayer('https://{s}.tiles.mapbox.com/v3/mapbox.world-black/{z}/{x}/{y}.png',{zIndex:3}).addTo(m);

var baseMaps = [
  "MapQuestOpen.OSM",
  "Stamen.TonerLite"
  //"HERE.normalNightGrey"
  //"Stamen.Watercolor",
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
var svColorScale = d3.scale.quantize().domain([1403896539 , 1403898126]).range(colorbrewer.OrRd[9].slice(4));
d3.json("json/2014-07-31.sv.json", dealwithData);

function dealwithData(oa){
  console.log(oa.features[0]);
	data.json = oa.features.map(function(v){
    return [v.geometry.coordinates[0],v.geometry.coordinates[1], v.properties.thumbnail, v.properties.created_time, v.properties.pgid];
	});

  //centroids();
  //points(0,1000);
  //removePoints(0,1000);
  //lc.addOverlay(layers.points,"Instagram");
}

function points(index, chunkSize){
  //console.log(index,"of",data.json.length);
  var dataSlice = data.json.slice(index,index+chunkSize);
  if(dataSlice.length === 0) {
    // all done! start over?
    //setTimeout(function(){points(0,chunkSize);},1);
    //d3.json("json/cville.json", dealwithData);
    return;
  }
  var bounds = m.getBounds();
  dataSlice = _.filter(dataSlice,function(v){
    return bounds.contains(L.latLng(v[0],v[1]));
  });

  // !
  dataSlice = _.filter(dataSlice,function(v,i){
    return i%32 === 0;
  });

  var newLayer = dataSlice.map(function(v){
    var hasThumb = v[2] ? true : false;
    var c = L.circleMarker(L.latLng(v[0],v[1]),{
      radius:1,
      stroke:false,
      fillOpacity:0.4,
      clickable:hasThumb,
      color: v[2] ? colorScale(moment.unix(v[3]).unix()) : svColorScale(moment(v[3]).unix())
    });
    if(hasThumb)
      c.bindPopup("<img src='"+v[2]+"'/><br/><small>"+moment(v[3]).format('MMM Do YYYY, h:mm a')+"</small><br/><small>+"+v[0].toFixed(5)+", "+v[1].toFixed(5)+"</small><br/>"+v[4],{maxWidth:150,minWidth:150,maxHeight:150});
    return c;
  });
  layers.points = L.layerGroup(newLayer);
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

window.public = {};
window.public.data = data;
window.public.layers = layers;
}());
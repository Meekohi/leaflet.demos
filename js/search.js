var queryTimer = null;
var searchLayer = null;

m.on('click',function(e){
  console.log(e);
  $.ajax({
    url: "http://localhost:9200/geotagged/_search",
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify({
      size: 10000,
      "query" : {
        "match_all" : {}
      },
      "filter" : {
        "geo_distance" : {
          "distance" : "100m",
          "distance_type": "plane",
          "geo" : [e.latlng.lat,e.latlng.lng]
        }
      }
    }),
    success: function(data, textStatus){
      console.log(data);
      points = data.hits.hits.map(function(v){
        var gram = v._source;
        var c = L.circleMarker(L.latLng(gram.location.latitude, gram.location.longitude),{
          radius:3,
          stroke:true,
          fillOpacity:1.0,
          clickable:true,
          fillColor: "rgb(240, 240, 200)",
          color: "rgb(0, 0, 0)",
          zIndexOffset: 10
        });
        c.bindPopup("<a href='"+gram.link+"'><img src='"+gram.images.thumbnail.url+"'/></a><br/><small>"+gram.user.full_name+" ("+gram.user.username+")</small>",{maxWidth:150,minWidth:150,maxHeight:800});
        return c;
      });
      searchLayer = L.layerGroup(points);
      m.addLayer(searchLayer);
    }
  });
});

$("#search").keypress(function(){
  console.log("keypress");
  clearTimeout(queryTimer);
  queryTimer = setTimeout(function(){
    console.log("querytime");
    $.get("http://localhost:9200/geotagged/_search?q="+$("#search").val(),
      {
        size: 10000
      }, function(data,textStatus){
      console.log("===",textStatus,"===");
      console.log(data);

      if(searchLayer) {
        m.removeLayer(searchLayer);
        searchLayer = null;
      }

      points = data.hits.hits.map(function(v){
        var gram = v._source;
        var c = L.circleMarker(L.latLng(gram.location.latitude, gram.location.longitude),{
          radius:3,
          stroke:true,
          fillOpacity:1.0,
          clickable:true,
          fillColor: "rgb(240, 240, 200)",
          color: "rgb(0, 0, 0)",
          zIndexOffset: 10
        });
        c.bindPopup("<a href='"+gram.link+"'><img src='"+gram.images.thumbnail.url+"'/></a><br/><small>"+gram.user.full_name+" ("+gram.user.username+")</small>",{maxWidth:150,minWidth:150,maxHeight:800});
        return c;
      });
      searchLayer = L.layerGroup(points);
      m.addLayer(searchLayer);
    });
  },500);
});
var queryTimer = null;
var searchLayer = null;

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
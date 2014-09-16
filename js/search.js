var queryTimer = null;
var searchLayer = null;


var searchResultsTemplate = $("#searchResults").html();
Mustache.parse(searchResultsTemplate);
$("#searchResults").empty();

function sidebarHighlight(id){
  sidebarUnhighlight();
  $("#"+id+"_row").addClass('active');
  $("#"+id+"_circle").css({
    "fill":"rgb(200, 240, 200)",
    "stroke-width":"10",
    "stroke-opacity":"1.0"
  });

  // BRING TO FRONT
  $("#"+id+"_circle").parent().insertAfter( $("g").last() );
}
function sidebarUnhighlight(){
  $("#searchResults li").removeClass('active');
  $(".gram_circle").css({
    'fill':'',
    'stroke-width':'',
    'stroke-opacity':''
  });
}
$("#searchResults").on("mouseover","li",function(e){
  var gram_id = $(this).attr("id").split("_").slice(0,-1).join("_");
  sidebarHighlight(gram_id);
});


function addGramsToMap(grams){

  //cleanup
  if(searchLayer) {
    m.removeLayer(searchLayer);
    searchLayer = null;
  }
  $("#searchResults").empty();

  points = grams.map(function(v){
    var gram = v._source;

    //sidebar
    gram.created_time = moment.unix(gram.created_time).fromNow();
    var html = Mustache.render(searchResultsTemplate, gram);
    $("#searchResults").append(html);

    //map
    var c = L.circleMarker(L.latLng(gram.location.latitude, gram.location.longitude),{
      radius:3,
      stroke:true,
      fillOpacity:1.0,
      clickable:true,
      fillColor: "rgb(240, 240, 200)",
      color: "rgb(0, 0, 0)",
      zIndexOffset: 10
    });
    c.on('add',function(e){
      $(this._container.childNodes[0]).attr("class","leaflet-clickable gram_circle");
      $(this._container.childNodes[0]).attr("id",gram.id+"_circle");
    });
    c.on('mouseover',function(e){
      sidebarHighlight(gram.id);
      $("#"+gram.id+"_row").animatescroll({element:".searchResultsContainer"});
    });
    c.on('mouseout',function(e){
      sidebarUnhighlight();
    });
    //c.bindPopup("<a href='"+gram.link+"'><img src='"+gram.images.thumbnail.url+"'/></a><br/><small>"+gram.user.full_name+" ("+gram.user.username+")</small>",{maxWidth:150,minWidth:150,maxHeight:800});
    return c;
  });

  searchLayer = L.layerGroup(points);
  m.addLayer(searchLayer);
}

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
      },
      // "sort" : [
      //   {
      //     "created_time": "desc"
      //   }
      // ]
    }),
    success: function(data, textStatus){
      addGramsToMap(data.hits.hits);
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
      }, function(data,textStatus) {
        addGramsToMap(data.hits.hits);
      }
    );
  },500);
});
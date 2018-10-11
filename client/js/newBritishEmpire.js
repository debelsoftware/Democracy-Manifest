const apiurl = "http://localhost:8080"
window.addEventListener('load', populateCards("/top3","top3CardHolder"))

function populateCards(endpoint,holderId){
  let request = new XMLHttpRequest();
  request.onreadystatechange = function() {
      if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        let data = JSON.parse(this.responseText).data;
        let holder = document.getElementById(holderId);
        for (let country in data){
          holder.innerHTML += "<div class='card'><img src='flags/"+data[country]['code']+".png'><h3>"+data[country]['name']+"</h3><p><button onclick='sendChange(`"+data[country]['code']+"`,`/post/population`,`0`)'class='leftB'>-</button>Population: "+data[country]['population']+"<button onclick='sendChange(`"+data[country]['code']+"`,`/post/population`,`1`)'class='rightB'>+</button></p><p><button onclick='sendChange(`"+data[country]['code']+"`,`/post/wealth`,`0`)'class='leftB'>-</button>Wealth: "+data[country]['wealth']+" (Global Currency)<button onclick='sendChange(`"+data[country]['code']+"`,`/post/wealth`,`1`)'class='rightB'>+</button></p></div>"
        }
      }
  };
  request.open("GET", apiurl+endpoint, true);
  request.send();
}

function getCard(country){
  let request = new XMLHttpRequest();
  request.onreadystatechange = function() {
      if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        let data = JSON.parse(this.responseText).data;
        let holder = document.getElementById('singleStatCard');
        holder.innerHTML = "<div class='card'><img src='flags/"+data[0]['code']+".png'><h3>"+data[0]['name']+"</h3><p><button onclick='sendChange(`"+data[0]['code']+"`,`/post/population`,`0`)'class='leftB'>-</button>Population: "+data[0]['population']+"<button onclick='sendChange(`"+data[0]['code']+"`,`/post/population`,`1`)'class='rightB'>+</button></p><p><button onclick='sendChange(`"+data[0]['code']+"`,`/post/wealth`,`0`)'class='leftB'>-</button>Wealth: "+data[0]['wealth']+" (Global Currency)<button onclick='sendChange(`"+data[0]['code']+"`,`/post/wealth`,`1`)'class='rightB'>+</button></p></div>"
      }
  };
  request.open("POST", apiurl+"/singledata", true);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify({"country": country}));
}

function sendChange(country,change,modifier){
  let request = new XMLHttpRequest();
  request.onreadystatechange = function() {
      if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        getCard(country);
      }
  };
  request.open("POST", apiurl+change, true);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify({"country": country,"modifier":modifier}));
}

//MAP API code
jQuery('#vmap').vectorMap({
    map: 'world_en',
    backgroundColor: '#00000000',
    borderColor: '#ffffff',
    borderWidth: 2,
    color: '#4ecdc4',
    hoverOpacity: 0.7,
    selectedColor: '#1a535c',
    enableZoom: false,
    showTooltip: false,
    scaleColors: ['#C8EEFF', '#006491'],
    normalizeFunction: 'polynomial',
    onRegionClick: function(element, code, region){getCard(code);}
});

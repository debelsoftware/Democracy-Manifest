const apiurl = "http://localhost:8080"
window.addEventListener('load', startup())

let currentCardPop = 0;

function startup(){
  let request = new XMLHttpRequest();
  let holder = document.getElementById('singleStatCard');
  request.onreadystatechange = function() {
      if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        holder.innerHTML = "<div class='card'><h3>Select a country to edit</h3></div>";
        populateCards("/top20","top20CardHolder");
      }
      else if (this.readyState == XMLHttpRequest.DONE && this.status != 200) {
        holder.innerHTML = "<div class='card'><h3>Sorry. Our server has died. RIP</h3></div>";
      }
  };
  request.open("GET", apiurl+"/status", true);
  request.send();
}

function populateCards(endpoint,holderId){
  let request = new XMLHttpRequest();
  request.onreadystatechange = function() {
      if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        let data = JSON.parse(this.responseText).data;
        let holder = document.getElementById(holderId);
        holder.innerHTML = "";
        for (let country in data){
          holder.innerHTML += "<div class='card'><img src='../flags/"+data[country]['code']+".png'><h3>"+data[country]['name']+"</h3><p>Population: "+data[country]['population']+"</p><p>Wealth: "+data[country]['wealth']+" (Global Currency)</p></div>"
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
        currentCardPop = parseInt(data[0]['population']);
        holder.innerHTML = "<div class='card'><img src='../flags/"+data[0]['code']+".png'><h3>"+data[0]['name']+"</h3><p><button onclick='sendChange(`"+data[0]['code']+"`,`/post/population`,`0`)'class='leftB'>-</button>Population: "+data[0]['population']+"<button onclick='sendChange(`"+data[0]['code']+"`,`/post/population`,`1`)'class='rightB'>+</button></p><p><button onclick='sendChange(`"+data[0]['code']+"`,`/post/wealth`,`0`)'class='leftB'>-</button>Wealth: "+data[0]['wealth']+" (Global Currency)<button onclick='sendChange(`"+data[0]['code']+"`,`/post/wealth`,`1`)'class='rightB'>+</button></p></div>"
      }
  };
  request.open("POST", apiurl+"/singledata", true);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(JSON.stringify({"country": country}));
}

function sendChange(country,change,modifier){
  if (change == "/post/population" && currentCardPop == 0 && modifier == 0){
    alert("Population can't be set less than 0");
  }
  else {
    let request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
          let data = JSON.parse(this.responseText);
          if (data['status'] == "fail"){
            alert(data['data']);
          }
          else {
            getCard(country);
          }
        }
        else if (this.readyState == XMLHttpRequest.DONE && this.status == 429) {
          alert("You have already used your hourly vote. You can try again after an hour.")
        }
    };
    request.open("POST", apiurl+change, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify({"country": country,"modifier":modifier}));
  }
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
    enableZoom: true,
    showTooltip: false,
    scaleColors: ['#C8EEFF', '#006491'],
    normalizeFunction: 'polynomial',
    onRegionClick: function(element, code, region){getCard(code);}
});

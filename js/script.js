var map = L.map('map')
var tiles;
var title = [];
const baseUrl = "https://terraq.com.br/api/"

// recuperar dados iniciais
$.getJSON(baseUrl+"teste-leaflet/visao-inicial", function(data) {}).done(
    function(data) {
        let {lat, lng} = data.initial_view.center
        // o zoom que está vindo é 12 e não engloba todos os pontos
        //let {zoom} = data.initial_view
        title = data.tile_layers
        map.setView([lat, lng], 8);
       // map.tileLayer(title[1].url, title[1].maxZoom)
        L.tileLayer(title[0].url, {maxZoom: title[0].maxZoom}).addTo(map);
    }		
);



function onEachFeature(feature, layer) {
    var popupContent = '<p>' + feature.geometry.type + '</p>';
    if (feature.properties && feature.properties.popupContent) {
        popupContent += "<br>"+feature.properties.popupContent;
        popupContent += "<br> <strong>Precipitacao: </strong>"+feature.properties.precipitacao;
        popupContent += "<br> <strong>Temperatura: </strong>"+feature.properties.temperatura;
        popupContent += "<br> <strong>Umidade: </strong>"+feature.properties.umidade;
        popupContent += "<br> <strong>Vento: </strong>"+feature.properties.vento;
        popupContent += "<br> <strong>Visibilidade: </strong>"+feature.properties.visibilidade;
        popupContent += "<br> <strong>Histórico: </strong>"+ `<a href="${feature.properties.historico_ponto}" target="_blank">Acessar histórico</a>`;
        popupContent += "<br> <strong>Dados: </strong>"+ `<button class="btn" onclick={verDados(${feature.properties.id})}>Dados do ponto</button>`
        
    }
    layer.bindPopup(popupContent);
}

$.getJSON(baseUrl+"teste-leaflet/pontos", function(data) {}).done(
    function(data) {
       console.log(data[1])
        var featureCollection = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                var iconUrl = feature.properties.icon;
                var preciptacao = feature.properties.precipitacao
                var featureIcon = L.icon({
                    iconUrl: iconUrl,
                    iconSize: [32, 37],
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -28],
                });
              

                return L.marker(latlng, {icon: featureIcon});
            },
            onEachFeature: onEachFeature
        }).addTo(map);
    }		
);

$.getJSON(baseUrl+"teste-leaflet/user", function(data) {}).done(
    function(data) {
        const {avatar} = data;
        let perfil = document.getElementById("avatar")
        perfil.src = avatar;
        let arrayKeys = Object.keys(data);
        
        // aribuir os vlaores do usuário aos campos
        for(let i in arrayKeys){
            if(arrayKeys[i] !== "id" && arrayKeys[i] !== "avatar"){
               let valorTemp = document.getElementById(arrayKeys[i]);
               valorTemp.innerHTML = data[arrayKeys[i]]
            }
        }
       
    }		
);


// alterar tipo de mapa
function updateMapa (){
    let select = document.getElementById("tipo_de_mapa")
    var value =  !select.options[select.selectedIndex].value ? 0 : select.options[select.selectedIndex].value;
    L.tileLayer(title[value].url, {maxZoom: title[value].maxZoom}).addTo(map);
}



function verDados(id){
    function filter(value){
        if(value !== 'data' ){
            return value;
        }
    }

    let modal = document.querySelector('.modal')
    modal.style.display = 'block';
    $.getJSON(baseUrl+`teste-leaflet/ponto/${id}`, function(data) {}).done(
        function(data) {
            var dias = data.length
            console.log(dias)
            // chats
            google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback(drawChart);
      var d = Object.keys(data[0]).filter(filter)
      
      var dados = [['Média de dados', 'Ponto x']];
      var dado = 0;
      
      for(let i in d){
        for(let a in data){
          dado = dado + data[a][d[i]]
        }
        let valor = dado/data.lenght
        dados.push([d[i], dado])
      }

      function drawChart() {

        var data = google.visualization.arrayToDataTable(dados);

        var options = {
          title: `Média dos dados do ponto: ${id} nos ultimos ${dias} dias`
        };

        var chart = new google.visualization.PieChart(document.getElementById('piechart'));

        chart.draw(data, options);
      }
        }		
    );
}

// fechar modal 

function fechar(){
    let modal = document.querySelector('.modal')
    modal.style.display = 'none';
}

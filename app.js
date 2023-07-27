// center of the map
var center = [40.712, -74.006];

// Create the map
var map = L.map('map-view').setView(center, 10);

// Set up the OSM layer
L.tileLayer(
  'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18
  }).addTo(map);

function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

function addMarkers(restaurants) {
    
    restaurants.forEach(elem => {
        var popupContent = `<b>${elem.dba}</b><input class='btn btn-secondary btn-sm ml-4' id='view' type='submit' value='View' onclick='showViolations(${elem.camis})'>`;
        console.log(popupContent);
        L.marker([elem.latitude, elem.longitude]).addTo(map).bindPopup(popupContent);
    })
}

function fillRestaurantsTable(restaurants) {
    const tableData = restaurants.map(elem => {
      return (
        `<tr>
           <td>${elem.dba}</td>
           <td>${elem.building} ${elem.street}, ${elem.boro} ${elem.zipcode}</td>
           <td><input class='btn btn-secondary btn-sm ml-4' id='view' type='submit' value='View' onclick='showViolations(${elem.camis})'></td>
        </tr>`
      );
    }).join('');
    const tableBody = document.querySelector("#restaurants-table-body");
    tableBody.innerHTML = tableData;
}

function showViolations(camis) {
    console.log(camis)
    var url = "https://data.cityofnewyork.us/resource/43nn-pn8j.json?$$app_token=0SuJbkbKpuUkMK0Ro5uzQbEV0&$where=camis like '"+camis+"'"
    console.log(url)
    httpGetAsync(url, responseText => {
        var arr = JSON.parse(responseText)
        console.log(arr)
        arr.sort((a, b) => a.inspection_date < b.inspection_date)
        const tableData = arr.map(elem => {
          return (
            `<tr>
               <td class="nowrap">${elem.inspection_date.slice(0, 10)}</td>
               <td>${elem.violation_description}</td>
            </tr>`
          );
        }).join('');

        const tableBody = document.querySelector("#tableBody");
        tableBody.innerHTML = tableData;
        document.getElementById("restaurant-name").innerHTML = `<h2>${arr[0].dba}</h2>`
        document.getElementById("restaurant-name").classList.remove('d-none');
        document.getElementById("violations").classList.remove('d-none');
    });
}


document.getElementById("submit").addEventListener("click", function(){
    var buildingNumber = document.getElementById("building_number");
    console.log(buildingNumber.value);
    var url = "https://data.cityofnewyork.us/resource/43nn-pn8j.json?$where=building like '"+buildingNumber.value+"'"
    console.log(url)
    httpGetAsync(url, (res) => {
        var arr = JSON.parse(res);
        var map = new Map();
        arr.forEach(elem => {
            if (!map.has(elem.camis) && elem.inspection_date.slice(0,10)!='1900-01-01') {
                map.set(elem.camis, elem)
                console.log(elem)
            }
        });
        let restaurants = Array.from(map.values());
        console.log(restaurants)
        addMarkers(restaurants)
        fillRestaurantsTable(restaurants)
    });
}, false)

document.getElementById("toggle-map-view").addEventListener("click", () => {
    document.getElementById("map-view").classList.remove('d-none');
    document.getElementById("list-view").classList.add('d-none');
})

document.getElementById("toggle-list-view").addEventListener("click", () => {
    document.getElementById("map-view").classList.add('d-none');
    document.getElementById("list-view").classList.remove('d-none');
})

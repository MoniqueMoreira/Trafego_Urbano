let map;
const IC = { lat: -9.553193248846418, lng: -35.77682199842664 };

function createCenterControl(map, trafficLayer, legendDiv) {
    const controlButton = document.createElement("button");

    controlButton.style.backgroundColor = "#fff";
    controlButton.style.border = "2px solid #fff";
    controlButton.style.borderRadius = "3px";
    controlButton.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
    controlButton.style.color = "rgb(25,25,25)";
    controlButton.style.cursor = "pointer";
    controlButton.style.fontFamily = "Roboto,Arial,sans-serif";
    controlButton.style.fontSize = "16px";
    controlButton.style.lineHeight = "38px";
    controlButton.style.margin = "8px 0 22px";
    controlButton.style.padding = "0 5px";
    controlButton.style.textAlign = "center";
    controlButton.textContent = "Camada de Trânsito";
    controlButton.title = "Camada de Trânsito";
    controlButton.type = "button";

    controlButton.addEventListener("click", () => {
        if (trafficLayer.getMap() === null) {
            trafficLayer.setMap(map);
            controlButton.textContent = "Remover Camada de Trânsito";
            legendDiv.style.display = "block";
        } else {
            trafficLayer.setMap(null);
            controlButton.textContent = "Adicionar Camada de Trânsito";
            legendDiv.style.display = "none";
        }
    });

    const legendStyles = `
        background-color: #2ecc71; width: 25px; height: 25px; display: inline-block; margin: 5;
    `;
    
    legendDiv.innerHTML = `
        <div style="${legendStyles}"></div> Trânsito Livre<br>
        <div style="${legendStyles.replace('#2ecc71', '#f39c12')}"></div> Trânsito Moderado<br>
        <div style="${legendStyles.replace('#2ecc71', '#e74c3c')}"></div> Trânsito Congestionado<br>
    `;
    legendDiv.style.display = "none";

    const centerControlDiv = document.createElement("div");
    centerControlDiv.appendChild(controlButton);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(legendDiv); 
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 17,
        center: IC,
    });

    const trafficLayer = new google.maps.TrafficLayer();
    const legendDiv = document.createElement("div");

    createCenterControl(map, trafficLayer, legendDiv);

    trafficLayer.setMap(map);

    // Adicione o componente de pesquisa
    const input = document.getElementById("searchInput");
    const searchBox = new google.maps.places.SearchBox(input);

    map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
    });

    let markers = [];

    searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();

        if (places.length === 0) {
            return;
        }

        markers.forEach((marker) => {
            marker.setMap(null);
        });
        markers = [];

        const bounds = new google.maps.LatLngBounds();

        places.forEach((place) => {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }

            markers.push(
                new google.maps.Marker({
                    map,
                    title: place.name,
                    position: place.geometry.location,
                })
            );

            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });

        map.fitBounds(bounds);
    });
}

window.initMap = initMap;
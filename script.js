let apiToken = '';

//Genero fecha del dia siguiente
const date = new Date();
date.setDate(date.getDate() + 1);

//Peticion de Token nuevo para empezar la busqueda
var myHeaders = new Headers();
myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

var urlencoded = new URLSearchParams();
urlencoded.append('grant_type', 'client_credentials');
urlencoded.append('client_id', 'LjGfA0NiwMGAJ1lsKAZVzeN5Y1GAp5Gv');
urlencoded.append('client_secret', '21H2UQkCGgS9dZBJ');

var requestOptions = {
	method: 'POST',
	headers: myHeaders,
	body: urlencoded,
	redirect: 'follow',
};

fetch('https://test.api.amadeus.com/v1/security/oauth2/token', requestOptions)
	.then((response) => response.json())
	.then((result) => {
		//veo y guardo token en apiToken
		console.log(result);
		apiToken = result.access_token;
		console.log(apiToken);
	})
	.catch((error) => console.log('error', error));

//Funcion que voy a llamar para hacer la busqueda con 3 parametros Token generado, lugar de origen y destino
function flightSearch() {
	console.log(apiToken);

	const origin = document.getElementById('origin').value;
	console.log(origin);

	const destination = document.getElementById('destination').value;
	console.log(destination);

	const departureDate = `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`;
	console.log(departureDate);

	var myHeaders = new Headers();
	myHeaders.append('Authorization', `Bearer ${apiToken}`);

	var requestOptions = {
		method: 'GET',
		headers: myHeaders,
		redirect: 'follow',
	};

	fetch(
		`https://test.api.amadeus.com/v1/shopping/flight-dates?origin=${origin}&destination=${destination}&departureDate=2022-04-29&oneWay=true`,
		requestOptions
	)
		.then((response) => response.json())
		.then((result) => {
			console.log(result);
			document.getElementById('originResult').innerHTML = origin;
			document.getElementById('destinationResult').innerHTML = destination;
			document.getElementById('priceResult').innerHTML =
				result.data[0].price.total;
		})
		.catch((error) => console.log('error', error));
}

//Auto complete del formulario
function initialize() {
	var input = document.getElementById('origin');
	new google.maps.places.Autocomplete(input).setTypes(['airport']);
	var input2 = document.getElementById('destination');
	new google.maps.places.Autocomplete(input2).setTypes(['airport']);
}

google.maps.event.addDomListener(window, 'load', initialize);

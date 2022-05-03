let apiToken = '';
var optionsOrigin = {
	url: '/airports.json',

	getValue: function (item) {
		return item.City + ' - ' + item.IATA;
	},
	list: {
		match: {
			enabled: true,
		},
		onSelectItemEvent: function () {
			var value = $('#origin').getSelectedItemData().IATA; //get the id associated with the selected value
			console.log(value);
			$('#originIATA').val(value).trigger('change'); //copy it to the hidden field
		},
	},
	template: {
		type: 'custom',
		method: function (value, item) {
			return item.Airport + ' | ' + item.IATA;
		},
	},
};
var optionsDestination = {
	url: '/airports.json',

	getValue: function (item) {
		return item.City + ' - ' + item.IATA;
	},
	list: {
		match: {
			enabled: true,
		},
		onSelectItemEvent: function () {
			var value = $('#destination').getSelectedItemData().IATA; //get the id associated with the selected value
			console.log(value);
			$('#destinationIATA').val(value).trigger('change'); //copy it to the hidden field
		},
	},
	template: {
		type: 'custom',
		method: function (value, item) {
			return item.Airport + ' | ' + item.IATA;
		},
	},
};

//Genero fecha del dia siguiente
const date = new Date();
date.setDate(date.getDate() + 1);
console.log(date);

// Formato de peticion de fecha
function formatDate(date) {
	const year = date.getFullYear();
	let month = (date.getMonth() + 1).toString().padStart(2, '0');
	let day = date.getDate().toString().padStart(2, '0');
	return `${year}-${month}-${day}`;
}

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
	const originIATA = document.getElementById('origin').value;
	const destinationIATA = document.getElementById('destination').value;
	let origin = document.getElementById('originIATA').value;
	let destination = document.getElementById('destinationIATA').value;
	const departureDate = formatDate(date);

	if (
		/^([A-Za-z]{3})$/g.test(originIATA) &&
		/^([A-Za-z]{3})$/g.test(destinationIATA)
	) {
		origin = originIATA.toUpperCase();
		destination = destinationIATA.toUpperCase();
	}

	if (!originIATA || !destinationIATA) {
		return alert('Please use a valid City or IATA.');
		location.reload();
	}

	// location.replace('/resultados.html');
	var myHeaders = new Headers();
	myHeaders.append('Authorization', `Bearer ${apiToken}`);

	var requestOptions = {
		method: 'GET',
		headers: myHeaders,
		redirect: 'follow',
	};

	fetch(
		`https://test.api.amadeus.com/v1/shopping/flight-dates?origin=${origin}&destination=${destination}&departureDate=${departureDate}&oneWay=true`,
		requestOptions
	)
		.then((response) => response.json())
		.then((result) => {
			console.log(result);
			if (result.errors != null) {
				switch (result.errors[0].detail) {
					case 'City/Airport must be a 3-character IATA code (https://en.wikipedia.org/wiki/International_Air_Transport_Association_airport_code).':
						alert('Your input must be a valid city or IATA code.');
						location.reload();
						break;
					case 'ORIGIN AND DESTINATION NOT SUPPORTED':
						alert('The are no flight for tomorrow for this destination.');
						location.reload();
						break;
					default:
						alert('Error in someplace i dont know. Maybe the API is failing');
						location.reload();
				}
			}
			localStorage.setItem('originFlight', origin);
			localStorage.setItem('destinationFlight', destination);
			localStorage.setItem('departureDate', departureDate);
			localStorage.setItem('priceResult', result.data[0].price.total);
			location.replace('resultados.html');
		})
		.catch((error) => {
			console.log('error', error);
		});
}

//AUTOCOMPLETE

$('#origin').easyAutocomplete(optionsOrigin);
$('#destination').easyAutocomplete(optionsDestination);

$('#searchForm').on('submit', function (e) {
	e.preventDefault();
	console.log($(this).serialize());
});

let formulario = document.getElementById('formulario');

formulario.addEventListener('submit', async(event) => {
    event.preventDefault();
    let inputEmail = document.getElementById('email').value;
    let inputPass = document.getElementById('password').value;
    let JWT = await postInfo(inputEmail, inputPass);
    console.log('token: ', JWT)

    // Ocultar formulario 
    toggleFormAndTable('formulario', 'info');

    let datos = await getInfo(JWT);
    crearTabla(datos);
    let filtrados = datos.filter(rangoSelecc);
    // Crear gráfico
    crearGrafico(filtrados);
});

// Selección de elemntos a graficar
function rangoSelecc(elem) {
    return elem.active >= 100000;
}

// Valida usuario y contraseña desde API. En caso de ser exitoso genera token
const postInfo = async(email, password) => {
    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            body: JSON.stringify({ email: email, password: password })
        })
        const { token } = await response.json()
        localStorage.setItem('jwt-token', token);
        return token
    } catch (err) {
        console.error(`Error: ${err} `)
    }
}

// Con token ingresa a la API y recupera los registros del usuario validado
const getInfo = async(jwt) => {
    try {
        const response = await fetch(`http://localhost:3000/api/total`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${jwt} `
            }
        })
        const { data } = await response.json()
        return data
    } catch (err) {
        console.error(`Error: ${err} `)
    }
}

const getInfoCountry = async(country) => {
    let jwt = localStorage.getItem('jwt-token')
    try {
        const response = await fetch(`http://localhost:3000/api/countries/${country}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${jwt} `
            }
        })
        const { data } = await response.json()
        console.log(data)
        return data
    } catch (err) {
        console.error(`Error: ${err} `)
    }
}

// Creación de tabla
const crearTabla = (data) => {
    const tabla = document.getElementById('tabla');
    // Crea títulos de la tabla
    tabla.innerHTML += `
    <thead class="thead-light">
    <tr>
    <th scope="col" class="text-left">País</th>
    <th scope="col" class="text-right">Confirmados</th>
    <th scope="col" class="text-right">Fallecidos</th>
    <th scope="col" class="text-right">Activos</th>
    <th scope="col" class="text-right">Recuperados</th>
    <th scope="col" class="text-center">Ver</th>
  </tr>
  </thead>
    `
        // crear body de tabla
    let bodyTabla = document.createElement('tbody')
    tabla.appendChild(bodyTabla);
    bodyTabla.setAttribute('id', 'filas');
    const filas = document.getElementById('filas');
    // Crea las filas
    data.forEach(item => {
        filas.innerHTML += `
        <tr>
            <th scope="row">${item.location}</th>
            <td class="text-right">${item.confirmed}</td>
            <td class="text-right">${item.deaths}</td>
            <td class="text-right">${item.active}</td>
            <td class="text-right">${item.recovered}</td>
            <td class="text-right"><a id="modalBtn" data-toggle="modal" data-target="#chartModal" onclick="mostrar_modal('${item.location}')"><button>Detalle</button></a></td>
        </tr>
       `
    })
}

const mostrar_modal = async(item) => {
    let infoCountry = await getInfoCountry(item);
    // console.log(infoCountry)
    // console.log(infoCountry.confirmed)
    // console.log(infoCountry.deaths)
    // console.log(infoCountry.active)
    // console.log(infoCountry.recovered)
    var chart = new CanvasJS.Chart("chartContainerModal", {
        theme: "light2", // "light1", "light2", "dark1", "dark2"
        exportEnabled: true,
        animationEnabled: true,
        title: {
            text: 'Covid19 en ' + item,
            fontfamily: 'monospace'
        },
        data: [{
            type: "pie",
            startAngle: 25,
            toolTipContent: "<b>{label}</b>: {y}%",
            showInLegend: "true",
            legendText: "{label}",
            indexLabelFontSize: 12,
            indexLabel: "{label} - {y}%",
            dataPoints: [
                { y: infoCountry.confirmed, label: "Confirmados", indexLabelFontStyle: 'monospace' },
                { y: infoCountry.deaths, label: "Fallecidos", indexLabelFontStyle: 'monospace' },
                { y: infoCountry.active, label: "Activos", indexLabelFontStyle: 'monospace' },
                { y: infoCountry.recovered, label: "Recuperados", indexLabelFontStyle: 'monospace' },
            ]
        }]
    });
    chart.render();

    $('#chartModal').on('shown.bs.modal', function() {
        chart.render();
    });
}


// Funcion que crea el gráfico al final de la página
let crearGrafico = (filtrados) => {
    let totalElem = filtrados.length;

    // Armar arreglo de objetos dataPoints para gráfico
    let dataPoints1 = [];
    let dataPoints2 = [];
    let dataPoints3 = [];
    let dataPoints4 = [];
    // Armar arreglo de objetos dataPoints para gráfico
    for (let i = 0; i < totalElem; i++) {
        let pais = filtrados[i].location;
        let confirmados = filtrados[i].confirmed;
        let fallecidos = filtrados[i].deaths;
        let activos = filtrados[i].active;
        let recuperados = filtrados[i].recovered;
        let punto1 = { 'label': pais, 'y': confirmados, indexLabelFontStyle: 'monospace' };
        let punto2 = { 'label': pais, 'y': fallecidos, indexLabelFontStyle: 'monospace' };
        let punto3 = { 'label': pais, 'y': activos, indexLabelFontStyle: 'monospace' };
        let punto4 = { 'label': pais, 'y': recuperados, indexLabelFontStyle: 'monospace' };
        dataPoints1.push(punto1);
        dataPoints2.push(punto2);
        dataPoints3.push(punto3);
        dataPoints4.push(punto4);
    }
    var chart = new CanvasJS.Chart("chartContainer", {
        title: {
            text: "Países con Covid19",
            fontSize: 30
        },
        legend: {
            fontSize: 15,
        },
        axisX: {
            labelFontFamily: 'monospace',
            labelFontSize: 10,
            labelAutoFit: true,
            labelAngle: -45,
            interval: 1
        },
        axisY: {
            labelFontFamily: 'monospace',
            labelFontSize: 10,
            scaleBreaks: {
                autoCalculate: true
            }
        },
        data: [{
                type: "column",
                showInLegend: true,
                name: "Confirmados",
                legendText: "Confirmados",
                dataPoints: dataPoints1
            },
            {
                type: "column",
                showInLegend: true,
                name: "Fallecidos",
                legendText: "Fallecidos",
                dataPoints: dataPoints2
            },
            {
                type: "column",
                showInLegend: true,
                name: "Activos",
                legendText: "Activos",
                dataPoints: dataPoints3
            },
            {
                type: "column",
                showInLegend: true,
                name: "Recuperados",
                legendText: "Recuperados",
                dataPoints: dataPoints4
            }
        ]
    });

    chart.render();

    // Función que genera leyendas del gráfico
    function toggleDataSeries(e) {
        if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else {
            e.dataSeries.visible = true;
        }
        chart.render();
    }

}

// Comprobacion token al iniciar
const inicio = async() => {
    const token = localStorage.getItem('jwt-token');
    if (token) {
        let info = await getInfo(token); // Trae información
    }
}

// Intercambiar aparicion de elementos

const toggleFormAndTable = (form, table) => {
    $(`#${form}`).toggle()
    $(`#${table}`).toggle()
}

// Llamada luego de npm run watch es en el navegador poner la siguiente url http://localhost:3000/covid19
inicio()
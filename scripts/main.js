const DateTime = luxon.DateTime;

const colors = ['negro', 'marron', 'rojo', 'naranja', 'amarillo', 'verde', 'azul', 'violeta', 'gris', 'blanco'];
const maxHistory = 5;
let historyReg = JSON.parse(localStorage.getItem('historyEST')) || [];

// Funcion Calculadora
// recibe String con colores.
function calculoResistencia(bandas) {
    let { b1, b2, mult } = bandas;
    let digito1 = colorToNumber(b1);
    let digito2 = colorToNumber(b2);
    let multiplier = colorToMultiplier(mult);

    return ((digito1 * 10) + digito2) * multiplier;
}

// Funcion auxiliar
// Tranforma colores a numeros
function colorToNumber(color) {
    return colors.indexOf(color.toLowerCase());
}

// Tranforma colores a multiplicadores
function colorToMultiplier(color) {
    return 10 ** colorToNumber(color);
} 

// Guardo los ultimos 10 valores calculados
function saveHistory(bandas) {
    let data = {
        date: DateTime.now().toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS),
        bandas: bandas,
        resultado: calculoResistencia(bandas)
    };

    // Agrego un elemento
    historyReg.unshift(data);

    // Elimino un elemento si paso el maximo
    historyReg.length > maxHistory && historyReg.pop();

    // Guardo el historial
    localStorage.setItem("historyEST", JSON.stringify(historyReg));

    return data;
}

// Borra el historial del HTML y del LocalStorage
function clearHistory() {
    historyReg = [];
    localStorage.removeItem("historyEST");
    clearHTMLTable();
}

// Funcion que crea la tabla HTML
function createTableHtml() {
    let tablaHtml = `
    <tr>
    <th>Date</th>
    <th>1ra Banda</th>
    <th>2da Banda</th>
    <th>Multiplicador</th>
    <th>Resultado [ohm]</th>
    </tr>`;

    historyReg.forEach((item) => {
        tablaHtml += `
        <tr>
        <td>${item.date}</td>
        <td>${item.bandas.b1}</td>
        <td>${item.bandas.b2}</td>
        <td>${item.bandas.mult}</td>
        <td>${item.resultado}</td>
        </tr>`;
    });

    return tablaHtml;
}

// Funcion que imprime la tabla en el HTML
function printHTMLTable() {
    // Cargo la tabla en el documento
    let table = document.getElementById('historial');
    table.innerHTML = createTableHtml();
}

// Funcion que borra la tabla del HTML
function clearHTMLTable() {
    // Cargo la tabla en el documento
    let table = document.getElementById('historial');
    table.innerHTML = "";
}


// Funcion que levanta los valores del form en submit
function readInput(event) {
    event.preventDefault();

    let bandas = {
        b1: event.target[0].value,
        b2: event.target[1].value,
        mult: event.target[2].value,
    };
    document.getElementById('resultado_res').innerText = `Resultado: ${saveHistory(bandas).resultado} [Ohm]`;

    printHTMLTable();
}

// Ejecuciones
// Imprimo la tabla que puede provenir del localStorage
historyReg.length > 0 ? printHTMLTable() : clearHTMLTable();

// Agrego listener para el formulario de inputs
let resInput = document.getElementById('res_input_form');
resInput.addEventListener('submit', readInput);

// Agrego listener para el boton de borrado
let clearBtn = document.getElementById('clearBtn');
clearBtn.addEventListener("click", clearHistory);

// Funciones para mostrar Series de valores
async function readSerieInput(event) {
    event.preventDefault();
    const serie = await getResistorSerie(event.target[0].value)
    console.log(serie);
    document.getElementById('serie_box').innerText = `${serie.values.map(value => `${value} `)}`;
}

// Fetch async
const getResistorSerie = async (serieName) => {
    const res = await fetch('/serieE.json')
    const serieE = await res.json()
    return serieE.find(serie => serie.serieName === serieName)
}

// Agrego listener para el formulario de inputs
let serieInput = document.getElementById('serie_res_form');
serieInput.addEventListener('submit', readSerieInput);
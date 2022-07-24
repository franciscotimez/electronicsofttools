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

function calculoPotencia(resistance, current) {
    return (current ** 2) * resistance;
}

// Funcion auxiliar
// Tranforma colores a numeros
function colorToNumber(color) {
    return colors.indexOf(color.toLowerCase());
}

// Tranforma colores a multiplicadores
function colorToMultiplier(color) {
    const specialColors = ['dorado' , 'plateado']
    if( specialColors.includes(color.toLowerCase()) ){
        console.log(specialColors.indexOf(color.toLowerCase()) + 1 )
        let multiplier = 0.1 ** (specialColors.indexOf(color.toLowerCase()) + 1)
        return multiplier
    }
    return 10 ** colorToNumber(color);
}

function getTolerance(color) {
    const toleranceColors = ['marron', 'rojo','dorado' , 'plateado']
    const tolerance = [ 1, 2, 5, 10 ]
    if( toleranceColors.includes(color.toLowerCase()) ){
        return tolerance[toleranceColors.indexOf(color.toLowerCase())]
    }
}

function searchReplacement(valor, valoresSerie){
    const error = (valorReal, valorEstimado) => {
        return (Math.abs(valorEstimado - valorReal) / valorReal) * 100
    }
    let valorAux = valor
    let valorInferior = 0
    let valorSuperior = 10
    let multiplicador = 1

    while(valorAux <= 1){
        valorAux *= 10;
        multiplicador /= 10
    }

    while(valorAux > 10){
        valorAux /= 10;
        multiplicador *= 10
    }


    valoresSerie.forEach((valor, index, arr) => {
        if (valor < valorAux ){
            valorInferior = valor
            valorSuperior = arr[(index + 1) % arr.length]
        }
    })

    // Fix error fin de array
    if( valorSuperior < valorInferior ) {
        valorSuperior *= 10 
    }

    let data = {
        superior: {
            valor: valorSuperior * multiplicador,
            error: error(valor, valorSuperior * multiplicador)
        },
        inferior: {
            valor: valorInferior * multiplicador,
            error: error(valor, valorInferior * multiplicador)
        }
    }
    console.log(data)
    return data

}

// Fix print screen
function fixToHumanreadable(valor){
    let valAux = 0

    if(valor >= 1000000) {
        valAux = valor / 1000000
        let fixed = 3 - (Math.log(valAux) * Math.LOG10E + 1 | 0) ;
        return `${valAux.toFixed(fixed > 0 ? fixed : 0)} M`
    }
    if(valor >= 1000) {
        valAux = valor / 1000
        let fixed = 3 - (Math.log(valAux) * Math.LOG10E + 1 | 0);
        return `${valAux.toFixed(fixed > 0 ? fixed : 0)} k`
    }
    if(valor < 1) {
        valAux = valor * 1000
        let fixed = 3 - (Math.log(valAux) * Math.LOG10E + 1 | 0);
        return `${valAux.toFixed(fixed > 0 ? fixed : 0)} m`
    }
    else {
        let fixed = 3 - (Math.log(valor) * Math.LOG10E + 1 | 0);
        return `${valor.toFixed(fixed > 0 ? fixed : 0)}`
    }
}

function testAndParse(valor){
    console.log("valor length", valor.length)
    if(valor.length > 0){
        if(/^\d*\.?\d*\s*[kMm]?$/.test(valor)){
            if( valor.endsWith('k') ) {
                let valoraux = valor.substring(0, valor.length - 1)
                return {
                    pass: true,
                    value: parseFloat(valoraux) * 1000
                }
            }
            if( valor.endsWith('M') ) {
                let valoraux = valor.substring(0, valor.length - 1)
                return {
                    pass: true,
                    value: parseFloat(valoraux) * 1000000
                }
            }
            if( valor.endsWith('m') ) {
                let valoraux = valor.substring(0, valor.length - 1)
                return {
                    pass: true,
                    value: parseFloat(valoraux) / 1000
                }
            }
            else{
                return {
                    pass: true,
                    value: parseFloat(valor)
                }
            }
        }
    }
    alert("Valor ingresado es invalido:\nValores posibles:\n15\n13.4\n12k\n16.5M\n150m")
    return { pass: false }
}

// Guardo los ultimos 10 valores calculados
function saveHistory(bandas) {
    let data = {
        date: DateTime.now().toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS),
        bandas: bandas,
        resultado: calculoResistencia(bandas),
        tolerance: getTolerance(bandas.tol)
    };

    // Agrego un elemento
    historyReg.unshift(data);

    // Elimino un elemento si paso el maximo
    historyReg.length > maxHistory && historyReg.pop();

    // Guardo el historial
    localStorage.setItem("historyEST", JSON.stringify(historyReg));

    console.log(historyReg)

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
    <th>Bandas</th>
    <th>Resultado [ohm]</th>
    </tr>`;

    historyReg.forEach((item) => {
        tablaHtml += `
        <tr>
        <td>${item.date}</td>
        <td>
        <p class="${item.bandas.b1}"> </p>
        <p class="${item.bandas.b2}"> </p>
        <p class="${item.bandas.mult}"> </p>
        <p class="${item.bandas.tol}"> </p>
        </td>
        <td>${fixToHumanreadable(item.resultado)} ± ${item.tolerance} %</td>
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
        tol: event.target[3].value,
    };
    let result = saveHistory(bandas)
    document.getElementById('resultado_res').innerHTML = `<h3>Resistor: ${fixToHumanreadable(result.resultado)} [Ohm] ± ${result.tolerance} %</h3>`;
    document.getElementById('serie_valor').value = fixToHumanreadable(result.resultado)
    document.getElementById('power_valor_res').value = fixToHumanreadable(result.resultado)
    printHTMLTable();
}

// Ejecuciones
// Imprimo la tabla que puede provenir del localStorage
historyReg.length > 0 ? printHTMLTable() : clearHTMLTable();

// Agrego listener para el formulario de inputs
let resInput = document.getElementById('res_input_form');
resInput.addEventListener('submit', readInput);

// Listener para selectores de formulario
let selectorInput = document.getElementById('1da_banda');
selectorInput.addEventListener('change', (event) => { event.srcElement.className = event.target.value });

selectorInput = document.getElementById('2da_banda');
selectorInput.addEventListener('change', (event) => { event.srcElement.className = event.target.value });

selectorInput = document.getElementById('multiplicador');
selectorInput.addEventListener('change', (event) => { event.srcElement.className = event.target.value });

selectorInput = document.getElementById('tolerancia');
selectorInput.addEventListener('change', (event) => { event.srcElement.className = event.target.value });


// Agrego listener para el boton de borrado
let clearBtn = document.getElementById('clearBtn');
clearBtn.addEventListener("click", clearHistory);

// Funciones para mostrar Series de valores
async function readSerieInput(event) {
    event.preventDefault();
    const valor = testAndParse(event.target[0].value)
    console.log("valor ingresaro", valor)
    if(valor.pass){
        const serie = await getResistorSerie(event.target[1].value)
        const valores = searchReplacement( valor.value, serie.values )
        
        let realContainer = document.getElementById('serie_box_real')
        realContainer.innerHTML = `<h3>Valor real</h3><h4>${fixToHumanreadable(valor.value)}[Ohm]</h4>`
        realContainer.className = "real"
        
        let bestInferior = valores.inferior.error < valores.superior.error ? true : false
        if( valores.inferior.error < valores.superior.error ) {
            classInf = valores.inferior.error == 0 ? "real" : "best"
            classSup = "worst"
        }
        else{
            classInf = "worst"
            classSup = valores.superior.error == 0 ? "real" : "best"
        }
    
        let infContainer = document.getElementById('serie_box_inf')
        infContainer.innerHTML = `<h3>Valor inferior</h3><h4>${fixToHumanreadable(valores.inferior.valor)}[Ohm]</h4><h5>error ${valores.inferior.error.toFixed()}[%]</h5>`
        infContainer.className = classInf

        let supContainer = document.getElementById('serie_box_sup')
        supContainer.innerHTML = `<h3>Valor superior</h3><h4>${fixToHumanreadable(valores.superior.valor)}[Ohm]</h4><h5>error ${valores.superior.error.toFixed()}[%]</h5>`
        supContainer.className = classSup
    }
}

function readPowerInput(event) {
    event.preventDefault();
    const valorRes = testAndParse(event.target[0].value)
    const valorCurr = testAndParse(event.target[1].value)

    if( valorRes.pass && valorCurr.pass ){
        const result = calculoPotencia(valorRes.value, valorCurr.value)
        document.getElementById('power_box').innerHTML = `<h3>Potencia: ${fixToHumanreadable(result)} [W]</h3>`;

        console.log(result)
    }
}

// Fetch async
const getResistorSerie = async (serieName) => {
    const res = await fetch('./serieE.json')
    const serieE = await res.json()
    return serieE.find(serie => serie.serieName === serieName)
}

// Agrego listener para el formulario de Series
let serieInput = document.getElementById('serie_res_form');
serieInput.addEventListener('submit', readSerieInput);

// Agrego listener para el formulario de Potencia
let powerInput = document.getElementById('power_res_form');
powerInput.addEventListener('submit', readPowerInput);
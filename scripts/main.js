
const colors = ['negro', 'marron', 'rojo', 'naranja', 'amarillo', 'verde', 'azul', 'violeta', 'gris', 'blanco'];
const maxHistory = 5;
let historyReg = [];

// Funcion Calculadora
// recibe String con colores.
function calculoResistencia(bandas) {
    let digito1 = colorToNumber(bandas[0]);
    let digito2 = colorToNumber(bandas[1]);
    let multiplier = colorToMultiplier(bandas[2]);

    let resultado = ((digito1 * 10) + digito2) * multiplier;
    return resultado;
}

// Funcion auxiliar
// Tranforma colores a numeros
function colorToNumber(color) {
    return colors.indexOf(color.toLowerCase());
}

// Tranforma colores a multiplicadores
function colorToMultiplier(color) {
    let multiplier = 1;
    for (let index = 0; index < colorToNumber(color); index++) {
        multiplier *= 10;
    }
    return multiplier;
}

// Guardo los ultimos 10 valores calculados
function saveHistory(bandas) {
    let data = {
        date: new Date(),
        bandas: bandas,
        resultado: calculoResistencia(bandas)
    };

    historyReg.push(data);

    if (historyReg.length > maxHistory) {
        historyReg.shift();
    }

    return data;
}

for (let i = 0; i < maxHistory + 2; i++) {

    let userInput = prompt(`Ingrese 3 colores de la lista, separados por comas y en cualquier orden: \n${colors}\nEjemplo: marron,negro,rojo\nIngreso numero: ${i + 1}`);
    
    let inputArray = userInput.split(',');
    
    // Calcula y guarda en el historico
    let resultado = saveHistory(inputArray);
    
    console.log(`Ingreso numero: ${i+1}`);
    console.log(`Date: ${resultado.date.toLocaleString()}`);
    console.log(`Colores ingresados: ${resultado.bandas}`);
    console.log(`Resultado: ${resultado.resultado} [Ohm]`);    
}

console.log(`Historico de los ultimos ${maxHistory} resultados: `);
console.log(historyReg);
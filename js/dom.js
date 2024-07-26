
function forEach(array, handler) {
    for (var i = 0; i < array.length; i++) handler(array[i])
}

function modify(className, modifier) {
    var elements = document.getElementsByClassName(className)
    forEach(elements, modifier)
}



function setDisplay(className, show) {
    modify(className, function (element) { element.style.display = show ? "block" : "none" })
}



function setText(className, text) {
    modify(className, function (element) { element.innerText = text })
}


function clearSelect(select) {
    while (select.options.length > 0) {
        select.remove(0)
    }
}


function addSelectOption(select, key, value) {
    var option = document.createElement("option");
    option.value = key;
    option.text = value;
    select.options.add(option)
}


function appendParagraph(text, container) {
    var p = document.createElement("p");
    p.appendChild(document.createTextNode(text));
    container.appendChild(p);
    console.log('Adicionou parágrafo:', text); // Verifique se o parágrafo foi adicionado
}
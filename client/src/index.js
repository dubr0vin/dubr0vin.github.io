var g = 0;
setTimeout(() => {
    document.getElementById("app").connectedCallback()
    g=2
    document.getElementById("app").setAttribute("z",0);
}, 1000)


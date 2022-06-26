{
    function transformScripts(el) {
        let totalScripts = "";
        let sibling = el.firstChild
        while (true) {
            let shouldRemove = false;
            if (sibling.nodeType === Node.ELEMENT_NODE) {
                if (sibling.nodeName === "SCRIPT") {
                    totalScripts += sibling.textContent + "\n";
                    shouldRemove = true;
                }
            }

            if (sibling === el.lastChild) {
                if (shouldRemove) {
                    el.removeChild(sibling)
                }
                break
            } else {
                let nw = sibling.nextSibling
                if (shouldRemove) {
                    el.removeChild(sibling)
                }
                sibling = nw;
            }
        }
        return totalScripts
    }

    function allSiblings(node, callback) {
        for (let i = 0; i < node.childNodes.length; i++) {
            let child = node.childNodes[i];
            allSiblings(child, callback);
            if (callback(child)) {
                node.removeChild(child)
            }
        }
    }

    function processText(node) {
        let first = -1;
        while ((first = node.textContent.indexOf("{{")) !== -1) {
            let second = node.textContent.indexOf("}}")
            let code = node.textContent.substring(first + 2, second);
            let res = eval(code)
            node.textContent = node.textContent.substring(0, first) + res + node.textContent.substring(second + 2);
        }
    }

    for (let el of document.getElementsByTagName("template")) {


        class X extends HTMLElement {
            updateDom() {
                let nw = el.content.cloneNode(true);
                let globals = {}
                for (let name of this.getAttributeNames()) {
                    globals[name] = window[name]
                    window[name] = this.getAttribute(name);
                }

                allSiblings(nw, (node) => {
                    let shouldDelete = false;
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        for (let name of node.getAttributeNames()) {
                            if (name.startsWith(":")) {
                                node.setAttribute(name.substring(1), eval(node.getAttribute(name)))
                                node.removeAttribute(name);
                                if (typeof node.onupdated === "function") {
                                    node.onupdated()
                                }
                            }
                            if (name === "if") {
                                if (!eval(node.getAttribute(name))) {
                                    shouldDelete = true;
                                }
                            }
                            if (name === "model") {
                                node.onchange = function () {
                                    console.log(node.getAttribute(name) + "=" + JSON.stringify(node.value))
                                    eval(node.getAttribute(name) + "=" + JSON.stringify(node.value))
                                }
                            }
                        }
                    }
                    if (node.nodeType === Node.TEXT_NODE) {
                        processText(node)
                    }
                    return shouldDelete
                })

                for (let name in globals) {
                    window[name] = globals[name]
                }
                if (el.hasAttribute("shadow")) {
                    if (this.shadowRoot == null) {
                        this.attachShadow({mode: 'open'});
                    }
                    this.shadowRoot.innerHTML = ""
                    this.shadowRoot.appendChild(nw)
                } else {
                    this.innerHTML = ""
                    this.appendChild(nw)
                }
            }

            constructor() {
                super();
            }

            connectedCallback() {
                this.updateDom()
            }

            onupdated() {
                this.updateDom()
            }

            static get observedAttributes() {
                return (el.getAttribute("props") || "").split(";").map(t => t.trim());
            }

            attributeChangedCallback(name, oldValue, newValue) {
                this.updateDom()
                // вызывается при изменении одного из перечисленных выше атрибутов
            }

        }

        customElements.define(el.id, X)

    }
}
var nodes = undefined;
var parent = undefined;
var svg = undefined;
var style = "";
var style_map = new Map();
var new_style = { "fill": "red", "stroke": "green" };
var obj = undefined;
var is_clicked = false;
var ids = new Map();
var classes = new Map();


function init_editor() {
    var doc = findSVGElements();
    if (doc) {
        svg = doc.querySelector('svg');
        parent = svg.querySelector('g').querySelector('g');
        nodes = parent.querySelectorAll('*');
        nodes.forEach((node) => {
            node.onmouseenter = on_enter;
            node.onmouseleave = on_leave;
            node.onclick = on_click;
        });
    }

}

function findSVGElements() {
    var elms = document.querySelectorAll(".svg-container");
    for (var i = 0; i < elms.length; i++) {
        var subdoc = getSubDocument(elms[i])
        if (subdoc) {
            return subdoc;
        }
    }
}

function getSubDocument(embedding_element) {
    if (embedding_element.contentDocument) {
        return embedding_element.contentDocument;
    } else {
        var subdoc = null;
        try {
            subdoc = embedding_element.getSVGDocument();
        } catch (e) { }
        return subdoc;
    }
}

function on_click(node) {
    if (is_clicked) {

    } else {
        if (node.target != obj) {
            is_clicked = false;
            reset_style();
            on_enter(node);
        }
        obj = node.target;
        $('#txt-id').val(obj.getAttribute('id'));
        is_clicked = true;
        load_id();
    }

}

function on_enter(node) {
    if (!is_clicked) {
        var target = node.target;
        obj = target;
        style_map.set("fill", obj.getAttribute("fill"));
        style_map.set("stroke", obj.getAttribute("stroke"));
        obj.setAttribute("fill", "#8c1d3d");
        obj.setAttribute("stroke", "#8c1d3d");

    }
}

function on_leave(node) {
    if (!is_clicked) {
        var target = node.target;
        obj = target;
        reset_style();
    }
}

function reset_style() {
    obj.setAttribute("fill", style_map.get("fill"));
    obj.setAttribute("stroke", style_map.get("stroke"));
}

function load_id() {
    $('#svg-id').val('');
    $('#svg-class').val('');
    $('#svg-css').val('');
    $('#svg-link').val('');
    var _id = obj.getAttribute('id');
    var _class = obj.getAttribute('class');
    if (_id) {
        $('#svg-id').val(_id);
    }
    if (_class) {
        $('#svg-class').val(_class);
    }
    if (classes.has(_class)) {
        $('#svg-css').val(classes.get(_class));
    }
    if (ids.has(_id)) {
        $('#svg-link').val(ids.get(_id));
    }
}

function set_id(e) {
    e.preventDefault();
    var _id = $('#svg-id').val();
    var _class = $('#svg-class').val();
    var _css = $('#svg-css').val();
    var _link = $('#svg-link').val();
    if (_id) {
        obj.setAttribute('id', _id);
    }
    if (_class) {
        obj.setAttribute('class', _class);
    }
    if (_css && _class) {
        classes.set(_class, _css);
    }
    if (_link && _id) {
        ids.set(_id, _link);
    }
    $('#svg-id').val('');
    $('#svg-class').val('');
    $('#svg-css').val('');
    $('#svg-link').val('');
    reset_style();
    is_clicked = false;
}

function update_css() {
    var _class = $('#svg-class').val();
    if (classes.has(_class)) {
        $('#svg-css').val(classes.get(_class));
    }
}


function generate_css() {
    var list = [];
    classes.forEach((value, key) => {
        list.push(`.${key}:hover, .${key}:focus{${value}}`);
    });
    return `<style type="text/css">${list.join('\n')}</style>`;
}


function join(map) {
    var list = []
    map.forEach((value, key) => {
        list.push(`${key}:${value}`);
    });
    return list.join(";");
}

function copyAttrs(src, target) {
    for (let attr of src.attributes) {
        target.setAttribute(attr.name, attr.value);
    }
}
var x = undefined;
function generate_svg(with_css = true, with_links = true) {
    var new_svg = document.createElement('svg');
    copyAttrs(svg, new_svg);
    new_svg.setAttribute('xmlns:xlink', "http://www.w3.org/1999/xlink");
    var css = generate_css();
    var html = parent.outerHTML;
    var parser = new DOMParser();
    var xmldoc = parser.parseFromString(`<root>${css}${html}</root>`, 'text/xml');
    var support = parser.parseFromString(`<switch><g requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"/><text text-anchor="middle" font-size="10px" x="50%" y="100%">Viewer does not support full SVG 1.1</text></switch>`, 'text/xml');
    if (with_links) {
        wrap_elements(xmldoc);
    }
    var root = xmldoc.getElementsByTagName('root')[0];
    if (with_css) {
        new_svg.appendChild(root.getElementsByTagName('style')[0]);
    }
    new_svg.appendChild(root.getElementsByTagName('g')[0]);
    new_svg.appendChild(support.getElementsByTagName('switch')[0]);
    return new_svg.outerHTML;
}

function wrap_elements(doc) {
    ids.forEach((value, key) => {
        var node = doc.querySelector(`#${key}`);
        if (node) {
            var link = document.createElement('a');
            link.setAttribute('xlink:href', value);
            link.setAttribute('target', '_blank');
            wrap_element(node, link);
        }
    });
}

function wrap_element(node, wrapper) {
    node.parentNode.insertBefore(wrapper, node);
    wrapper.appendChild(node);
}

function downloadString(text, fileType, fileName) {
    var blob = new Blob([text], { type: fileType });

    var a = document.createElement('a');
    a.download = fileName;
    a.href = URL.createObjectURL(blob);
    a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
}

function map_to_object(map) {
    const out = Object.create(null)
    map.forEach((value, key) => {
        if (value instanceof Map) {
            out[key] = map_to_object(value)
        }
        else {
            out[key] = value
        }
    })
    return out
}

function classes_to_list(map) {
    const list = Array();
    map.forEach((value, key) => {
        const out = Object.create(null);
        out['class'] = key;
        out['style'] = value;
        list.push(out);
    })
    return list;
}

function ids_to_list(map) {
    const list = Array();
    map.forEach((value, key) => {
        const out = Object.create(null);
        out['id'] = key;
        out['link'] = value;
        list.push(out);
    })
    return list;
}
function capitalize(str) {
    return str.replace(/(^|\s)([a-z])/g, function(m, p1, p2) {
        return p1 + p2.toUpperCase().toString();
    });
}

module.exports = capitalize;
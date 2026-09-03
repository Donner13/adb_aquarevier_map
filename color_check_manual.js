const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

function getStyle(el) {
    return dom.window.getComputedStyle(el);
}

// Find all elements with inline colors
const els = document.querySelectorAll('*');
els.forEach(el => {
   if (el.getAttribute('style')) {
       //console.log(el.tagName, el.getAttribute('style'));
   }
});

// Let's just output the whole style block to see CSS vars
const styles = document.querySelectorAll('style');
styles.forEach(s => console.log(s.innerHTML.substring(0, 500)));

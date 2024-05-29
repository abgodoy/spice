$(document).ready(function(){
    console.log("this is fade-in.js");

    var items = $(".fade-item");

    console.log("items: " +items[0]);

    for (let i = 0; i < items.length; ++i) {
        fadeIn(items[i], i * 300);
        }

    function fadeIn (item, delay) {
        setTimeout(() => {
        item.classList.add('fadein')
        }, delay)
    }
});
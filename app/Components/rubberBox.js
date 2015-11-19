//<HTML>
//<HEAD>
//<META http-equiv=imagetoolbar content=no>
//<TITLE>
//
//</TITLE>
//<STYLE>
//#rubberBand {
//position: absolute;
//visibility: hidden;
//width: 0px; height: 0px;
//border: 2px solid red;
//}
//</STYLE>
//
//</HEAD>
//<BODY>
//<img name="myImage" id="myImage" src="VK.jpg" height=400
//width=400>
//
//
//<DIV ID="rubberBand"></DIV>
//
//<SCRIPT>

var IMG;
IMG = document.getElementById('myImage');
IMG.onmousedown = startRubber;
IMG.onmouseup = stopRubber;

function startRubber (evt) {
//if (document.all) {
//// IE
//var r = document.all.rubberBand;
//r.style.width = 0;
//r.style.height = 0;
//r.style.pixelLeft = event.x;
//r.style.pixelTop = event.y;
//r.style.visibility = 'visible';
//IMG.ondragstart = cancelDragDrop; // otherwise IE will try to drag the image
//}
//else if (document.getElementById) { //TODO replace with react

    // firefox
    evt.preventDefault();
    var r = document.getElementById('rubberBand');
    r.style.width = 0;
    r.style.height = 0;
    r.style.left = evt.clientX + 'px';
    r.style.top = evt.clientY + 'px';
    r.style.visibility = 'visible';
    r.onmouseup = stopRubber;
    //}
    IMG.onmousemove = moveRubber;
}
function moveRubber (evt) {
    //if (document.all) { // IE
    //    var r = document.all.rubberBand;
    //    r.style.width = event.x - r.style.pixelLeft;
    //    r.style.height = event.y - r.style.pixelTop;
    //    }
    //    else if (document.getElementById) { // firefox
    var r = document.getElementById('rubberBand');
    r.style.width = evt.clientX - parseInt(r.style.left);
    r.style.height = evt.clientY - parseInt(r.style.top);
    //    }
    //return false; // otherwise IE won't fire mouseup :/
}

function stopRubber (evt) {
    IMG.onmousemove = null;
}

function cancelDragDrop()
{
    window.event.returnValue = false;
}

//</SCRIPT>
//</BODY>
//</HTML>

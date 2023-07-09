// Copyright Normunds Andersons

var xmlhttp;

var WordMode = true;
var KeyHint = true;
var TextMode = true;
var SpeedTest = true;
var Numeric = true;

var Pos = 0;
var Index = 0;
var Text = [];
var TextDoneArr = [];
var TextDone = "";
var TextCurrent = "";

var TotalLength = 0;
var TotalPos = 0;

var LastError = false;
var FirstTime = true;

var Progress = [];
var ProgressBad = [];
var ErrorQty = 0;

var Keys = [];
var KeysUsed = [];

var Time = 0;
var IntervalM;
var IntervalT;

// ----------------------------------------------------------------------------

function OnKeyDown(o, e) {
    var keynum = window.event ? e.keyCode : e.which;
    var arr = Keys[keynum];

    if (
        keynum == 8 || // back
        keynum == 9 || // tab
        keynum == 16 || // shift
        keynum == 17 || // ctrl
        keynum == 18 || // alt
        keynum == 27 || // esc
        keynum == 33 || // pg up
        keynum == 34 || // pg down
        keynum == 35 || // end
        keynum == 36 || // home
        keynum == 37 || // left
        keynum == 38 || // up
        keynum == 39 || // right
        keynum == 40 || // down
        keynum == 45 || // ins
        keynum == 46 || // del
        (keynum == 65 && e.ctrlKey && !e.altKey) || // ctrl + a
        (keynum == 86 && e.ctrlKey && !e.altKey) || // ctrl + v
        (keynum == 88 && e.ctrlKey && !e.altKey) // ctrl + x
    ) {
        if (o.setSelectionRange) {
            o.focus();
        } else if (o.createTextRange) {
            e.returnValue = false;
        }

        var len = o.value.length;
        if (
            keynum == 8 &&
            // WordMode &&
            len > 0 &&
            o.value.charAt(len - 1) != " "
        ) {
            // back
            return;
        }

        if (e.preventDefault) {
            e.preventDefault();
        }
    }
}

// ----------------------------------------------------------------------------

function OnKeyPress(o, e) {
    // console.clear();

    var keynum = window.event ? e.keyCode : e.which;
    var keychar = String.fromCharCode(keynum);

    if (Time == 0) {
        xmlhttp = GetXmlHttpObject();
        if (xmlhttp == null) {
            alert("Your browser does not support AJAX!");
            return;
        }

        xmlhttp.open("GET", gTimeUrl, true);
        xmlhttp.send(null);

        Time = new Date();
        IntervalM = setInterval(ShowCounter, 3000);
        IntervalT = setInterval(ShowTime, 200);
    }

    var len = o.value.length;
    if (keynum == 8) {
        // backspace
        if (len > 0 && o.value.charAt(len - 1) != " ") {
            o.value = o.value.substring(0, len - 1);
        }
    } else {
        if (keynum == 32 || keynum == 13) {
            var c = o.value.charCodeAt(len - 1);
            if (len > 0 && (c == 32 || c == 10)) {
                keychar = "";
            } else {
                ++Pos;
                TotalPos += TextCurrent.length + 1;
                HighlightText(keynum == 13 ? "\r" : null);

                if (Pos == 0) {
                    o.value = "";
                    keychar = "";
                }
            }
        }
        o.value += keychar;
    }

    // end
    if (Pos == 0 && !IsTextLength()) {
        ShowConclusion();
    } else if (!WordMode) {
        ClearKeysUsed();

        if (!IsPosLength()) return false;

        var typed = ById("type").value;

        var text_word = Text[Index].split(/ |\n/)[Pos];
        var typed_word = typed.split(/ |\n/)[Pos];

        var p = typed_word.length - 1;

        if (p > -1) {
            var keyval = text_word.charAt(p);
            var keycode = text_word.charCodeAt(p);

            if (keycode == keynum) {
                //            o.value += keychar;
                //            ++Pos;
                //            ++TotalPos;
                // HighlightText();
                //            if (Pos == 0) {
                //                o.value = "";
                //                keychar = "";
                //            }
            } else {
                // temp
                // o.value = o.value.substring(0, o.value.length - 1);
                var arr = Keys[keynum];

                if (arr) {
                    for (var i in arr) {
                        ById("key_" + arr[i]).style.backgroundColor = "#f00";
                        KeysUsed.push(arr[i]);
                    }
                }

                LastError = true;
            }

            AddProgress(keyval, LastError);
        }

        ShowNextKey();
    }

    o.scrollTop = o.scrollHeight - o.clientHeight;

    return false;
}

// ----------------------------------------------------------------------------

function GetXmlHttpObject() {
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        return new XMLHttpRequest();
    }
    if (window.ActiveXObject) {
        // code for IE6, IE5
        return new ActiveXObject("Microsoft.XMLHTTP");
    }
    return null;
}

// ----------------------------------------------------------------------------

function StateChanged() {
    if (xmlhttp.readyState == 4) {
        ById("typing").innerHTML = xmlhttp.responseText;
    }
}

// ----------------------------------------------------------------------------

function SaveResult() {
    xmlhttp = GetXmlHttpObject();
    if (xmlhttp == null) {
        alert("Your browser does not support AJAX!");
        return;
    }

    var params = "";

    //    if (WordMode) {
    for (var i in TextDoneArr) {
        params +=
            i + "=" + encodeURIComponent(TextDoneArr[i].slice(0, -1)) + "&";
    }
    //    } else {
    /*
        for (var i in Progress) {
            var bad = ProgressBad[i];
            if (bad == undefined) bad = 0;

            var key = i;
            if (key == " ") key = "space";

            params +=
                encodeURIComponent(key) + "=" + Progress[i] + ";" + bad + "&";
        }
        */
    //    }

    xmlhttp.onreadystatechange = StateChanged;
    xmlhttp.open("POST", gAjaxUrl, true);
    xmlhttp.setRequestHeader(
        "Content-Type",
        "application/x-www-form-urlencoded; charset=utf-8"
    );
    /*    
    xmlhttp.setRequestHeader("Content-Length", params.length);
    xmlhttp.setRequestHeader("Connection", "close");
    */

    xmlhttp.send(params);
}

// ----------------------------------------------------------------------------

function SaveResultST() {
    xmlhttp = GetXmlHttpObject();
    if (xmlhttp == null) {
        alert("Your browser does not support AJAX!");
        return;
    }

    var params = "";
    for (var i in TextDoneArr) {
        params +=
            i + "=" + encodeURIComponent(TextDoneArr[i].slice(0, -1)) + "&";
    }

    xmlhttp.onreadystatechange = StateChanged;
    xmlhttp.open("POST", gAjaxUrl, true);
    xmlhttp.setRequestHeader(
        "Content-Type",
        "application/x-www-form-urlencoded; charset=utf-8"
    );
    /*
    xmlhttp.setRequestHeader("Content-Length", params.length);
    xmlhttp.setRequestHeader("Connection", "close");
    */
    xmlhttp.send(params);
}

function ShowConclusion() {
    ById("typing").innerHTML = "Done! Please wait for the progress report.";
    ById("typing_info").innerHTML = "";
    SaveResult();
}

// ----------------------------------------------------------------------------

function ClearKeysUsed() {
    // clear keys
    var z = KeysUsed.shift();
    while (z) {
        ById("key_" + z).style.backgroundColor = "#fff";
        z = KeysUsed.shift();
    }
}

// ----------------------------------------------------------------------------

function Trim(str) {
    return str.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
}

// ----------------------------------------------------------------------------

function ShowNextKey() {
    if (!IsPosLength()) return;

    var typed = ById("type").value;

    var text_word = Text[Index].split(/ |\n/)[Pos];
    var typed_word = typed.split(/ |\n/)[Pos];

    var p = typed_word.length;

    var keynum = p < text_word.length ? text_word.charCodeAt(p) : 32;
    var arr = Keys[keynum];

    if (!arr) return;

    var fingers = new Array(
        new Array(2, 96),
        new Array(8, 72),
        new Array(20, 60),
        new Array(36, 60),
        new Array(75, 94),
        new Array(636, 94),
        new Array(674, 60),
        new Array(690, 60),
        new Array(702, 72),
        new Array(708, 96)
    );

    var i;
    for (i = 0; i < arr.length; ++i) {
        var k = arr[i];
        var f;

        if (Numeric) {
            switch (parseInt(k)) {
                case 201:
                case 301:
                case 401:
                case 501:
                    f = 6;
                    break;
                case 102:
                case 202:
                case 302:
                case 402:
                    f = 7;
                    break;
                case 103:
                case 203:
                case 303:
                case 403:
                case 502:
                    f = 8;
                    break;
                default:
                    f = 9;
            }
        } else {
            switch (parseInt(k)) {
                case 101:
                case 102:
                case 202:
                case 302:
                case 401:
                case 402:
                case 403:
                    f = 0;
                    break;
                case 103:
                case 203:
                case 303:
                case 404:
                    f = 1;
                    break;
                case 104:
                case 204:
                case 304:
                case 405:
                    f = 2;
                    break;
                case 105:
                case 106:
                case 205:
                case 206:
                case 305:
                case 306:
                case 406:
                case 407:
                    f = 3;
                    break;
                case 504:
                case 505:
                    f = 5;
                    break;
                case 107:
                case 108:
                case 207:
                case 208:
                case 307:
                case 308:
                case 408:
                case 409:
                    f = 6;
                    break;
                case 109:
                case 209:
                case 309:
                case 410:
                    f = 7;
                    break;
                case 110:
                case 210:
                case 310:
                case 411:
                    f = 8;
                    break;
                default:
                    f = 9;
            }
        }

        if (KeyHint || LastError) {
            ById("key_" + k).style.backgroundColor = "#0f0";
            KeysUsed.push(k);

            ById("finger_" + i).style.left = fingers[f][0] + "px";
            ById("finger_" + i).style.top = fingers[f][1] + "px";
        }

        ById("finger_" + i).style.display =
            KeyHint || LastError ? "block" : "none";
    }

    for (var j = i; j < 5; ++j) {
        ById("finger_" + j).style.display = "none";
    }
}

// ----------------------------------------------------------------------------

function IsTextLength() {
    return Index < Text.length;
}

// ----------------------------------------------------------------------------

function IsPosLength() {
    if (IsTextLength()) return Pos < Text[Index].length;
    else return false;
}

// ----------------------------------------------------------------------------

function HighlightText(enter) {
    var out = "";

    //    if (WordMode) {
    var arr = Text[Index].split(" ");
    var typed = ById("type").value;
    var txt = TextMode ? "_txt" : "";

    if (Pos > 0) {
        var t = typed.split(/ |\n/)[Pos - 1];
        if (enter) t += enter;

        LastError = TextCurrent != t;

        TextDone +=
            '<span class="done' +
            txt +
            (LastError ? "_bad" : "_ok") +
            '">' +
            escapeHtml(TextCurrent) +
            "</span> ";
        TextDoneArr[Index] += t;
        if (!enter) {
            TextDoneArr[Index] += " ";
        }
        if (LastError) {
            ErrorQty++;
        }
    }

    if (Pos >= arr.length) {
        ++Index;
        Pos = 0;

        if (!IsTextLength()) return;

        arr = Text[Index].split(" ");

        TextDone = "";
        TextDoneArr[Index] = "";
    }

    TextCurrent = arr.length > Pos ? arr[Pos] : "";

    out =
        TextDone +
        '<span class="current' +
        txt +
        '">' +
        escapeHtml(TextCurrent) +
        "</span>" +
        '<span class="next' +
        txt +
        '">';

    for (var i = Pos + 1; i < arr.length; ++i) {
        out += " " + escapeHtml(arr[i]);
    }
    out += "</span>";
    //    } else {
    /*        
        if (!IsPosLength()) {
            ++Index;
            Pos = 0;
            TextDone = "";
            TextDoneArr[Index] = "";
        } else if (Pos > 0) {
            TextDone +=
                '<span class="done_' +
                (LastError ? "bad" : "ok") +
                '">' +
                escapeHtml(TextCurrent) +
                "</span>";
        }

        if (!IsTextLength()) return;

        TextCurrent = Text[Index].charAt(Pos);

        out =
            TextDone +
            '<span class="current">' +
            escapeHtml(TextCurrent) +
            "</span>" +
            '<span class="next">' +
            escapeHtml(Text[Index].substring(Pos + 1)) +
            "</span>";
*/
    //    }

    // enter
    if (TextMode) out = out.replace(/\r/g, "<br />");
    else out = out.replace(/\r/g, "&crarr;<br />");
    ById("text").innerHTML = out;

    ShowCounter();

    LastError = false;
}

// ----------------------------------------------------------------------------

function AddProgress(key, bad) {
    if (!FirstTime) {
        FirstTime = !bad;
        return;
    }

    var qty = Progress[key];
    if (qty == undefined) qty = 0;

    Progress[key] = ++qty;

    if (bad) {
        qty = ProgressBad[key];
        if (qty == undefined) qty = 0;
        ProgressBad[key] = ++qty;
    }

    FirstTime = !bad;
}

function ShowTime() {
    var counter_time = ById("counter_time");
    if (counter_time == null) return;

    var diff = 0;
    var diff_min = 0;
    var diff_sec = 0;
    if (Time > 0) {
        diff = new Date().getTime() - Time.getTime();
        diff_min = Math.floor(diff / 1000 / 60);
        diff_sec = Math.ceil((diff - diff_min * 1000 * 60) / 1000);
    }
    if (diff_min < 10) {
        diff_min = "0" + diff_min;
    }
    if (diff_sec < 10) {
        diff_sec = "0" + diff_sec;
    }

    if (SpeedTest && diff > 1000 * 60) {
        clearInterval(IntervalT);
        clearInterval(IntervalM);

        ShowConclusion();
    }

    counter_time.innerHTML = diff_min + ":" + diff_sec;
}

// ----------------------------------------------------------------------------

function ShowCounter() {
    var counter_erro = ById("counter_erro");
    if (counter_erro == null) return;
    var counter_wpmi = ById("counter_wpmi");
    if (counter_wpmi == null) return;
    if (!SpeedTest) {
        var counter_sign = ById("counter_sign");
        if (counter_sign == null) return;
        var counter_prog = ById("counter_prog");
        if (counter_prog == null) return;
        var counter_accu = ById("counter_accu");
        if (counter_accu == null) return;
    }

    clearInterval(IntervalM);

    var percent = 0;
    if (TotalLength > 0) {
        percent = parseInt((TotalPos / TotalLength) * 100);
    }

    var bad = 0;
    //    if (WordMode) {
    bad = ErrorQty;
    //    } else {
    /*
        for (var i in ProgressBad) {
            bad += ProgressBad[i];
        }
        */
    //    }

    if (Time > 0) {
        var diff = new Date().getTime() - Time.getTime();
        if (diff > 50) {
            var wpm = Math.ceil((TotalPos * 12) / (diff / 1000));
        } else {
            var wpm = 0;
        }
        var diff_min = Math.floor(diff / 1000 / 60);
        var diff_sec = Math.ceil((diff - diff_min * 1000 * 60) / 1000);
    } else {
        var diff = 0;
        var wpm = 0;
        var diff_min = 0;
        var diff_sec = 0;
    }

    var accuracy = 100;
    if (TotalPos > 0) {
        accuracy = Math.round(100 - (bad / TotalPos) * 100);
    }

    counter_erro.innerHTML = bad;
    counter_wpmi.innerHTML = wpm;
    if (!SpeedTest) {
        counter_sign.innerHTML = TotalPos;
        counter_prog.innerHTML = percent + "%";
        counter_accu.innerHTML = accuracy + "%";
    }

    IntervalM = setInterval(ShowCounter, 3000);
}

function Init(type) {
    Text = Trim(ById("type_text").value).split("¶");
    Text.pop();

    var a;
    var arr = ById("type_keys").value.split("¶");
    for (var i in arr) {
        if (arr[i]) {
            a = arr[i].split(":");
            Keys[a[0]] = a[1].split(";");
        }
    }

    WordMode = type > 5 && type < 11;
    KeyHint = type < 5 || (type > 10 && type < 13);

    TextMode = type > 7 && type < 10;
    SpeedTest = type == 10;
    Numeric = type == 11 || type == 12 || type == 13 || type == 14;

    //    var rep = WordMode ? "\r " : "\r";
    var rep = "\r ";
    for (var i in Text) {
        Text[i] = Text[i].replace(/\\n/g, rep);
    }

    TotalLength = Text.join(WordMode ? " " : "").length;

    if (WordMode) {
        TextDoneArr[0] = "";
    } else {
        TextDoneArr[0] = "";

        ShowNextKey();
    }

    HighlightText();

    document.type_form.type.focus();
}

// ----------------------------------------------------------------------------

function ById(id) {
    return document.getElementById(id);
}

// ----------------------------------------------------------------------------

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

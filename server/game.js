var deck = ["Ac", "Ad", "Ah", "As", "2c", "2d", "2h", "2s", "3c", "3d", "3h", "3s", "4c", "4d", "4h", "4s",
    "5c", "5d", "5h", "5s", "6c", "6d", "6h", "6s", "7c", "7d", "7h", "7s", "8c", "8d", "8h", "8s",
    "9c", "9d", "9h", "9s", "10c", "10d", "10h", "10s", "Jc", "Jd", "Jh", "Js",
    "Qc", "Qd", "Qh", "Qs", "Kc", "Kd", "Kh", "Ks"];
var deckref = ["Ac", "Ad", "Ah", "As", "2c", "2d", "2h", "2s", "3c", "3d", "3h", "3s", "4c", "4d", "4h", "4s",
    "5c", "5d", "5h", "5s", "6c", "6d", "6h", "6s", "7c", "7d", "7h", "7s", "8c", "8d", "8h", "8s",
    "9c", "9d", "9h", "9s", "10c", "10d", "10h", "10s", "Jc", "Jd", "Jh", "Js",
    "Qc", "Qd", "Qh", "Qs", "Kc", "Kd", "Kh", "Ks"];

var field = [];
//var playerhand = { id: "", hand: "" }
var allhand = [];
var returnarray = [];
var playercount = 0;


function addPlayer() {

    //    playerhand["id"] = id;
    //    playerhand["hand"] = hand;
    //    allhand.push(playerhand);
    playercount = playercount + 1;

}

function removePlayer() {

    //    playerhand["id"] = id;
    //    playerhand["hand"] = hand;
    //    allhand.push(playerhand);
    playercount = playercount - 1;

}

function dealHand() {
    console.log('testttt')
    var deckarr = ["Ac", "Ad", "Ah", "As", "2c", "2d", "2h", "2s", "3c", "3d", "3h", "3s", "4c", "4d", "4h", "4s",
        "5c", "5d", "5h", "5s", "6c", "6d", "6h", "6s", "7c", "7d", "7h", "7s", "8c", "8d", "8h", "8s",
        "9c", "9d", "9h", "9s", "10c", "10d", "10h", "10s", "Jc", "Jd", "Jh", "Js", "Qc", "Qd", "Qh", "Qs",
        "Kc", "Kd", "Kh", "Ks"];
    allhand = [];

    for (i = 0; i < playercount.length; i++) {

        var num1 = Math.floor(Math.random() * (deckarr.length - 1));
        var card1 = deckarr[num1];
        deckarr.splice(num1, 1);
        var num2 = Math.floor(Math.random() * (deckarr.length - 1));
        var card2 = deckarr[num2];
        deckarr.splice(num2, 1);

        var hand = [card1, card2];

        allhand.push(hand);
        deck = deckarr;
    }

    field = [];
    returnarray[0] = allhand;
    returnarray[1] = deck;
    returnarray[2] = field;

}


function dealField() {

    var deckarr = deck;
    var num1 = Math.floor(Math.random() * (deckarr.length - 1));
    var card1 = deckarr[num1];
    deckarr.splice(num1, 1);

    var fieldarr = field;
    fieldarr.push(card1);

    field = fieldarr;
    deck = deckarr;

    returnarray[0] = allhand;
    returnarray[1] = deck;
    returnarray[2] = field;

}


module.exports = {
    addPlayer,
    removePlayer,
    dealHand,
    dealField
}

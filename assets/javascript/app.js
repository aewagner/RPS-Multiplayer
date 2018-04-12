$(document).ready(function () {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyBBFZ4JBwbg5UiYKQQZjjppFKV05IifNyU",
        authDomain: "rps-multiplayer-1215f.firebaseapp.com",
        databaseURL: "https://rps-multiplayer-1215f.firebaseio.com",
        projectId: "rps-multiplayer-1215f",
        storageBucket: "rps-multiplayer-1215f.appspot.com",
        messagingSenderId: "485631953624"
    };
    firebase.initializeApp(config);

    const database = firebase.database();

    const playersRef = database.ref("/players");
    const connectedRef = database.ref(".info/connected");

    let playerOne = "";
    let playerTwo = "";
    let p1Wins = 0;
    let p2Wins = 0;
    let p1Losses = 0;
    let p2Losses = 0;
    let count = 0;


    // Add ourselves to presence list when online.
    connectedRef.on('value', function (snap) {

        // If they are connected..
        if (snap.val()) {

            // Add user to the connections list.
            var con = playersRef.push(true);

            // Remove user from the connection list when they disconnect.
            con.onDisconnect().remove();
        }
    });


    $('#username-button').on('click', function () {
        event.preventDefault();

        console.log('click');

        if (count === 1) {

            playerTwo = $('#username-input').val().trim();
            console.log(playerTwo);
    
            $('#player-name').html(playerTwo);
            $('#player-turn').text(`${playerTwo} it's your turn!`);
        
        }

        else if (count === 0) {
            
            
            playerOne = $('#username-input').val().trim();
            console.log(playerOne);
    
            $('#player-name').html(playerOne);
            $('#player-turn').text(`${playerOne} it's your turn!`);


        }

    });


    playersRef.on('value', function (snapshot) {

        console.log('numChildren', snapshot.numChildren());
        
        if (snapshot.numChildren() === 1 && snapshot.child('1').exists()) {
          count++;
          console.log(count);
        }
        // else if (snapshot.numChildren() === 0 ) { 
        //     database.ref('/players/1').set({
        //         name: playerOne,
        //         wins: p1Wins,
        //         losses: p1Losses 
        //       });
        // }

    });



    console.log('hi');
});
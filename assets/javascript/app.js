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
    const guestRef = database.ref('/guests');
    const connectionsRef = database.ref("/connections");
    const connectedRef = database.ref(".info/connected");

    let playerOne = "";
    let playerTwo = "";
    let youAre = "";
    let p1Wins = 0;
    let p2Wins = 0;
    let p1Losses = 0;
    let p2Losses = 0;
    let numPlayers = 0;
    const initialTurn = 1;
    let turn = initialTurn;
    let choice = "";
    let guestCount = 0;


    playersRef.on('value', (snap) => {

        if (snap.numChildren() === 1) {

            if (snap.child('p1').exists()) {

                $('.rps-choice').empty();
                $('#result-card').empty();
                $('.player-two-empty').empty();
                // $('#player-two-score').empty();
                $('#player-two-username').text(`Waiting for Player 2`);
            }

            else {
                $('.rps-choice').empty();
                $('#result-card').empty();
                $('.player-one-empty').empty();
                // $('#player-one-score').empty();
                $('#player-one-username').text(`Waiting for Player 1`);
            }


        }

        console.log('SOMETHING HAPPENED');

    });




    $('#username-button').on('click', function () {
        event.preventDefault();

        let player = $('#username-input').val().trim();


        playersRef.once('value').then(function (snapshot) {
            numPlayers = snapshot.numChildren();

            console.log('numPlayers 2', numPlayers);

            if (numPlayers === 0) {

                $('#player-name').text(`Hi ${player}! You are Player 1`);

                // $('#player-two-username').append(`<span>Waiting for Player 2</span>`);

                youAre = "playerOne"

                database.ref('/players/p1').set({
                    username: player,
                    wins: p1Wins,
                    losses: p1Losses
                });



                console.log(`You are: ${youAre}`);
            }

            if (numPlayers === 1 && snapshot.child('p1').exists()) {

                $('#player-name').text(`Hi ${player}! You are Player 2`);

                $('#player-turn').text(`Waiting for ${playerOne} to choose`);

                youAre = "playerTwo"

                database.ref('/players/p2').set({
                    username: player,
                    wins: p2Wins,
                    losses: p2Losses
                });

                database.ref('/turns').set({
                    turn: turn
                });



                console.log(`You are: ${youAre}`);
            }

            if (numPlayers === 1 && snapshot.child('p2').exists()) {

                $('#player-name').text(`Hi ${player}! You are Player 1`);

                youAre = "playerOne"


                database.ref('/players/p1').set({
                    username: player,
                    wins: p1Wins,
                    losses: p1Losses
                });

                database.ref('/turns').set({
                    turn: turn
                });



                console.log(`You are: ${youAre}`);
            }

            if (numPlayers === 2) {
                guestCount++;
                console.log(guestCount);

                $('#player-name').text(`Hi ${player}! the game is full, but you can watch and chat!`);

                youAre = `guest${guestCount}`;
                console.log('TEST You are:', youAre)


                database.ref(`/guests/${youAre}`).set({
                    username: player
                });

                database.ref(`/guests/count`).set({
                    count: guestCount
                });


            }

            connectionTracker(youAre);


        });
    });

    database.ref('/players/p1').on('value', function (snapshot) {
        console.log('Player One Snap', snapshot.val());
        if (snapshot.val()) {
            playerOne = snapshot.val().username;
            p1Wins = snapshot.val().wins;
            p1Losses = snapshot.val().losses;

            $('#player-one-username').html(`<h5>${playerOne}</h5>`);
            $('#player-one-score').html(`Wins: ${p1Wins} Losses: ${p1Losses}`);

            if (snapshot.child('choice').exists()) {
                console.log('fb choice: ', snapshot.val().choice);
                p1Choice = snapshot.val().choice
            }

        }
    });


    database.ref('/players/p2').on('value', function (snapshot) {
        console.log('Player Two Snap', snapshot.val());
        if (snapshot.val()) {
            playerTwo = snapshot.val().username;
            p2Wins = snapshot.val().wins;
            p2Losses = snapshot.val().losses;


            $('#player-two-username').empty();
            $('#player-two-username').html(`<h5>${playerTwo}</h5>`);
            $('#player-two-score').html(`Wins: ${p2Wins} Losses: ${p2Losses}`);

            if (snapshot.child('choice').exists()) {
                console.log('fb choice: ', snapshot.val().choice);
                p2Choice = snapshot.val().choice

                console.log(`${playerOne} chose ${p1Choice} and ${playerTwo} chose ${p2Choice}`);

            }
        }
    });

    database.ref('/turns').on('value', function (snapshot) {
        console.log('NEW TURN');

        if (snapshot.child("turn").exists()) {

            console.log(snapshot.val());

            turn = snapshot.val().turn;

            console.log('Turn updated:', turn);

            console.log(`You are: ${youAre}`);

            turn = snapshot.val().turn;

            $('.rps-choice').empty();

            if (turn === 3) {
                rpsLogic(p1Choice, p2Choice);
            }

            else if (turn === 2) {

                if (youAre === 'playerTwo') {
                    console.log('Player Two its your turn!');

                    $('#player-turn').text(`It's your turn!`);

                    $('#player-two-rock').html('<p class="rps-selection" id="rock" data-value="rock">Rock</p>');

                    $('#player-two-paper').html('<p class="rps-selection" id="paper" data-value="paper">Paper</p>');

                    $('#player-two-scissors').html('<p class="rps-selection" id="scissors" data-value="scissors">Scissors</p>');
                }

                if (youAre === 'playerOne') {
                    $('#player-turn').text(`Waiting for ${playerTwo} to choose`);
                }

            }

            else if (turn === 1) {

                if (youAre === 'playerOne') {
                    console.log('Player One its your turn!');

                    $('#player-turn').text(`It's your turn!`);

                    $('#player-one-rock').html('<p class="rps-selection" id="rock" data-value="rock">Rock</p>');
                    $('#player-one-paper').html('<p class="rps-selection" id="paper" data-value="paper">Paper</p>');
                    $('#player-one-scissors').html('<p class="rps-selection" id="scissors" data-value="scissors">Scissors</p>');
                }

                if (youAre === 'playerTwo') {
                    $('#player-turn').text(`Waiting for ${playerOne} to choose`);
                }



            }

        }

    });

    $(document.body).on('click', '.rps-selection', function () {

        turn++;

        if (youAre === 'playerOne') {
            p1Choice = $(this).attr('data-value');
            console.log(p1Choice);
            database.ref('/players/p1').update({
                choice: p1Choice
            });

            database.ref('/turns').set({
                turn: turn
            });
        }

        if (youAre === 'playerTwo') {
            p2Choice = $(this).attr('data-value');
            console.log(p2Choice);
            database.ref('/players/p2').update({
                choice: p2Choice
            });

            database.ref('/turns').set({
                turn: turn
            });
        }

    });

    playersRef.on('child_removed', function (snapshot) {
        console.log(snapshot.val());

        console.log(`${snapshot.val().username} left the game :(`);

        database.ref('/turns').remove();
    });


    database.ref('/guests/count').on('value', (snap) => {
        if (snap.val()) {
            guestCount = parseInt(snap.val().count);
        }
    });

    guestRef.on('child_removed', function (snapshot) {

        console.log(`${snapshot.val().username} left the game :(`);

    });

    guestRef.on('value', snap => {
        if (snap.numChildren() < 2) {
            database.ref('/guests/count').set({
                count: 0
            });
        }
    });

    function rpsLogic(p1Choice, p2Choice) {



        if ((p1Choice === 'rock') && (p2Choice === 'scissors')) {
            p1Wins++;
            p2Losses++;

            $('#result-card').html(`<h2>${playerOne} Wins!</h2>`);
            newGame();

        } else if ((p1Choice === 'rock') && (p2Choice === 'paper')) {
            p2Wins++;
            p1Losses++;

            $('#result-card').html(`<h2>${playerTwo} Wins!</h2>`);
            newGame();

        } else if ((p1Choice === 'scissors') && (p2Choice === 'rock')) {
            p2Wins++;
            p1Losses++;
            newGame();

            $('#result-card').html(`<h2>${playerTwo} Wins!</h2>`);

        } else if ((p1Choice === 'scissors') && (p2Choice === 'paper')) {
            p1Wins++;
            p2Losses++;

            $('#result-card').html(`<h2>${playerOne} Wins!</h2>`);
            newGame();

        } else if ((p1Choice === 'paper') && (p2Choice === 'rock')) {
            p1Wins++;
            p2Losses++;

            $('#result-card').html(`<h2>${playerOne} Wins!</h2>`);
            newGame();


        } else if ((p1Choice === 'paper') && (p2Choice === 'scissors')) {
            p2Wins++;
            p1Losses++;

            $('#result-card').html(`<h2>${playerTwo} Wins!</h2>`);
            newGame();

        } else if (p1Choice === p2Choice) {
            console.log('tie');
            newGame();
        }

        database.ref('players/p1').update({
            wins: p1Wins,
            losses: p1Losses
        })

        database.ref('players/p2').update({
            wins: p2Wins,
            losses: p2Losses
        })



    }


    function newGame() {
        console.log('new game');
        database.ref('/turns').set({
            turn: initialTurn
        });

    }


    function connectionTracker(p) {
        console.log(`guest count in tracker ${guestCount}`);
        let fbPath = "";

        switch (p) {
            case 'playerOne':
                fbPath = '/players/p1';
                break;
            case 'playerTwo':
                fbPath = '/players/p2';
                break;
            case `guest${guestCount}`:
                fbPath = `/guests/guest${guestCount}`;
                break;

            default:
                break;
        }

        console.log('Path 1', fbPath);

        connectedRef.on("value", function (snap) {

            // If they are connected..
            if (snap.val()) {

                console.log('Path 2', fbPath);
                // Add user to the connections list.
                var con = connectionsRef.push(true);

                // Remove user from the connection list when they disconnect.

                con.onDisconnect().remove();
                database.ref(fbPath).onDisconnect().remove(() => {
                    console.log(`${p} disconnected`);

                });


            }
        });


    }




});
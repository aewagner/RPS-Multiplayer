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
    let messageCount = 0;
    let myUsername = "";
    let guestId = "";
    // let disconnectedUser = "";


    $('.card').hide();

    //TRACKING EVERYTHING ////////////////////////////////////////////////////////////////
    database.ref('/').on('value', snap => {
        // console.log(`***GLOBAL SNAP****`, snap.val());

        if (snap.child('guests').exists() && snap.child('chat').exists() && snap.numChildren() === 2 && snap.val().guests.count.count === 0) {
            database.ref('/chat').remove();
            $('.chat-message').empty();
        }

    });



    //TRACKING NUMBER OF PLAYERS /////////////////////////////////////////////////////////
    playersRef.on('value', (snap) => {

        if (snap.numChildren() === 1) {

            if (snap.child('p1').exists()) {

                $('.rps-choice').empty();
                $('#result-card-body').empty();
                $('.player-two-empty').empty();
                // $('#player-two-score').empty();
                $('#player-two-username').text(`Waiting for Player 2`);

                if (myUsername && youAre !== 'playerOne') {
                    $('#player-two-rock').append(`<button type="button" class="btn btn-outline-primary join-game-button text-center" id="jg-button">Join Game!</button>`);
                }

            }

            else {
                $('.rps-choice').empty();
                $('#result-card-body').empty();
                $('.player-one-empty').empty();
                // $('#player-one-score').empty();
                $('#player-one-username').text(`Waiting for Player 1`);

                if (myUsername && youAre !== 'playerTwo') {
                    $('#player-one-rock').append(`<button type="button" class="btn btn-outline-primary join-game-button text-center" id="jg-button">Join Game!</button>`);
                }
            }


        }

        else if (snap.numChildren() === 0) {
            console.log('All Gone')
            $('.rps-choice').empty();
            $('#result-card-body').empty();
            $('.player-two-empty').empty();
            $('.rps-choice').empty();
            $('#result-card-body').empty();
            $('.player-one-empty').empty();
        }

        // console.log('SOMETHING HAPPENED');

    });


    // CLICK EVENT FOR ADDING NEW PLAYERS ////////////////////////////////////////////////

    $('#username-button').on('click', function () {
        event.preventDefault();

        let player = $('#username-input').val().trim();

        $('.card').show();

        myUsername = player;

        playersRef.once('value').then(function (snapshot) {
            numPlayers = snapshot.numChildren();

            // console.log('numPlayers 2', numPlayers);

            if (numPlayers === 0) {

                $('#player-name').text(`Hi ${player}! You are Player 1`);

                // $('#player-two-username').append(`<span>Waiting for Player 2</span>`);

                youAre = "playerOne"

                database.ref('/players/p1').set({
                    username: player,
                    wins: 0,
                    losses: 0
                });



                // console.log(`You are: ${youAre}`);
            }

            if (numPlayers === 1 && snapshot.child('p1').exists()) {

                $('#player-name').text(`Hi ${player}! You are Player 2`);

                $('#player-turn').text(`Waiting for ${playerOne} to choose`);

                youAre = "playerTwo"

                database.ref('/players/p2').set({
                    username: player,
                    wins: 0,
                    losses: 0
                });

                database.ref('/turns').set({
                    turn: turn
                });



                // console.log(`You are: ${youAre}`);
            }

            if (numPlayers === 1 && snapshot.child('p2').exists()) {

                $('#player-name').text(`Hi ${player}! You are Player 1`);

                youAre = "playerOne"


                database.ref('/players/p1').set({
                    username: player,
                    wins: 0,
                    losses: 0
                });

                database.ref('/turns').set({
                    turn: turn
                });



                // console.log(`You are: ${youAre}`);
            }

            if (numPlayers === 2) {
                guestCount++;
                // console.log(guestCount);

                $('#player-name').text(`Hi ${player}! the game is full, but you can watch and chat!`);

                youAre = `guest${guestCount}`;
                guestId = `guest${guestCount}`;
                // console.log('TEST You are:', youAre)


                database.ref(`/guests/${youAre}`).set({
                    username: player
                });

                database.ref(`/guests/count`).set({
                    count: guestCount
                });


            }

            connectionTracker(youAre);



            $('#chat-box').html(`<div class="row justify-content-center">
            <div class="col-xs-10 col-sm-10 col-md-8">
                <div class="card" id="chat-card">
                    <div class="card-body" id="chat-card-body">
                    </div>
                </div>

            </div>
        </div>
        <div class="row justify-content-center">
            <div class="col-xs-10 col-sm-10 col-md-8">
                <form id="chat-form">
                    <div class="input-group mb-3">
                        <input type="text" class="form-control" placeholder="Message" aria-label="Message" aria-describedby="basic-addon2" id="chat-message">
                        <div class="input-group-append">
                            <button class="btn btn-outline-secondary" type="submit" id="chat-button">Send</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>`);


            database.ref('/chat').push({
                message: `${myUsername} has joined the chat`,
                sender: 'Chatbot'
            })

        });
    });

    // CLICK EVENT TO JOIN GAME ///////////////////////////////////////////////////////////

    $(document.body).on('click', '.join-game-button', function () {
        joinGame();
    });

    // TRACKING PLAYER ONE ///////////////////////////////////////////////////////////////

    database.ref('/players/p1').on('value', function (snapshot) {
        // console.log('Player One Snap', snapshot.val());
        if (snapshot.val()) {
            playerOne = snapshot.val().username;
            p1Wins = snapshot.val().wins;
            p1Losses = snapshot.val().losses;

            $('#player-two-card').css('border', '1px solid gray');
            $('#player-one-card').css('border', '1px solid gray');
            $('#player-one-username').html(`<h5>${playerOne}</h5>`);
            $('#player-one-score').html(`Wins: ${p1Wins} Losses: ${p1Losses}`);

            if (snapshot.child('choice').exists()) {
                // console.log('fb choice: ', snapshot.val().choice);
                p1Choice = snapshot.val().choice
            }

        }
    });

    // TRACKING PLAYER TWO////////////////////////////////////////////////////////////////

    database.ref('/players/p2').on('value', function (snapshot) {
        // console.log('Player Two Snap', snapshot.val());
        if (snapshot.val()) {
            playerTwo = snapshot.val().username;
            p2Wins = snapshot.val().wins;
            p2Losses = snapshot.val().losses;


            $('#player-two-username').empty();
            $('#player-two-username').html(`<h5>${playerTwo}</h5>`);
            $('#player-two-score').html(`Wins: ${p2Wins} Losses: ${p2Losses}`);

            if (snapshot.child('choice').exists()) {
                // console.log('fb choice: ', snapshot.val().choice);
                p2Choice = snapshot.val().choice

                // console.log(`${playerOne} chose ${p1Choice} and ${playerTwo} chose ${p2Choice}`);

            }
        }
    });

    // TRACKING NUMBER OF TURNS //////////////////////////////////////////////////////////

    database.ref('/turns').on('value', function (snapshot) {
        // console.log('NEW TURN');

        if (snapshot.child("turn").exists()) {

            // console.log(snapshot.val());

            turn = snapshot.val().turn;

            // console.log('Turn updated:', turn);

            // console.log(`You are: ${youAre}`);

            turn = snapshot.val().turn;

            $('.rps-choice').empty();

            if (turn === 3) {
                if (youAre === 'playerTwo') {
                    $('#player-two-paper').html(`<h2>${p2Choice.toUpperCase()}</h2>`);
                }
                else if (youAre !== 'playerOne' && youAre !== 'playerTwo') {
                    $('#player-two-paper').html(`<h2>${p2Choice.toUpperCase()}</h2>`);
                    $('#player-one-paper').html(`<h2>${p1Choice.toUpperCase()}</h2>`);
                }

                // rpsGif();

                // setTimeout(() => {
                //     rpsLogic(p1Choice, p2Choice);
                // }, 7000); 

                rpsLogic(p1Choice, p2Choice);

            }

            else if (turn === 2) {

                $('#player-two-card').css('border', '5px solid lightskyblue');
                $('#player-one-card').css('border', '1px solid gray');

                if (youAre === 'playerTwo') {
                    // console.log('Player Two its your turn!');

                    $('#player-turn').text(`It's your turn!`);

                    $('#player-two-rock').html('<p class="rps-selection" id="rock" data-value="rock">Rock</p>');

                    $('#player-two-paper').html('<p class="rps-selection" id="paper" data-value="paper">Paper</p>');

                    $('#player-two-scissors').html('<p class="rps-selection" id="scissors" data-value="scissors">Scissors</p>');
                }

                if (youAre === 'playerOne') {
                    $('#player-turn').text(`Waiting for ${playerTwo} to choose`);
                    $('#player-one-paper').html(`<h2>${p1Choice.toUpperCase()}</h2>`);
                }

    

            }

            else if (turn === 1) {

                $('#player-one-card').css('border', '5px solid lightskyblue');
                $('#player-two-card').css('border', '1px solid gray');

                if (youAre === 'playerOne') {
                    // console.log('Player One its your turn!');
                    

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

    // CLICK EVENT THAT INITIATES GAME LOGIC /////////////////////////////////////////

    $(document.body).on('click', '.rps-selection', function () {

        turn++;

        if (youAre === 'playerOne') {
            p1Choice = $(this).attr('data-value');
            // console.log(p1Choice);
            database.ref('/players/p1').update({
                choice: p1Choice
            });

            database.ref('/turns').set({
                turn: turn
            });
        }

        if (youAre === 'playerTwo') {
            p2Choice = $(this).attr('data-value');
            // console.log(p2Choice);
            database.ref('/players/p2').update({
                choice: p2Choice
            });

            database.ref('/turns').set({
                turn: turn
            });
        }

        

    });

    // CHAT LOGIC ////////////////////////////////////////////////////////////////////////

    $(document.body).on('click', '#chat-button', function () {
        event.preventDefault();
        let message = $('#chat-message').val().trim();

        database.ref('/chat').push({
            message: message,
            sender: myUsername
        })

        $('#chat-message').val('');

    });


    database.ref('/chat').on('child_added', snap => {
        let newMessage = snap.val().message;
        let newSender = snap.val().sender;

        $('#chat-card-body').append(`<p class="chat-message from-${newSender}">${newSender}:  ${newMessage}</p>`);

        $(`.from-${myUsername}`).css('color', 'blue');
        $('.from-Chatbot').css('width', '100%');
        $('.from-Chatbot').css('background-color', 'rgb(199, 199, 199)');

    });


    // TRACKING WHEN A PLAYER DISCONNECTS ////////////////////////////////////////////////

    playersRef.on('child_removed', function (snapshot) {
        // console.log(snapshot.val());

        // console.log(`${snapshot.val().username} left the game :(`);

        let disconnectedUser = snapshot.val().username;

        database.ref('/turns').remove();

        database.ref(`/chat/${disconnectedUser}`).set({
            message: `${disconnectedUser} has disconnected`,
            sender: 'Chatbot'
        });

    });

    // playersRef.on('child_added', snap => {
    //     database.ref('/chat').once('value', snap => {
    //         if (snap.child(myUsername).exists()){
    //             database.ref(`/chat/${myUsername}`).set({
    //                 message: `${disconnectedUser}" has joined the game`,
    //                 sender: 'Chatbot'
    //             });
    //         }
    //     });
    // });

    // TRACKING THE GUEST COUNT //////////////////////////////////////////////////////////


    database.ref('/guests/count').on('value', (snap) => {
        if (snap.val()) {
            guestCount = parseInt(snap.val().count);
        }
    });

    guestRef.on('value', snap => {
        if (snap.numChildren() < 2) {
            database.ref('/guests/count').set({
                count: 0
            });
        }
    });

    // TRACKING WHEN A GUEST LEAVES //////////////////////////////////////////////////////

    guestRef.on('child_removed', function (snapshot) {

        // console.log(`${snapshot.val().username} left the game :(`);

        let disconnectedUser = snapshot.val().username;


        database.ref(`/chat/${disconnectedUser}`).set({
            message: `${disconnectedUser} has disconnected`,
            sender: 'Chatbot'
        });

    });


    // ROCK PAPER SCISSORS GAME LOGIC ////////////////////////////////////////////////////
    function rpsLogic(p1Choice, p2Choice) {



        if ((p1Choice === 'rock') && (p2Choice === 'scissors')) {
            p1Wins++;
            p2Losses++;

            $('#result-card-body').html(`<h2 class ="align-items-center" id="result-id">${playerOne} Wins!</h2>`);

            updateWinLoss();
            newGame();
        } else if ((p1Choice === 'rock') && (p2Choice === 'paper')) {
            p2Wins++;
            p1Losses++;

            $('#result-card-body').html(`<h2 class ="align-items-center" id="result-id">${playerTwo} Wins!</h2>`);

            updateWinLoss();
            newGame();
        } else if ((p1Choice === 'scissors') && (p2Choice === 'rock')) {
            p2Wins++;
            p1Losses++;

            updateWinLoss();
            newGame();
            $('#result-card-body').html(`<h2 class ="align-items-center" id="result-id">${playerTwo} Wins!</h2>`);

        } else if ((p1Choice === 'scissors') && (p2Choice === 'paper')) {
            p1Wins++;
            p2Losses++;

            $('#result-card-body').html(`<h2 class ="align-items-center" id="result-id">${playerOne} Wins!</h2>`);

            updateWinLoss();
            newGame();
        } else if ((p1Choice === 'paper') && (p2Choice === 'rock')) {
            p1Wins++;
            p2Losses++;

            $('#result-card-body').html(`<h2 class ="align-items-center" id="result-id">${playerOne} Wins!</h2>`);

            updateWinLoss();
            newGame();

        } else if ((p1Choice === 'paper') && (p2Choice === 'scissors')) {
            p2Wins++;
            p1Losses++;

            $('#result-card-body').html(`<h2 class ="align-items-center" id="result-id">${playerTwo} Wins!</h2>`);

            updateWinLoss();
            newGame();
        } else if (p1Choice === p2Choice) {
            $('#result-card-body').html(`<h2 class ="align-items-center" id="result-id">Tie Game...</h2>`);

            updateWinLoss();
        }   newGame();



    }


    // STARTING A NEW GAME ///////////////////////////////////////////////////////////////

    function newGame() {
        // console.log('new game');
        database.ref('/turns').set({
            turn: initialTurn
        });

    }

    function updateWinLoss() {
        
        database.ref('players/p1').update({
            wins: p1Wins,
            losses: p1Losses,
            choice: ""
        })

        database.ref('players/p2').update({
            wins: p2Wins,
            losses: p2Losses,
            choice: ""
        })
    }

    // TRACKING ALL CONNECTIONS ///////////////////////////////////////////////////////// 

    function connectionTracker(p) {
        // console.log(`guest count in tracker ${guestCount}`);
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

        // console.log('Path 1', fbPath);

        connectedRef.on("value", function (snap) {

            // If they are connected..
            if (snap.val()) {

                // console.log('Path 2', fbPath);
                // Add user to the connections list.
                var con = connectionsRef.push(true);

                // Remove user from the connection list when they disconnect.

                con.onDisconnect().remove();
                database.ref(fbPath).onDisconnect().remove();


            }
        });


    }


    function joinGame() {

        let player = myUsername;

        playersRef.once('value').then(function (snapshot) {
            numPlayers = snapshot.numChildren();

            // console.log('numPlayers 2', numPlayers);

            if (numPlayers === 0) {

                $('#player-name').text(`Hi ${player}! You are Player 1`);

                // $('#player-two-username').append(`<span>Waiting for Player 2</span>`);


                database.ref('/players/p1').set({
                    username: player,
                    wins: 0,
                    losses: 0
                });

                database.ref(`guests/${youAre}`).remove();

                youAre = "playerOne"


                playerOneGameRender();
                newGame();
            }

            if (numPlayers === 1 && snapshot.child('p1').exists()) {

                $('#player-name').text(`Hi ${player}! You are Player 2`);

                $('#player-turn').text(`Waiting for ${playerOne} to choose`);


                database.ref('/players/p2').set({
                    username: player,
                    wins: 0,
                    losses: 0
                });

                database.ref('/turns').set({
                    turn: turn
                });

                database.ref(`guests/${youAre}`).remove();

                youAre = "playerTwo"


                playerTwoGameRender();
                newGame();
            }

            if (numPlayers === 1 && snapshot.child('p2').exists()) {

                $('#player-name').text(`Hi ${player}! You are Player 1`);


                database.ref('/players/p1').set({
                    username: player,
                    wins: 0,
                    losses: 0
                });

                database.ref('/turns').set({
                    turn: turn
                });

                database.ref(`guests/${youAre}`).remove();

                youAre = "playerOne"


                playerOneGameRender();
                newGame();

            }

            connectionTracker(youAre);

        });
    }

    function playerOneGameRender() {


        $('#player-turn').text(`It's your turn!`);

        $('#player-one-rock').html('<p class="rps-selection" id="rock" data-value="rock">Rock</p>');
        $('#player-one-paper').html('<p class="rps-selection" id="paper" data-value="paper">Paper</p>');
        $('#player-one-scissors').html('<p class="rps-selection" id="scissors" data-value="scissors">Scissors</p>');


    }

    function playerTwoGameRender() {

        $('#player-turn').text(`It's your turn!`);

        $('#player-two-rock').html('<p class="rps-selection" id="rock" data-value="rock">Rock</p>');

        $('#player-two-paper').html('<p class="rps-selection" id="paper" data-value="paper">Paper</p>');

        $('#player-two-scissors').html('<p class="rps-selection" id="scissors" data-value="scissors">Scissors</p>');


    }

    // function rpsGif() {
    //     // Storing our giphy API URL for a random rps image
    //   var queryURL = "https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=rock-paper-scissors";

    //   // Perfoming an AJAX GET request to our queryURL
    //   $.ajax({
    //     url: queryURL,
    //     method: "GET"
    //   })

    //   // After the data from the AJAX request comes back
    //   .done(function(response) {

    //     // Saving the image_original_url property
    //     var imageUrl = response.data.image_original_url;

    //     // Creating and storing an image tag
    //     var rpsImage = $("<img class='img-fluid' id='rps-gif'>");

    //     // Setting the rpsImage src attribute to imageUrl
    //     rpsImage.attr("src", imageUrl);
    //     rpsImage.attr("alt", "rps image");

    //     // Prepending the rpsImage to the images div
    //     $("#result-card-body").append(rpsImage);
    //   });
    // }




});
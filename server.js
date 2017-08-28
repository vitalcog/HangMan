const express = require('express');
const mustache = require('mustache-express');
const session = require('express-session');
const fs = require('fs');

const server = express();

//    ---   |||   ---   |||   ---   |||   ---   \\

server.use(session( {
  secret: 'yes',
  resave: false,
  saveUninitialized: true
}));

server.use(express.static('public'));

server.engine('mustache', mustache() );
server.set('views', './templates');
server.set('view engine', 'mustache');

//    ---   |||   ---   |||   ---   |||   ---   \\

const vowels = ['A', 'E', 'I', 'O', 'U', 'Y'];

const nonVowels = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Z'];

const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toUpperCase().split("\n");

let wonGame = 0;

//    ---   |||   ---   |||   ---   |||   ---   \\

server.get('/hangman', function (request, response) {

//  ---   creates a session for the mystery words   ---
  if (request.session.display === undefined) {
    let randomWord = words[Math.floor(Math.random() * words.length)];

//    ---   properties of the session object    ---
    request.session.display = [];
    request.session.counter = 8;
    request.session.guessed = [];
//    ---   ^ properties of the session object ^   ---

    for(let i = 0; i < randomWord.length; i++){
      request.session.display.push( {
        letter: randomWord[i],
        visible: false
      });
    }
  }
//  ---   ^ creates a session for the mystery word ^  ---

console.log(request.session.display);
  response.render('hangman', {

    //    creates the buttons w/ stache   \\
    vowels: vowels,
    nonVowels: nonVowels,
    //    ^ creates the buttons w/ stache ^   \\

    lettersGuessed: request.session.guessed,
    mysteryWord: request.session.display,
    letter: request.session.display,
    visible: request.session.display,
    chances: request.session.counter
  });
});


//    ---   |||   ---   This is the You Lost Page   ---   |||   ---   \\
server.get('/youLost', function (request, response) {
  let word = request.session.display;

  request.session.destroy();

  response.render('youLost', {

    //    creates the buttons w/ stache   \\
    vowels: vowels,
    nonVowels: nonVowels,
    //    ^ creates the buttons w/ stache ^   \\

    mysteryWord: word
  });
});


server.get('/youWon', function (request, response) {
  let word = request.session.display;

  request.session.destroy();

  response.render('youWon', {

    //    creates the buttons w/ stache   \\
    vowels: vowels,
    nonVowels: nonVowels,
    //    ^ creates the buttons w/ stache ^   \\

    mysteryWord: word
  });
});

//    ---   |||   ---   |||   ---   |||   ---   \\

server.post('/hangman/:x', function (request, response) {
  request.params.x
  // array indexOf() will help with finding previously guessed letters
  let letterMatch = false;

  for (let i = 0; i < request.session.display.length; i++) {
    if (request.params.x === request.session.display[i].letter) {
      request.session.display[i].visible = true;
      letterMatch = true;
      wonGame ++;
    }
  }

  if (!letterMatch) {
    request.session.counter -= 1;
  }

  if (request.session.counter === 0) {
    return response.redirect('/youLost');
  }

  if (wonGame === request.session.display.length) {
    return response.redirect('/youWon');
  }

  request.session.guessed.push(request.params.x);
  response.redirect('/hangman');
});

server.post('/youLost', function (request, response) {
  response.redirect('/hangman');
});

server.post('/youWon', function (request, response) {
  response.redirect('/hangman');
});


//    ---   |||   ---   |||   ---   |||   ---   \\
server.listen(3000);
//    ---   |||   ---   |||   ---   |||   ---   \\

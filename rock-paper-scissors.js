Matches = new Mongo.Collection("matches");
Chats = new Mongo.Collection("chats");
ROCK_PAPER_SCISSORS_KEY={
    "Rock":{
        "Rock":0,
        "Paper":-1,
        "Scissors":1
    },
    "Paper":{
        "Rock":1,
        "Paper":0,
        "Scissors":-1
    },
    "Scissors":{
        "Rock":-1,
        "Paper":1,
        "Scissors":0
    }
}
player = "Player0";
currentMatch = undefined;

if (Meteor.isClient) {

    currentMatch = Matches.findOne ({$or:[{player1: { $exists: false } },{player2: { $exists: false } }]});

    // This code only runs on the client
    Template.body.helpers({
        history: function () {
            return Matches.find ({$and:[{player1: { $exists: true } }, {player2: { $exists: true } }]}, {sort: {createdAt: -1}});
        },
        chatList: function () {
            return Chats.find({});
        },
        mostRecentMatch: function () {
            return Matches.findOne({$and:[{player1: { $exists: true } }, {player2: { $exists: true } }]}, {sort: {createdAt: -1}});
        },
        player: function(){
            return player;
        },
        playerPretty: function(){
            if(player == "player1"){
                return "Player 1";
            }
            else if(player == "player2"){
                return "Player 2";
            }
            return "No one"
        },
        currentMatch: function () {
            var matches =  Matches.find ({$or:[{player1: { $exists: false } },{player2: { $exists: false } }]});

            currentMatch = Matches.findOne ({$or:[{player1: { $exists: false } },{player2: { $exists: false } }]});
            return currentMatch;
        }
    });
    Template.body.events({
        "click .action": function (event) {

            var action = event.target.value;

            if(player === "player1"){
                Matches.update(currentMatch._id, {
                    $set: {player1: action}
                });
            }
            else{
                Matches.update(currentMatch._id, {
                    $set: {player2: action}
                });
            }
        },
        "click .new-game": function (event) {
            var existingMatches =  Matches.findOne ({$or:[{player1: { $exists: false } },{player2: { $exists: false } }]});
            if(!existingMatches){
                Matches.insert({createdAt:new Date()});
            }
        },
        "click .toggle-history": function (event) {
            if($(".history-container:visible").length >0){
                $(".history-container").hide();
            }
            else{
                $(".history-container").show();
            }

        },
        "click .clear-history": function (event) {
         if($(".confirm-container:visible").length === 0){
             $(".confirm-container").show();
         }

        },
        "click .confirm-clear": function (event) {
            Meteor.call('removeAllMatches');
            $(".confirm-container").hide();
        },
        "click .cancel-clear": function (event) {
            $(".confirm-container").hide();
        },
        "click .chat-submit": function (event) {
            var text = $(".new-chat-value").val();
            Chats.insert({author:player,text:text});
            $(".new-chat-value").val("");
        },
        "click .minimize-chat": function(event) {
            $(".chat-container").hide();
            $(".restore-chat").show();
        },
        "click .restore-chat": function(event) {
            $(".chat-container").show();
            $(".restore-chat").hide();
        }
    });

    Template.registerHelper('formatDate', function(date) {
        return date.toUTCString();
    });
    Template.registerHelper('myTurn', function(player, match) {
        if(!match.player1 && !match.player2){
            return true;
        }
        if(!match.player1 && player === "player1"){
            return true;
        }
        if(!match.player2 && player === "player2"){
            return true;
        }
        return false;
    });
    Template.registerHelper('myChoice', function(match) {
      return myChoice(match);

    });
    Template.registerHelper('hisChoice', function(match) {
        return hisChoice(match);

    });
    Template.registerHelper('resultWin', function(match) {
        return rockPaperScissors(myChoice(match), hisChoice(match)) === 1;

    });
    Template.registerHelper('resultLoss', function(match) {
        return rockPaperScissors(myChoice(match), hisChoice(match)) === -1;

    });
    Template.registerHelper('prettyResult', function(match) {
        var result = rockPaperScissors(myChoice(match), hisChoice(match));
        if(result === 0){
            return "You Tied!";
        }
        if(result === 1){
            return "You Won!";
        }
        if(result === -1){
            return "You Lost!";
        }
        return "??";
    });
}
var myChoice = function(match){
    if(player == "player1"){
        return match.player1
    }
    else if(player == "player2"){
        return match.player2
    }
    return undefined;
}
var hisChoice = function(match){
    if(player == "player1"){
        return match.player2
    }
    else if(player == "player2"){
        return match.player1
    }
    return undefined;

}
var rockPaperScissors = function(action1, action2){
    if(ROCK_PAPER_SCISSORS_KEY[action1] !==undefined){
        if(ROCK_PAPER_SCISSORS_KEY[action1][action2] !==undefined){
            return ROCK_PAPER_SCISSORS_KEY[action1][action2];
        }
    }
    return undefined;
}


FlowRouter.route('/:playerName', {
    action: function(params) {
        player=params.playerName
    }
});

if (Meteor.isServer) {
    Meteor.startup(function() {
        return Meteor.methods({
            removeAllMatches: function() {
                return Matches.remove({});
            }

        });

    });

}
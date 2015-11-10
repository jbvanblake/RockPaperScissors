Matches = new Mongo.Collection("matches");
player = 0
currentMatch = undefined


if (Meteor.isClient) {

    currentMatch = Matches.findOne ({$or:[{player1: { $exists: false } },{player2: { $exists: false } }]});

    // This code only runs on the client
    Template.body.helpers({
        history: function () {
            return Matches.find ({$and:[{player1: { $exists: true } }, {player2: { $exists: true } }]});
        },
        player: function(){
            return player;
        },
        currentMatch: function () {
            currentMatch = Matches.findOne ({$or:[{player1: { $exists: false } },{player2: { $exists: false } }]})
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
            Matches.insert({createdAt:new Date()});
        }
    });

    Template.registerHelper('formatDate', function(date) {
        return date.toUTCString();
    });
    Template.registerHelper('myTurn', function(player, match) {
        if(!match.player1 && match.player2){
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
}

FlowRouter.route('/player1', {
    action: function() {
        player="player1"
    }
});
FlowRouter.route('/player2', {
    action: function() {
        player="player2"
    }
});

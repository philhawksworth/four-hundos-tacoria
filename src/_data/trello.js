const fetch = require('node-fetch');

// Get any environment variables we need
// With public fallbacks for happier onboarding
require('dotenv').config();
const {
  TRELLO_BOARD_URL,
  BRANCH } = process.env;

// A little helper to format strings as PascalCase
const toPascalCase = (str) => {
  return str.toLowerCase().replace(/(?:(^.)|(\s+.))/g, match => {
    return match.charAt(match.length-1).toUpperCase();
  });
}


module.exports = () => {

  // Fetch the JSON data about this board
  return fetch(TRELLO_BOARD_URL + '.json')
    .then(res => res.json())
    .then(json => {

      // construct an object to contain the cards in each active list
      let listObject = {};
      // No archived lists, thanks
      const activeLists = json.lists.filter(list => {
        return !list.closed;
      });
      activeLists.forEach(list => {
        listObject[toPascalCase(list.name)] = {
          "idList": list.id,
          "cards": []
        }
      });

      // Just focus on the cards which do not have a closed status
      let contentCards = json.cards.filter(card => {
        return !card.closed;
      });

      // only include cards labelled with "live" or with
      // the name of the branch we are in
      let contextCards = contentCards.filter(card => {
        return card.labels.filter(label => (
          label.name.toLowerCase() == 'live' ||
          label.name.toLowerCase() == BRANCH
        )).length;
      });

      // enrich and organise cards into an object of lists so we
      // can address the cards in our templates with: trello.ListNameInPascalCase.cards
      contextCards.forEach(card => {
        // If a card has an attachment, add it as an image in the descriotion markdown
        if(card.attachments.length) {
          card.name = "";
          card.desc = card.desc + `\n![${card.name}](${card.attachments[0].url} '${card.name}')`;
        }
        // put this card into the right place in our object so we can
        // access by list names when we use the data
        let listName = Object.keys(listObject).find(key => listObject[key].idList === card.idList);
        listObject[listName].cards.push(card);
      });

      // return our data
      return listObject;
  });
};

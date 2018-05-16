'use strict';

const Client = require('node-rest-client').Client;

const urlPattern = 'https://owlbot.info/api/v2/dictionary/{WORD}?format=json';
const wordPlaceholder = '{WORD}';


const handleQuery = (botRs, callback) => {
    fetchWordMeaning(
        botRs.result.parameters.query,
        botRs.result.fulfillment.speech,
        meaning => callback(meaning[0].toUpperCase() + meaning.slice(1)))
};

const fetchWordMeaning = (word, defaultMeaning, callback) => {
    if (word.indexOf(' ') !== -1) {
        callback(defaultMeaning);
        return;
    }

    const url = urlPattern.replace(wordPlaceholder, word.toLowerCase());
    const client = new Client(url);

    client.get(url, (data) => {
        let meaning = defaultMeaning;
        if (!!data && !!data.length) {
            const i = Math.floor(Math.random() * data.length);
            meaning = `The ${data[i].type} ${word} means ${data[i].definition}`;
        }
        callback(meaning);
    })
};


module.exports = map => {
    map['api.search-for'] = handleQuery;
};
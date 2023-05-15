const PORT = 8000
const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const cors = require('cors')
const language = require('@google-cloud/language');
const languageClient = new language.LanguageServiceClient();
const app = express()
app.use(cors())

const projectId = "repproject"
const url = 'https://www.theguardian.com/uk'

app.get('/', function (req, res) {
    res.json('This is my webscraper')
})

app.get('/results', (req, res) => {
    axios(url)
    .then(async response => {
        const html = response.data
        const $ = cheerio.load(html)
        const articles = []
        let titles = ""
        $('.fc-item__title', html).each(function() {
            const title = $(this).text()
            const url = $(this).find('a').attr('href')
            articles.push({
                title, 
                url
            })
            titles = titles + title + "."
        })
        console.log(titles);
        const document = {
            content: titles,
            type: 'PLAIN_TEXT',
        };
        const [result] = await languageClient.analyzeSentiment({document});

        const sentences = result.sentences;
        sentences.forEach(sentence => {
        console.log(`Sentence: ${sentence.text.content}`);
        console.log(`  Score: ${sentence.sentiment.score}`);
        console.log(`  Magnitude: ${sentence.sentiment.magnitude}`);
        res.json(articles)
});
    }).catch(err => console.log(err))
})


app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))
const { TwitterApi } = require('twitter-api-v2');
const axios = require('axios');
var OAuth = require('oauth');
const  OpenAI  = require("openai");
const consumer_key = '<YOUR_KEY>';
const consumer_secret = "<YOUR_KEY>";
const openaiApiKey = "<YOUR_KEY>";
const access_token='<YOUR_KEY>';
const access_token_secret='<YOUR_KEY>';

const options = {
  method: 'GET',
  url: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/news/list',
  params: {
    category: 'generalnews',
    region: 'US'
  },
  headers: {
    'X-RapidAPI-Key': '<YOUR_KEY>',
    'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
  }
};
const userClient = new TwitterApi({
  appKey: consumer_key,
  appSecret: consumer_secret,
  accessToken: access_token,
  accessSecret: access_token_secret,
});

const openai = new OpenAI({apiKey: openaiApiKey});
async function getArticle(){
  let response
  try {
     response = await axios.request(options);
    
  } catch (error) {
    console.error(error);
  }
  console.log(response.data.items.result[0].title)
 
  return response.data.items.result[0];
}
const runPrompt = async (help) => {

	const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: `Create tweet based on this:  ${help.summary.toString()} and write it in other words` }],
    model: 'gpt-3.5-turbo',
    
  });
  
  return completion.choices[0].message.content;
  
};



async function postTweet(tweetText,help) {
  const url =help.main_image.original_url.toString() ;

  const downStream = await axios({
    method: 'GET',
    responseType: 'arraybuffer',
    url: url,
  }).catch(function (error) {
    res.send({error:error});
  });
  
  const mediaId=await userClient.v1.uploadMedia(downStream.data,{mimeType: 'jpg'});
  await userClient.v2.tweet(
    {text:tweetText.toString(),
    media:{
      media_ids:[mediaId]
    }}
  );
  
  
}
async function runBot(){
  const help=await getArticle();
  const text=await runPrompt(help);
   postTweet(text,help);

  }
 

  runBot();

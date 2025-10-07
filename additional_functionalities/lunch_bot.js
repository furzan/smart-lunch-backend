const { WebClient } = require('@slack/web-api');
async function sendmessage(message){
   
    try {
        const webclient = new WebClient(process.env.SLACK_BOT_TOKEN)
        const result = await webclient.chat.postMessage({
            text: message,
            channel: process.env.SLACK_CHANNEL_ID,
        })
        console.log('message sent to slack.')
    } catch (error) {
        console.log('error ouccered while sending message to slack\n' + error)
    }

}



module.exports = { sendmessage }
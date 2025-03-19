# Search Lead Bot

## Description

This bot allows you to monitor groups for keywords appearing in messages and notify and give you a link to the message with the keyword.

## Live Demo

The bot is currently running and can be tested. You can interact with the bot by visiting the following link:  
[Try the Search Lead Bot](https://t.me/search_lead_bot)

## Installation

To install and run the bot, follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/mahhis/search-lead-bot.git
    ```

2. Navigate to the project folder:

    ```bash
    cd search-lead-bot
    ```

3. Launch the [mongo database](https://www.mongodb.com/) locally

4. Create a `.env` file and add the necessary environment variables. Example at `.env.example`.

5. Install dependencies using Yarn:

    ```bash
    yarn install
    ```
6. To start the bot, run the following command::

    ```bash
    yarn start
    ```    

## Environment variables

- `TOKEN` — Telegram bot token
- `MONGO`— URL of the mongo database
- `API_HASH` - go to https://my.telegram.org/apps and get it 
- `API_ID` - go to https://my.telegram.org/apps and get it 

- `SESSION` - After receiving the ID and Hash, run the startClient file

    ```bash
    node src/startClient.js
    ```   
   then go through the authorization and the value SESSION will appear in the console   
  
     







Discord Auto-Reply Self-Bot
An automated Discord self-bot that responds to direct messages with customizable replies.

⚠️ Disclaimer
This is a self-bot that automates a user account. Using self-bots violates Discord's Terms of Service and may result in account termination. Use at your own risk and consider using an alternative account for testing.

Features
🤖 Automatic replies to DMs
⏱️ Natural response delays with randomization
🛡️ Rate limiting and safety measures
🎯 Keyword triggers and filtering
📊 Built-in statistics and monitoring
🌐 Web dashboard for status monitoring
☁️ Cloud deployment ready (Railway, Heroku, etc.)
Quick Deploy to Railway
Show Image

Manual Setup
1. Clone the Repository
bash
git clone https://github.com/yourusername/discord-auto-reply-bot.git
cd discord-auto-reply-bot
npm install
2. Get Your Discord Token
Open Discord in your browser
Press F12 to open Developer Tools
Go to the Network tab
Send any message in Discord
Look for XHR requests and find the authorization header
Copy the token (usually starts with "mfa.")
3. Configure Environment Variables
Create a .env file or set these environment variables:

env
# Required
DISCORD_TOKEN=your_discord_token_here

# Optional Configuration
AUTO_REPLY_MESSAGE=Thanks for your message! I'll get back to you soon. 🤖
RESPONSE_DELAY=3000
RANDOM_DELAY_RANGE=2000
MAX_REPLIES_PER_HOUR=30
ACTIVE_HOUR_START=9
ACTIVE_HOUR_END=22
ONLY_FIRST_MESSAGE=true
IGNORE_BOTS=true

# Cloud deployment
PORT=3000
KEEP_ALIVE=true
NODE_ENV=production

# Optional: Comma-separated lists
KEYWORD_TRIGGERS=help,support,urgent
BLACKLISTED_USERS=user_id_1,user_id_2
WHITELISTED_USERS=user_id_1,user_id_2
4. Run Locally
bash
# Development
npm run dev

# Production
npm start
Railway Deployment
Method 1: One-Click Deploy
Click the "Deploy on Railway" button above
Connect your GitHub account
Set your environment variables in Railway dashboard
Deploy!
Method 2: Manual Deploy
Create a new Railway project
Connect your GitHub repository
Set environment variables in Railway dashboard:
DISCORD_TOKEN: Your Discord user token
KEEP_ALIVE: Set to true
Add any other configuration variables
Deploy
Environment Variables
Variable	Description	Default	Required
DISCORD_TOKEN	Your Discord user token	-	✅
AUTO_REPLY_MESSAGE	Message to auto-reply with	"Thanks for your message!..."	❌
RESPONSE_DELAY	Base delay before responding (ms)	3000	❌
RANDOM_DELAY_RANGE	Additional random delay (ms)	2000	❌
MAX_REPLIES_PER_HOUR	Maximum auto-replies per hour	30	❌
ACTIVE_HOUR_START	Start of active hours (24h format)	9	❌
ACTIVE_HOUR_END	End of active hours (24h format)	22	❌
ONLY_FIRST_MESSAGE	Only reply once per user	true	❌
IGNORE_BOTS	Ignore messages from bots	true	❌
KEYWORD_TRIGGERS	Comma-separated trigger words	-	❌
BLACKLISTED_USERS	Comma-separated user IDs to ignore	-	❌
WHITELISTED_USERS	Comma-separated user IDs to only reply to	-	❌
PORT	Port for web server	3000	❌
KEEP_ALIVE	Enable web server for cloud hosting	false	❌
Monitoring
When deployed with KEEP_ALIVE=true, the bot exposes these endpoints:

GET / - Bot status and statistics
GET /health - Health check endpoint
Safety Features
Rate limiting: Maximum replies per hour to avoid spam detection
Time restrictions: Only active during specified hours
Natural delays: Random delays to simulate human behavior
Blacklist/Whitelist: Control who can trigger auto-replies
Keyword filtering: Only respond to messages containing specific words
Persistent data: Remembers users already replied to across restarts
Contributing
Fork the repository
Create a feature branch
Make your changes
Test thoroughly
Submit a pull request
License
MIT License - see LICENSE file for details.

Support
If you encounter issues:

Check the logs for error messages
Verify your Discord token is correct
Ensure all required environment variables are set
Check Discord's current ToS regarding automated accounts
Remember: This violates Discord's Terms of Service. Use responsibly and at your own risk.


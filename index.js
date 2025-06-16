// index.js - Main self-bot file
const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');

// Load configuration from environment variables or config file
const config = {
    token: process.env.DISCORD_TOKEN || require('./config.json').token,
    autoReplyMessage: process.env.AUTO_REPLY_MESSAGE || '**AI RESPONSE** **if female** are you messaging me to work? if so are you willing to verify on cam and how far can you go **OTHER INQUIRES** ill be with you soon',
    
    // Response settings
    responseDelay: parseInt(process.env.RESPONSE_DELAY) || 3000,
    randomDelayRange: parseInt(process.env.RANDOM_DELAY_RANGE) || 2000,
    
    // Control settings
    onlyFirstMessage: process.env.ONLY_FIRST_MESSAGE !== 'false',
    ignoreBots: process.env.IGNORE_BOTS !== 'false',
    keywordTriggers: process.env.KEYWORD_TRIGGERS ? process.env.KEYWORD_TRIGGERS.split(',') : [],
    
    // Safety settings
    maxRepliesPerHour: parseInt(process.env.MAX_REPLIES_PER_HOUR) || 30,
    enabledHours: {
        start: parseInt(process.env.ACTIVE_HOUR_START) || 9,
        end: parseInt(process.env.ACTIVE_HOUR_END) || 22
    },
    
    // Blacklist/Whitelist
    blacklistedUsers: process.env.BLACKLISTED_USERS ? process.env.BLACKLISTED_USERS.split(',') : [],
    whitelistedUsers: process.env.WHITELISTED_USERS ? process.env.WHITELISTED_USERS.split(',') : [],
    
    // Railway/Cloud specific
    port: process.env.PORT || 3000,
    keepAlive: process.env.KEEP_ALIVE === 'true'
};

class SelfBot {
    constructor() {
        this.client = new Client();
        this.repliedUsers = new Set();
        this.replyCount = 0;
        this.startTime = Date.now();
        this.stats = {
            totalMessages: 0,
            totalReplies: 0,
            uptime: 0
        };
        
        // Load persistent data
        this.loadData();
        
        // Set up hourly reset
        this.hourlyReset = setInterval(() => {
            this.replyCount = 0;
            this.saveData();
            console.log('🔄 Hourly reply count reset');
        }, 3600000);
        
        // Save data every 5 minutes
        this.dataSaver = setInterval(() => {
            this.saveData();
        }, 300000);
        
        this.setupEventHandlers();
        this.setupWebServer();
    }
    
    setupEventHandlers() {
        this.client.on('ready', () => {
            console.log(`✅ Self-bot ready! Logged in as ${this.client.user.tag}`);
            console.log(`📱 Connected to ${this.client.guilds.cache.size} servers`);
            console.log(`👥 Can see ${this.client.users.cache.size} users`);
            console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
            this.setStatus();
        });
        
        this.client.on('messageCreate', async (message) => {
            this.stats.totalMessages++;
            await this.handleMessage(message);
        });
        
        this.client.on('error', (error) => {
            console.error('❌ Client error:', error);
        });
        
        // Graceful shutdown
        process.on('SIGINT', this.shutdown.bind(this));
        process.on('SIGTERM', this.shutdown.bind(this));
    }
    
    setupWebServer() {
        if (config.keepAlive) {
            const express = require('express');
            const app = express();
            
            app.get('/', (req, res) => {
                res.json({
                    status: 'online',
                    uptime: Math.floor((Date.now() - this.startTime) / 1000),
                    stats: {
                        ...this.stats,
                        uptime: Math.floor((Date.now() - this.startTime) / 1000),
                        repliesThisHour: this.replyCount,
                        usersRepliedTo: this.repliedUsers.size
                    },
                    config: {
                        maxRepliesPerHour: config.maxRepliesPerHour,
                        activeHours: config.enabledHours,
                        autoReplyEnabled: true
                    }
                });
            });
            
            app.get('/health', (req, res) => {
                res.json({ 
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    botReady: this.client.readyAt !== null
                });
            });
            
            app.listen(config.port, () => {
                console.log(`🌐 Web server running on port ${config.port}`);
            });
        }
    }
    
    async handleMessage(message) {
        try {
            // Only process DMs
            if (message.channel.type !== 'DM') return;
            
            // Don't reply to our own messages
            if (message.author.id === this.client.user.id) return;
            
            // Check if bot should be ignored
            if (config.ignoreBots && message.author.bot) return;
            
            // Check blacklist
            if (config.blacklistedUsers.includes(message.author.id)) {
                console.log(`⚫ Ignoring blacklisted user: ${message.author.tag}`);
                return;
            }
            
            // Check whitelist (if enabled)
            if (config.whitelistedUsers.length > 0 && !config.whitelistedUsers.includes(message.author.id)) {
                console.log(`⚪ Ignoring non-whitelisted user: ${message.author.tag}`);
                return;
            }
            
            // Check if we've already replied to this user
            if (config.onlyFirstMessage && this.repliedUsers.has(message.author.id)) {
                console.log(`⏭️ Already replied to ${message.author.tag}`);
                return;
            }
            
            // Rate limiting
            if (this.replyCount >= config.maxRepliesPerHour) {
                console.log(`⏸️ Rate limit reached (${config.maxRepliesPerHour}/hour)`);
                return;
            }
            
            // Time-based filtering
            if (!this.isActiveHour()) {
                console.log(`🌙 Outside active hours (${config.enabledHours.start}-${config.enabledHours.end})`);
                return;
            }
            
            // Keyword filtering (if enabled)
            if (config.keywordTriggers.length > 0) {
                const hasKeyword = config.keywordTriggers.some(keyword => 
                    message.content.toLowerCase().includes(keyword.toLowerCase())
                );
                if (!hasKeyword) {
                    console.log(`🔍 No trigger keywords found in message from ${message.author.tag}`);
                    return;
                }
            }
            
            console.log(`📩 Processing DM from ${message.author.tag}: "${message.content}"`);
            
            // Calculate delay (base + random)
            const baseDelay = config.responseDelay;
            const randomDelay = Math.random() * config.randomDelayRange;
            const totalDelay = baseDelay + randomDelay;
            
            console.log(`⏱️ Waiting ${Math.round(totalDelay/1000)}s before replying...`);
            
            // Wait before responding
            await this.sleep(totalDelay);
            
            // Send the auto-reply
            await this.sendAutoReply(message);
            
        } catch (error) {
            console.error('❌ Error handling message:', error);
        }
    }
    
    async sendAutoReply(message) {
        try {
            // Simulate typing
            await message.channel.sendTyping();
            await this.sleep(1000 + Math.random() * 2000);
            
            // Send reply
            await message.channel.send(config.autoReplyMessage);
            
            // Update tracking
            this.repliedUsers.add(message.author.id);
            this.replyCount++;
            this.stats.totalReplies++;
            
            console.log(`✅ Auto-replied to ${message.author.tag} (${this.replyCount}/${config.maxRepliesPerHour} this hour)`);
            
            // Save updated data
            this.saveData();
            
        } catch (error) {
            console.error('❌ Failed to send auto-reply:', error);
        }
    }
    
    isActiveHour() {
        const currentHour = new Date().getHours();
        return currentHour >= config.enabledHours.start && currentHour <= config.enabledHours.end;
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    setStatus() {
        this.client.user.setPresence({
            status: 'idle',
            activities: [{
                name: 'Auto-Reply Active',
                type: 'PLAYING'
            }]
        });
    }
    
    loadData() {
        try {
            const dataPath = path.join(__dirname, 'data.json');
            if (fs.existsSync(dataPath)) {
                const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                this.repliedUsers = new Set(data.repliedUsers || []);
                this.stats = { ...this.stats, ...data.stats };
                console.log('📂 Loaded persistent data');
            }
        } catch (error) {
            console.log('📂 No existing data file, starting fresh');
        }
    }
    
    saveData() {
        try {
            const data = {
                repliedUsers: Array.from(this.repliedUsers),
                stats: {
                    ...this.stats,
                    uptime: Math.floor((Date.now() - this.startTime) / 1000)
                },
                lastSaved: new Date().toISOString()
            };
            
            fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('❌ Failed to save data:', error);
        }
    }
    
    shutdown() {
        console.log('\n🛑 Shutting down self-bot...');
        this.saveData();
        clearInterval(this.hourlyReset);
        clearInterval(this.dataSaver);
        this.client.destroy();
        process.exit(0);
    }
}

// Initialize and start
const selfBot = new SelfBot();

selfBot.client.login(config.token).catch(error => {
    console.error('❌ Failed to login:', error);
    console.log('Make sure your DISCORD_TOKEN environment variable is set correctly.');
    process.exit(1);
});

import 'dotenv/config'; 
import { env } from 'node:process';
import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import { TournamentService } from './services/TournamentService.js';
import { TournamentManager } from './managers/TournamentManager.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MessageFlags } from 'discord.js';
import { NotificationService } from './services/NotificationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

const tournamentService = new TournamentService();
const notificationService = new NotificationService(tournamentService);
const tournamentManager = new TournamentManager(tournamentService, notificationService);

client.tournamentManager = tournamentManager;
client.commands = new Collection();

// Объявляем массив для данных команд
const commandsData: any[] = [];

const userCommandsPath = path.join(__dirname, 'commands/user');
const adminCommandsPath = path.join(__dirname, 'commands/admin');
const userCommandFiles = fs.readdirSync(userCommandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
const adminCommandFiles = fs.readdirSync(adminCommandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of userCommandFiles) {
    const filePath = path.join(userCommandsPath, file);
    const module = await import(filePath);
    const command = module.command;
    
    if (command && 'data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commandsData.push(command.data.toJSON());
        console.log(`Загружена команда: /${command.data.name}`);
    }
}

for (const file of adminCommandFiles) {
    const filePath = path.join(adminCommandsPath, file);
    const module = await import(filePath);
    const command = module.command;
    
    if (command && 'data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commandsData.push(command.data.toJSON());
        console.log(`Загружена команда: /${command.data.name}`);
    }
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Ошибка при выполнении команды /${interaction.commandName}:`, error);

        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ 
                    content: 'Произошла ошибка при выполнении команды!', 
                    flags: MessageFlags.Ephemeral 
                });
            } else {
                await interaction.reply({ 
                    content: 'Произошла ошибка при выполнении команды!', 
                    flags: MessageFlags.Ephemeral 
                });
            }
        } catch (e) {
            console.error('Не удалось отправить сообщение об ошибке пользователю:', e);
        }
    }
});

client.once('clientReady', async () => {
    console.log(`Бот ${client.user?.tag} успешно запущен!`);

    const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN!);

    try {
        console.log('Начало обновления application (/) команд...');

        await rest.put(
            Routes.applicationGuildCommands(env.CLIENT_ID!, env.GUILD_ID!),
            { body: commandsData },
        );

        console.log('✅ Успешно зарегистрированы команды на сервере!');
    } catch (error) {
        console.error('❌ Ошибка при регистрации команд:', error);
    }
});

client.login(env.DISCORD_TOKEN);
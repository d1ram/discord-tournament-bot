import { Collection } from 'discord.js';
import { TournamentManager } from './managers/TournamentManager.js';

declare module 'discord.js' {
    interface Client {
        tournamentManager: TournamentManager;
        commands: Collection<string, any>;
    }
}
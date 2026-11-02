import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

export const command = {
    data: new SlashCommandBuilder()
        .setName('overview')
        .setDescription('Показать текущую сетку турнира'),
    
    async execute(interaction: CommandInteraction) {
        const overviewText = interaction.client.tournamentManager.getTournamentOverview();
        
        await interaction.reply({
            content: overviewText,
            ephemeral: false
        });
    }
};
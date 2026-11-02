import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export const command = {
    data: new SlashCommandBuilder()
        .setName('match')
        .setDescription('Показать информацию о матче по его ID')
        .addStringOption(opt => opt.setName('match_id').setDescription('ID матча (например, match-1)').setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction) {
        const matchId = interaction.options.getString('match_id', true);
        const matchInfoText = interaction.client.tournamentManager.getMatchStrById(matchId);

        await interaction.reply({
            content: matchInfoText,
            ephemeral: false
        });
    }
};
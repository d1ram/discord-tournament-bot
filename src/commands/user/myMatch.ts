import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';

export const command = {
    data: new SlashCommandBuilder()
        .setName('mymatch')
        .setDescription('Показать мой текущий матч.'),
    
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const overviewText = interaction.client.tournamentManager.getCurrentPlayerMatch(interaction.user.id);
        
        await interaction.editReply({
            content: overviewText || 'Информация о вашем матче не найдена.'
        });
    }
};
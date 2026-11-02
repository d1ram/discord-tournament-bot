import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';

export const command = {
    data: new SlashCommandBuilder()
        .setName('players')
        .setDescription('Показать список всех зарегистрированных участников турнира'),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const playersText = interaction.client.tournamentManager.getPlayers();

        if (!playersText || playersText.trim() === '') {
            await interaction.editReply({ 
                content: 'ℹ️ В турнире пока нет зарегистрированных игроков.' 
            });
            return;
        }

        // Защита от превышения лимита Discord (2000 символов)
        if (playersText.length > 1900) {
            await interaction.editReply({ 
                content: `📋 **Список игроков:**\n\`\`\`text\n${playersText.slice(0, 1850)}\n...\n(список слишком длинный)\`\`\`` 
            });
        } else {
            await interaction.editReply({ 
                content: `📋 **Список игроков турнира:**\n\`\`\`text\n${playersText}\`\`\`` 
            });
        }
    }
};
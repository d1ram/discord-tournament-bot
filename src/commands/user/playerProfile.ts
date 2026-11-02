import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export const command = {
    data: new SlashCommandBuilder()
        .setName('player')
        .setDescription('Показать турнирный профиль игрока')
        .addUserOption(opt => opt.setName('target').setDescription('Пользователь (по умолчанию — вы)')),

    async execute(interaction: ChatInputCommandInteraction) {
        const target = interaction.options.getUser('target') || interaction.user;
        const playerStr = interaction.client.tournamentManager.getPlayerByIdStr(target.id);

        await interaction.reply({
            content: playerStr,
            ephemeral: false
        });
    }
};
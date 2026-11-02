import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';

export const command = {
    isAdminOnly: true,
    data: new SlashCommandBuilder()
        .setName('add-player')
        .setDescription('[Админ] Добавить игрока в сетку турнира')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Выберите пользователя Discord')
                .setRequired(true)
        )
        .addStringOption(opt => opt.setName('nickname').setDescription('Турнирный никнейм').setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user', true);
        const nickname = interaction.options.getString('nickname', true);

        const success = interaction.client.tournamentManager.registerPlayer(
            targetUser.id,
            nickname
        );

        if (success) {
            await interaction.reply({
                content: `✅ Игрок <@${targetUser.id}> (${targetUser.username}) успешно зарегистрирован в турнире!`,
                ephemeral: false
            });
        } else {
            await interaction.reply({
                content: `❌ Не удалось зарегистрировать игрока <@${targetUser.id}>. Возможно, он уже добавлен или достигнут лимит.`,
                ephemeral: true
            });
        }
    }
};
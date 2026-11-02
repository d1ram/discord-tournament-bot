import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';

export const command = {
    isAdminOnly: true,
    data: new SlashCommandBuilder()
        .setName('remove-player')
        .setDescription('[Админ] Удалить игрока.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Выберите пользователя Discord')
                .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const targetUser = interaction.options.getUser('user', true);

        const success = interaction.client.tournamentManager.removePlayer(
            targetUser.id
        );

        if (success) {
            await interaction.reply({
                content: `✅ Игрок <@${targetUser.id}> (${targetUser.username}) успешно удален!`,
                ephemeral: false
            });
        } else {
            await interaction.reply({
                content: `❌ Не удалось удалить игрока <@${targetUser.id}>. Возможно, такой игрок не зарегистрирован на турнире.`,
                ephemeral: true
            });
        }
    }
};
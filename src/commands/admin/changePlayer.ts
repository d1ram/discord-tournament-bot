import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags } from 'discord.js';

export const command = {
    isAdminOnly: true,
    data: new SlashCommandBuilder()
        .setName('change-player')
        .setDescription('[Админ] Изменить данные существующего игрока')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(opt => opt.setName('old_user').setDescription('Текущий пользователь в сетке').setRequired(true))
        .addUserOption(opt => opt.setName('new_user').setDescription('Новый пользователь (или тот же)').setRequired(true))
        .addStringOption(opt => opt.setName('new_nickname').setDescription('Новый турнирный никнейм').setRequired(true)),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const oldUser = interaction.options.getUser('old_user', true);
        const newUser = interaction.options.getUser('new_user', true);
        const newNickname = interaction.options.getString('new_nickname', true);

        const success = interaction.client.tournamentManager.changePlayer(oldUser.id, newUser.id, newNickname);

        if (success) {
            await interaction.editReply({ content: `✅ Данные игрока успешно обновлены на <@${newUser.id}> (${newNickname}).` });
        } else {
            await interaction.editReply({ content: `❌ Не удалось изменить игрока. Проверьте правильность ID.` });
        }
    }
};
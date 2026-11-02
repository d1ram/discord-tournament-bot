import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags } from 'discord.js';

export const command = {
    isAdminOnly: true,
    data: new SlashCommandBuilder()
        .setName('start-tournament-std')
        .setDescription('[Админ] Запустить турнир и сгенерировать сетку матчей')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const success = interaction.client.tournamentManager.startTournamentStd(interaction.client);

        if (success) {
            await interaction.editReply({ content: '✅ Турнир успешно запущен! Сетка матчей сформирована.' });
        } else {
            await interaction.editReply({ content: '❌ Не удалось запустить турнир. Убедитесь, что зарегистрировано достаточно игроков и он еще не запущен.' });
        }
    }
};
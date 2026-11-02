import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags } from 'discord.js';

export const command = {
    isAdminOnly: true,
    data: new SlashCommandBuilder()
        .setName('tournament-control')
        .setDescription('[Админ] Управление состоянием турнира (сброс, удаление)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName('reset').setDescription('Сбросить состояние турнира')
        )
        .addSubcommand(sub =>
            sub.setName('delete-matches').setDescription('Удалить только матчи и сетку')
        )
        .addSubcommand(sub =>
            sub.setName('delete-total').setDescription('Полный сброс: удалить матчи и всех игроков')
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const sub = interaction.options.getSubcommand();
        const manager = interaction.client.tournamentManager;

        let success = false;
        let message = '';

        if (sub === 'reset') {
            success = manager.resetTournament();
            message = success ? '🧹 Турнир был полностью сброшен.' : '❌ Ошибка при сбросе турнира.';
        } else if (sub === 'delete-matches') {
            success = manager.deleteTournamentMatches();
            message = success ? '🗑️ Все матчи и сетка удалены.' : '❌ Ошибка при удалении матчей.';
        } else if (sub === 'delete-total') {
            success = manager.deleteTournamentTotal();
            message = success ? '🔥 Полный сброс выполнен: матчи и игроки удалены.' : '❌ Ошибка при полном удалении.';
        }

        await interaction.editReply({ content: message });
    }
};
import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags } from 'discord.js';

export const command = {
    isAdminOnly: true,
    data: new SlashCommandBuilder()
        .setName('reset-match-results')
        .setDescription('[Админ] Сбросить результаты (победителя) конкретного матча')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(opt => 
            opt.setName('match_id')
               .setDescription('ID матча (например, match-1)')
               .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const matchId = interaction.options.getString('match_id', true);
        
        // Вызываем твой метод сброса результатов
        const success = interaction.client.tournamentManager.resetMatchResults(matchId);

        if (success) {
            await interaction.editReply({ 
                content: `✅ Результаты матча **${matchId}** успешно сброшены.` 
            });
        } else {
            await interaction.editReply({ 
                content: `❌ Не удалось сбросить результаты. Проверьте правильность ID матча (**${matchId}**).` 
            });
        }
    }
};
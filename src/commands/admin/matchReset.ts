import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags } from 'discord.js';

export const command = {
    isAdminOnly: true,
    data: new SlashCommandBuilder()
        .setName('reset-match')
        .setDescription('[Админ] Сбросить состояние конкретного матча')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(opt => 
            opt.setName('match_id')
               .setDescription('ID матча для сброса (например, match-1)')
               .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const matchId = interaction.options.getString('match_id', true);
        const success = interaction.client.tournamentManager.resetMatch(matchId);

        if (success) {
            await interaction.editReply({ 
                content: `✅ Матч **${matchId}** успешно сброшен.` 
            });
        } else {
            await interaction.editReply({ 
                content: `❌ Не удалось сбросить матч. Проверьте правильность ID (**${matchId}**).` 
            });
        }
    }
};
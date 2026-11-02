import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags } from 'discord.js';

export const command = {
    isAdminOnly: true,
    data: new SlashCommandBuilder()
        .setName('set-winner')
        .setDescription('[Админ] Принудительно установить победителя матча')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(opt => 
            opt.setName('match_id')
               .setDescription('ID матча (например, match-1)')
               .setRequired(true)
        )
        .addUserOption(opt => 
            opt.setName('winner')
               .setDescription('Выберите пользователя, который победил')
               .setRequired(true)
        )
        .addNumberOption(opt => 
            opt.setName('p1_score')
               .setDescription('Счет игрока 1.')
               .setRequired(true)
        )
        .addNumberOption(opt => 
            opt.setName('p2_score')
               .setDescription('Счет игрока 2.')
               .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const matchId = interaction.options.getString('match_id', true);
        const winnerUser = interaction.options.getUser('winner', true);
        const p1_score = interaction.options.getNumber('p1_score', true);
        const p2_score = interaction.options.getNumber('p2_score', true);

        const success = interaction.client.tournamentManager.setWinnerInMatch(matchId, winnerUser.id, p1_score, p2_score);

        if (success) {
            await interaction.editReply({ 
                content: `✅ Победитель матча **${matchId}** успешно установлен: <@${winnerUser.id}>!` 
            });
        } else {
            await interaction.editReply({ 
                content: `❌ Не удалось установить победителя. Проверьте правильность ID матча (${matchId}).` 
            });
        }
    }
};
import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, MessageFlags } from 'discord.js';

export const command = {
    isAdminOnly: false,
    data: new SlashCommandBuilder()
        .setName('send-result')
        .setDescription('Прислать результат боя')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addNumberOption(opt => 
            opt.setName('sender_score')
               .setDescription('Ваш счет.')
               .setRequired(true)
        )
        .addNumberOption(opt => 
            opt.setName('opp_score')
               .setDescription('Счет противника.')
               .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const senderId = interaction.user.id;
        const senderScore = interaction.options.getNumber('sender_score', true);
        const oppScore = interaction.options.getNumber('opp_score', true);

        interaction.client.tournamentManager.sendMatchResultByPlayer(interaction.client, senderId, senderScore, oppScore);

        await interaction.editReply({ 
            content: `👍 Результат отправлен!` 
        });
    }
};
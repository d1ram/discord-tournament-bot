import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
export const command = {
    isAdminOnly: true,
    data: new SlashCommandBuilder()
        .setName('seed')
        .setDescription('[Админ] Загрузить тестовых игроков для проверки')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction: ChatInputCommandInteraction) {
        const manager = interaction.client.tournamentManager;
        const myId = interaction.user.id;
        const myName = interaction.user.username;

        // 1. Добавляем тебя (чтобы работал /mymatch)
        // manager.registerPlayer(myId, myName);

        // 2. Добавляем фейковых игроков для массовки
        const mockPlayers = [
            { id: '111111111111111111', name: 'CyberKnight' },
            { id: '222222222222222222', name: 'NeonSamurai2' },
            { id: '33333', name: 'NeonSamurai3' },
            { id: '444444', name: 'NeonSamurai4' },
            { id: '555555', name: 'NeonSamurai5' },
            { id: '666666', name: 'NeonSamurai6' },
        ];

        let addedCount = 1;
        for (const p of mockPlayers) {
            const success = manager.registerPlayer(p.id, p.name);
            if (success) addedCount++;
        }

        await interaction.reply({
            content: `✅ Тестовые данные загружены!\n- ${addedCount - 1} ботов-участников.\n\nТеперь можешь протестировать \`/mymatch\`!`,
            ephemeral: true
        });
    }
};
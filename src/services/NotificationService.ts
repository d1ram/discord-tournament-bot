import { TextChannel } from "discord.js"
import type { Client, MessageReaction, User } from "discord.js";
import { TournamentService } from "../services/TournamentService.js";
import { MatchStatus, type Score } from "../models/IMatch.js";
import { MATCH_PLAY_TIME, MATCH_PREPARE_TIME, MATCH_RESULT_TIME } from "../models/Time.js";

export class NotificationService {
    private tService : TournamentService | null = null;
    
    constructor(tService : TournamentService) {
        this.tService = tService;
    }

    public scheduleMatchNotifications(client : Client) : boolean {
        const matchesMap = this.tService?.getMatches();
        if (!matchesMap) { console.log('[schedule] нет matchesMap'); return false; }

        const now = Date.now();
        for (const match of matchesMap.values()) {
            if (!match.scheduledAt) { console.log('[schedule] нет scheduledAt', match.matchId); return false; }
            const delay = match.scheduledAt - now;
            console.log(`[schedule] ${match.matchId} delay=${delay}`);

            if (delay > 0) {
                setTimeout(async () => {
                    await this.sendMatchStartNotification(client, match.matchId);
                    await this.sendMatchPrepareNotification(client, match.matchId);
                }, delay);
            } else {
                this.sendMatchStartNotification(client, match.matchId);
            }
        }

        return true;
    }

    private async sendMatchStartNotification(client : Client, matchId : string){
        const match = this.tService?.getMatches()?.get(matchId);
        const channelId = process.env.TOURNAMENT_MATCHES_START_CHANNEL_ID;
        console.log(`[notify] ${matchId}`, {
            found: !!match, p1: match?.firstPlayerId, p2: match?.secondPlayerId, channelId,
        });
        if (!match || !match.firstPlayerId || !match.secondPlayerId) return;
        if (!channelId) return;

        const p1 = match.firstPlayerId;
        const p2 = match.secondPlayerId;

        try {
            const channel = await client.channels.fetch(channelId);
            console.log('[notify] channel:', channel?.constructor.name);
            if (!channelId) return;
            if (channel instanceof TextChannel) {
                await channel.send({
                    content: `🔔 **Внимание!** Следующий матч: \`${matchId}\` скоро начнется!\n<@${p1}> ⚔️ <@${p2}>`,
                    allowedMentions: { users: [p1, p2] },
                });
                this.tService!.changeMatchStatus(matchId, MatchStatus.PREPARE);
            } else {
                console.warn(`Канал с ID ${channelId} не найден или не является текстовым.`);
            }
        } catch (error) {
            console.error(`Не удалось отправить уведомление для матча ${matchId}:`, error);
        } 
    }

    private async sendMatchPrepareNotification(client: Client, matchId: string) {
        const match = this.tService?.getMatches()?.get(matchId);
        const channelId = process.env.TOURNAMENT_MATCHES_PREPARE_CHANNEL_ID;
        
        if (!match || !match.firstPlayerId || !match.secondPlayerId || !channelId) return;

        const p1 = match.firstPlayerId;
        const p2 = match.secondPlayerId;
        const readyEmoji = '⚔️';

        try {
            const channel = await client.channels.fetch(channelId);
            if (!(channel instanceof TextChannel)) return;

            const sentMessage = await channel.send({
                content: `🔔 **Участники матча!** \`${matchId}\`!\n<@${p1}> ⚔️ <@${p2}>\nПросим вас нажать на реакцию ${readyEmoji}, чтобы подтвердить готовность!`,
                allowedMentions: { users: [p1, p2] },
            });

            await sentMessage.react(readyEmoji);

            const requiredPlayers = new Set([p1, p2]);
            const readyPlayers = new Set<string>();

            // 1. ВАЖНО: Игнорируем бота через !user.bot и проверяем, что это один из игроков
            const filter = (reaction: MessageReaction, user: User) => {
                return reaction.emoji.name === readyEmoji && requiredPlayers.has(user.id) && !user.bot;
            };

            const collector = sentMessage.createReactionCollector({ filter, time: MATCH_PREPARE_TIME, dispose: true });

            collector.on('collect', (reaction, user) => {
                readyPlayers.add(user.id);
                console.log(`[ready] Игрок ${user.id} нажал готовность. Всего готово: ${readyPlayers.size}`);
                
                if (readyPlayers.size === requiredPlayers.size) {
                    collector.stop('all_ready');
                }
            });

            collector.on('remove', (reaction, user) => {
                readyPlayers.delete(user.id);
                console.log(`[ready] Игрок ${user.id} убрал реакцию.`);
            });

            collector.on('end', async (_, reason) => {
                // Дополнительная проверка на случай, если к концу таймера оба успели, но событие 'collect' проскочило
                const fetchedMessage = await channel.messages.fetch(sentMessage.id).catch(() => null);
                if (fetchedMessage) {
                    const reaction = fetchedMessage.reactions.cache.get(readyEmoji);
                    if (reaction) {
                        const users = await reaction.users.fetch();
                        users.forEach(u => {
                            if (requiredPlayers.has(u.id)) readyPlayers.add(u.id);
                        });
                    }
                }

                if (reason === 'all_ready' || readyPlayers.size >= requiredPlayers.size) {
                    await channel.send(`✅ Оба игрока подтвердили готовность к матчу \`${matchId}\`!`);
                    await this.sendMatchPlayNotification(client, matchId);
                    this.tService!.changeMatchStatus(matchId, MatchStatus.IN_PROGRESS);
                } else {
                    if (readyPlayers.has(p1) && !readyPlayers.has(p2)) {
                        await channel.send(`⏳ Время ожидания готовности для матча \`${matchId}\` истекло.\n<@${p2}> засчитывается автолуз!`);
                        let score: Score = { firstPlayerScore: 3, secondPlayerScore: 0 };
                        this.tService?.setWinner(matchId, p1, score);
                    } else if (readyPlayers.has(p2) && !readyPlayers.has(p1)) {
                        await channel.send(`⏳ Время ожидания готовности для матча \`${matchId}\` истекло.\n<@${p1}> засчитывается автолуз!`);
                        let score: Score = { firstPlayerScore: 0, secondPlayerScore: 3 };
                        this.tService?.setWinner(matchId, p2, score);
                    } else {
                        await channel.send(`⏳ Время ожидания готовности для матча \`${matchId}\` истекло.\n<@${p1}> и <@${p2}> засчитывается автолуз!`);
                        let score: Score = { firstPlayerScore: 0, secondPlayerScore: 0 };
                        this.tService?.setWinner(matchId, p1, score);
                    }
                }
            });

        } catch (error) {
            console.error(`Не удалось обработать готовность к матчу ${matchId}:`, error);
        } 
    }

    private async sendMatchPlayNotification(client : Client, matchId : string){
        const match = this.tService?.getMatches()?.get(matchId);
        const channelId = process.env.TOURNAMENT_MATCHES_PLAY_CHANNEL_ID;
        console.log(`[notify] ${matchId}`, {
            found: !!match, p1: match?.firstPlayerId, p2: match?.secondPlayerId, channelId,
        });
        if (!match || !match.firstPlayerId || !match.secondPlayerId) return;
        if (!channelId) return;

        const p1 = match.firstPlayerId;
        const p2 = match.secondPlayerId;

        const p1_nickname = this.tService!.getPlayer(p1)?.nickname;
        const p2_nickname = this.tService!.getPlayer(p2)?.nickname;

        try {
            const channel = await client.channels.fetch(channelId);
            console.log('[notify] channel:', channel?.constructor.name);
            if (!channelId) return;
            if (channel instanceof TextChannel) {
                await channel.send({
                    content: `🔔 **Внимание!** Матч \`${matchId}\` начинается!\n<@${p1}> ⚔️ <@${p2}>\nНик <@${p1}> : ${p1_nickname}\nНик <@${p2}> : ${p2_nickname}`,
                    allowedMentions: { users: [p1, p2] },
                });

                setTimeout(async () => {
                const currentMatch = this.tService?.getMatch(matchId);
                
                if (currentMatch && currentMatch.status != MatchStatus.FINISHED) {
                    await channel.send({
                        content: `⚠️ **Внимание, администрация!** Прошло 25 минут с начала матча \`${matchId}\`, но результаты от участников (<@${p1}> и <@${p2}>) так и не поступили через \`/send-result\`. <@${process.env.ADMIN_ROLE_ID}>`,
                        allowedMentions: { users: [p1, p2] }
                    });
                }
            }, MATCH_PLAY_TIME);
            } else {
                console.warn(`Канал с ID ${channelId} не найден или не является текстовым.`);
            }
        } catch (error) {
            console.error(`Не удалось отправить уведомление для матча ${matchId}:`, error);
        } 
    }

    public async sendMatchResultNotification(client : Client, matchId : string, senderId : string, score : Score){
        const match = this.tService?.getMatches()?.get(matchId);
        const channelId = process.env.TOURNAMENT_MATCHES_RESULTS_CHANNEL_ID;
        console.log(`[notify] ${matchId}`, {
            found: !!match, p1: match?.firstPlayerId, p2: match?.secondPlayerId, channelId,
        });
        if (!match || !match.firstPlayerId || !match.secondPlayerId) return ;
        if (!channelId) return ;

        const p1 = match.firstPlayerId;
        const p2 = match.secondPlayerId;

        const acceptEmoji = '✅';
        const rejectEmoji = '❌';

        const recipientId = (p1 === senderId ? p2 : p1);

        const winnerId = (score.firstPlayerScore > score.secondPlayerScore ? p1 : p2);

        try {
            const channel = await client.channels.fetch(channelId);
            console.log('[notify] channel:', channel?.constructor.name);
            if (!channelId) return ;
            if (channel instanceof TextChannel) {
                const sentMessage = await channel.send({
                    content: `🔔 **Результаты!** <@${senderId}> отправил результат матча \`${matchId}\`:\n
                    <@${p1}> ${score.firstPlayerScore} - ${score.secondPlayerScore} <@${p2}>.\n
                    <@${recipientId}> вы согласны?`,
                    allowedMentions: { users: [p1, p2] },
                });

                await sentMessage.react(acceptEmoji);
                await sentMessage.react(rejectEmoji);

                const filter = (reaction: MessageReaction, user: User) => {
                    return (reaction.emoji.name === acceptEmoji || reaction.emoji.name === rejectEmoji) 
                        && user.id === recipientId && !user.bot;
                };
                
                const collector = sentMessage.createReactionCollector({ filter, time: MATCH_RESULT_TIME, dispose: true });

                const userChoices = new Map<string, string>();

                collector.on('collect', (reaction, user) => {
                    if (user.id === recipientId) {
                        userChoices.set(user.id, reaction!.emoji!.name!);

                        if (reaction.emoji.name === acceptEmoji) {
                            collector.stop('agreed');
                        } else if (reaction.emoji.name === rejectEmoji) {
                            collector.stop('rejected');
                        }
                    }
                });

                collector.on('ignore', (r, u) => console.log('[result] ignore', r.emoji.name, u.id));

                collector.on('end', async (collected, reason) => {
                    console.log('[result] end:', reason, 'collected =', collected.size);

                    if (reason === 'agreed') {
                        await channel.send(`✅ Оба игрока согласились об исходе матча \`${matchId}\`!`);
                        this.tService!.setWinner(matchId, winnerId, score);
                    } else if (reason === 'rejected') {
                        await channel.send(`❌ Разногласия по результату матча \`${matchId}\`.`);
                        this.tService!.changeMatchStatus(matchId, MatchStatus.CONFLICT);
                    } else if (reason === 'time') {
                        await channel.send(`⚠️ Время ожидания вышло! Результат принимается! \`${matchId}\`!`);
                        this.tService!.setWinner(matchId, winnerId, score);
                    } else {
                        console.warn('[result] коллектор завершён по другой причине:', reason);
                    }
                });
            } else {
                console.warn(`Канал с ID ${channelId} не найден или не является текстовым.`);
                return false;
            }
        } catch (error) {
            console.error(`Не удалось отправить уведомление для матча ${matchId}:`, error);
            return false;
        } 
    }
}
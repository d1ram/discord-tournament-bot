import type { IPlayer } from "../models/IPlayer.js";
import type { MatchNode } from "../models/MatchNode.js";
import { MatchStatus, type Score } from "../models/IMatch.js";
import { TournamentService } from "../services/TournamentService.js";
import { NotificationService } from "../services/NotificationService.js";
import type { Client } from "discord.js";

export class TournamentManager {
    private tService : TournamentService | null = null;
    private nService : NotificationService | null = null;
    
    constructor(tService : TournamentService, nService : NotificationService) {
        this.tService = tService;
        this.nService = nService;
    }

    public getTournamentOverview(): string {
        let description = "";

        if (this.tService != null)
        {
            const matchesMap = this.tService.getMatches();
            if (matchesMap != null)
            {
                for (const match of matchesMap.values()) {
                    description += this.getMatchStr(match) + "\n";
                }
            } else {
                description = "E : No tournament in the moment!"
            }   
        } else {
            description = "FATAL ERROR : tService does not exist!"
        }

        return description;
    }

    public getMatchStrById(matchId : string): string {
        let matchStr = "";

        if (this.tService != null)
        {
            const match = this.getMatch(matchId);
            if (match != null)
            {
                matchStr += this.getMatchStr(match);
            } else {
                matchStr = "E : No tournament in the moment!"
            }   
        } else {
            matchStr = "FATAL ERROR : tService does not exist!"
        }

        return matchStr;
    }

    public getMatch(matchId : string) : MatchNode | undefined {
        if (this.tService == null) {
            return undefined;
        }
        const matchesMap = this.tService.getMatches();
        if (matchesMap == null) {
            return undefined;
        }
        return matchesMap.get(matchId);
    }

    public getMatchStr(match : MatchNode) : string {
        let matchStr : string = "";
        if (match != undefined) {
            const p1 = match!.firstPlayerId ? `<@${match!.firstPlayerId}>` : 'TBD';
            const p2 = match!.secondPlayerId ? `<@${match!.secondPlayerId}>` : 'TBD';
            const timeStr = match.scheduledAt 
            ? `<t:${Math.floor(match.scheduledAt / 1000)}:f>` : 'Не назначено';
            const winner = match!.winnerId ? `🏆 <@${match!.winnerId}>` : '—';
            
            matchStr += `**${match.matchId}** [${match!.status}]\n`;
            matchStr += `> ${p1} vs ${p2}\n`;
            matchStr += `> 🕒 Время: ${timeStr} |\n`;
            if (match.status === MatchStatus.FINISHED) {
                matchStr += `Счет: <@${p1}> ${match.totalResult?.firstPlayerScore} — ${match.totalResult?.secondPlayerScore} <@${p2}>\n`;
            }
        } else {
            matchStr = "E : Could not find match with that ID!"
        }

        return matchStr;
    }

    public setWinnerInMatch(matchId : string, playerId : string, p1_score : number, p2_score : number) : boolean {
        if (this.tService == null){
            return false;
        }
        const match = this.getMatch(matchId);
        if (match == undefined) {
            return false;
        }

        let score : Score = {
            firstPlayerScore : p1_score,
            secondPlayerScore : p2_score
        }
        
        return this.tService.setWinner(matchId, playerId, score);
    }

    public async sendMatchResultByPlayer(client : Client, senderId : string, senderScore : number, oppScore : number) : boolean {
        if (this.nService != null){
            if (this.tService == null){
            return false;
        }
        const matchId = this.tService.findActiveMatchIdByPlayerId(senderId);
        if (matchId == undefined) {
            return false;
        }

        let match = this.getMatch(matchId);
        let score : Score;

        if (match!.firstPlayerId == senderId){
            score = {
                firstPlayerScore : senderScore,
                secondPlayerScore : oppScore
            }
        } else {
            score = {
                firstPlayerScore : oppScore,
                secondPlayerScore : senderScore
            }
        }
            await this.nService?.sendMatchResultNotification(client, matchId, senderId, score);
            return true;
        }   
    }

    public resetMatchResults(matchId : string) : boolean {
        const match = this.getMatch(matchId);
        if (match == undefined) {
            return false;
        }
        
        match.resetMatchResult();
        return true;
    }

    public resetMatch(matchId : string) : boolean {
        const match = this.getMatch(matchId);
        if (match == undefined) {
            return false;
        }
        
        match.resetMatch();
        return true;
    }

    public resetTournament() : boolean {
        if (this.tService == null){
            return false;
        }

        return this.tService.reset();
    }
    
    public deleteTournamentMatches() : boolean { // delete only matches
        if (this.tService == null){
            return false;
        }

        return this.tService.deleteMatches();
    }
    public deleteTournamentTotal() : boolean { // delete matches and players 
        if (this.tService == null){
            return false;
        }

        return this.tService.deleteTotal();
    }

    public getPlayers() : string | null {
        if (this.tService == null){
            return null;
        }

        const playersMap = this.tService.getPlayers();
        if (playersMap == null){
            return null;
        }

        let players = "";

        for (const [playerId, player] of playersMap.entries()) { 
            players += `PLAYER: ${playerId} ||| TOURNAMENT NICKNAME: ${player.nickname}\n`;
        }

        return players;
    }


    public getPlayerByIdStr(playerId : string) : string {
        let playerStr = "";
        if (this.tService != null){
            let player = this.tService.getPlayer(playerId);
            if (player != undefined) {
                playerStr = `PLAYER: ${playerId} ||| TOURNAMENT NICKNAME: ${player.nickname}`;
            } else {
                playerStr = "E : Could not find player with that Id!";
            }
        } else {
            playerStr = "FATAL ERROR : tService does not exist!";
        }

        return playerStr;
    }

    public changePlayer(oldPlayerId : string, newPlayerId : string, newPlayerNickname: string) : boolean {
        if (this.tService == null){
            return false;
        }

        let player : IPlayer = {
            playerId : newPlayerId,
            nickname : newPlayerNickname
        };

        return this.tService.changePlayer(oldPlayerId, player);
    }

    public getCurrentPlayerMatch(playerId : string) : string {
        let matchStr = "";
        if (this.tService != null){
            const matchesMap = this.tService.getMatches();
            if (matchesMap != null){
                let matchId = this.tService.findActiveMatchIdByPlayerId(playerId);
                if (matchId != undefined) {
                    const match = this.getMatch(matchId);
                    matchStr = this.getMatchStr(match!);
                } else {
                    matchStr = "E : Could not find active match with that player!"
                }
            } else {
                matchStr = "E : No tournament in the moment!"
            }
        } else {
                matchStr = "FATAL ERROR : tService does not exist!";
        }

        return matchStr;
    }

    public registerPlayer(playerId : string, nickname : string) : boolean {
        if (this.tService == null){
            return false;
        }

        let player : IPlayer = {
            playerId : playerId,
            nickname : nickname
        };

        return this.tService.registerPlayer(player);
    }
    
    public removePlayer(playerId : string) : boolean {
        if (this.tService == null){
            return false;
        }

        return this.tService.removePlayer(playerId);
    }

    public startTournamentStd(client: Client): boolean {
        if (this.tService == null || this.nService == null) return false;

        if (!this.tService.init_std()) return false;
        return this.nService.scheduleMatchNotifications(client);
    }
}


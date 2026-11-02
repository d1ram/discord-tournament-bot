import { MatchStatus, type Score } from "../models/IMatch.js";
import type { IPlayer } from "../models/IPlayer.js";
import { MatchNode } from "../models/MatchNode.js";
import { createTournamentTree } from "./CreateTree.js";

export class TournamentService { 
    private matchesMap: Map<string, MatchNode> | null = null;
    private playersMap: Map<string, IPlayer> = new Map();
    private playersCount : number = 0;
    private allowedPlayerCounts = [8, 16, 32];

    private finalMatch: MatchNode | null = null;

    public registerPlayer(player : IPlayer) : boolean{
        if (this.playersMap.has(player.playerId)){
            return false;
        }

        this.playersMap.set(player.playerId, player);
        this.playersCount++;
        return true;
    }

    public findActiveMatchIdByPlayerId(playerId: string): string | undefined { // getMatchID
        if (this.matchesMap == null){
            return undefined;
        }
        for (const match of this.matchesMap.values()){
            if (match.firstPlayerId == playerId && match.status == MatchStatus.IN_PROGRESS ||
                match.secondPlayerId == playerId && match.status == MatchStatus.IN_PROGRESS ){
                    return match.matchId;
                }
            }
        return undefined;
    }

    public removePlayer(playerId : string) : boolean {
        if (this.matchesMap != null){
            return false;
        }
        
        if (!this.playersMap.has(playerId)) {
            return false;
        }
        this.playersMap.delete(playerId);

        return true;
    }

    public changePlayer(oldPlayerId: string, newPlayer : IPlayer) : boolean {
        if (!this.removePlayer(oldPlayerId)){
            return false;
        }
    
        this.playersMap.set(newPlayer.playerId, newPlayer);

        return true;
    }

    public changeMatchStatus(matchId : string, newStatus : MatchStatus) : boolean {
        let match = this.getMatch(matchId);
        if (match == undefined){
            return false;
        }

        match.status = newStatus;
        return true;
    }
    
    public setWinner(matchId : string, winnerId : string, score : Score) : boolean {
        let match = this.getMatch(matchId);
        if (match == undefined) {
            return false;
        }

        return match.setWinner(winnerId, score);
    }
    public getMatches() : Map<string, MatchNode> | null {
        return this.matchesMap;
    }

    public getMatch(matchId : string) : MatchNode | undefined {
        if (this.matchesMap == null){
            return undefined;
        }
        return this.matchesMap.get(matchId);
    }

    public getPlayers() : Map<string, IPlayer> | null {
        return this.playersMap;
    }

    public getPlayer(playerId : string) : IPlayer | undefined {
        return this.playersMap.get(playerId);
    }

    public init_std(): boolean {    
        if (!this.allowedPlayerCounts.includes(this.playersCount)) {
            return false;
        }
        if (this.matchesMap != null) {
            return false;
        } 
        const tree = createTournamentTree(this.playersCount);
        this.finalMatch = tree.root;

        this.matchesMap = new Map(tree.allMatches.map((match : MatchNode) => [match.matchId, match]));

        const shuffledPlayers = [...this.playersMap.keys()].sort(() => Math.random() - 0.5);

        let playerIndex = 0;
        const firstRoundMatchesCount = this.playersCount / 2;

        for (let i = 0; i < firstRoundMatchesCount; i++){
            const matchId = `match_r1_${i}`;
            const match = this.matchesMap.get(matchId);

            if (match) {
                match.firstPlayerId = shuffledPlayers[playerIndex++]!;
                match.secondPlayerId = shuffledPlayers[playerIndex++]!;
                match.status = MatchStatus.PENDING;
            }
        }
        return true;
    }

    public deleteMatches() : boolean { // delete only matches
        if (this.matchesMap == null){
            return false;
        }

        this.matchesMap = null;
        this.finalMatch = null;
        return true;
    }

    public deleteTotal() : boolean { // delete matches and players 
        this.matchesMap = null;
        this.finalMatch = null;
        this.playersMap.clear();
        this.playersCount = 0;

        return true;
    }

    public reset() : boolean {
        if (this.matchesMap == null){
            return false;
        }

        for (const match of this.matchesMap.values()){
            if (match.matchId.startsWith('match_r1_')) {
                match.resetMatchResult(); 
            } else {
                match.resetMatch();
            }
        }

        return true;
    }
}
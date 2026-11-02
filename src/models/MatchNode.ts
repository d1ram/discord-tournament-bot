import { MatchStatus } from "./IMatch.js";
import type { Score } from "./IMatch.js";

export enum MatchSlot {
    LEFT = 'left',
    RIGHT = 'right'
}

export class MatchNode {
    public matchId: string;
    public status: MatchStatus = MatchStatus.PENDING;

    public firstPlayerId: string | null = null;
    public secondPlayerId: string | null = null;
    public winnerId: string | null = null;

    public nextMatch : MatchNode | null = null;
    public slot: MatchSlot | null = null;

    public totalResult: Score | null = null;

    public scheduledAt: number | null = null;

    constructor(matchId: string, nextNode: MatchNode | null = null, slot: MatchSlot | null = null, scheduledAt : number | null = null) {
        this.matchId = matchId;
        this.nextMatch = nextNode;
        this.slot = slot;
        this.scheduledAt = scheduledAt; 
    }

    // public setResultByPlayer(playerId: string, score: Score){
    //     if (playerId == this.firstPlayerId){
    //         this.firstPlayerResult = score;
    //     } else if (playerId == this.secondPlayerId){
    //         this.secondPlayerResult = score;
    //     }

    //     if (this.firstPlayerResult && this.secondPlayerResult) {
    //         const isMatchAgreed = 
    //             this.firstPlayerResult.firstPlayerScore === this.secondPlayerResult.firstPlayerScore &&
    //             this.firstPlayerResult.secondPlayerScore === this.secondPlayerResult.secondPlayerScore;

    //         if (isMatchAgreed) {
    //             this.totalResult = this.firstPlayerResult;
    //             const winnerId = this.totalResult.firstPlayerScore! > this.totalResult.secondPlayerScore! 
    //                 ? this.firstPlayerId! 
    //                 : this.secondPlayerId!;
                    
    //             this.setWinner(winnerId);
    //         } else {
    //             this.status = MatchStatus.CONFLICT;
    //         }
    //     }
    // }

    public setWinner(winnerId: string, score : Score) : boolean{
        if (winnerId === this.firstPlayerId || winnerId === this.secondPlayerId){
            this.winnerId = winnerId;
            this.status = MatchStatus.FINISHED;
            this.totalResult = score;

            if (this.nextMatch != null){
                this.nextMatch.setPlayer(this.winnerId, this.slot!);
            }
            return true;
        }
        return false;
    }

    public resetMatchResult() { // reset results, winner and status.
        this.totalResult = null;
        this.winnerId = null;
        this.status = MatchStatus.IN_PROGRESS;
    }

    public resetMatch() { // Complete reset everything except matchID, slot and nextMatch.
        this.resetMatchResult();
        this.firstPlayerId = null;
        this.secondPlayerId = null;
        this.status = MatchStatus.PENDING;
    }

    public setPlayer(playerId: string, slot: MatchSlot){
        if (slot === MatchSlot.LEFT){
            this.firstPlayerId = playerId;
        } else if (slot === MatchSlot.RIGHT){
            this.secondPlayerId = playerId;
        }

        if (this.firstPlayerId && this.secondPlayerId){
            this.status = MatchStatus.IN_PROGRESS;
        }
    }
}
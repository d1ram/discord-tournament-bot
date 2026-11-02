export enum MatchStatus {
    PENDING = "PENDING",
    PREPARE = "PREPARE",
    IN_PROGRESS = "IN_PROGRESS",
    RESULT_CONFIRMATION = "RESULT_CONFIRMATION",
    FINISHED = "FINISHED",
    CONFLICT = "CONFLICT"
}
export interface Score {
  firstPlayerScore: number;
  secondPlayerScore: number;
}
// export interface IMatch {
//     matchId: string;
//     firstPlayerId: string; // D_ID
//     secondPlayerId: string; // D_ID
//     status: MatchStatus;
//     firstPlayerResult: Score;
//     secondPlayerResult: Score;
//     totalResult: Score;
// }
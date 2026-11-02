// export const MATCH_TIME_MAX : number = (40 * 60 * 1000); // MS
// export const MATCH_PREPARE_TIME : number = (10 * 60 * 1000);// MS
// export const MATCH_PLAY_TIME : number = (25 * 60 * 1000);// MS
// export const MATCH_RESULT_TIME : number = (5 * 60 * 1000);// MS

export const MATCH_PREPARE_TIME : number = (10 * 1000);// MS
export const MATCH_PLAY_TIME : number = (20 * 1000);// MS
export const MATCH_RESULT_TIME : number = (30 * 1000);// MS
export const MATCH_TIME_MAX : number = MATCH_PREPARE_TIME + MATCH_PLAY_TIME + MATCH_RESULT_TIME;

// 10 -> prepare, 25 -> play, 5 -> results
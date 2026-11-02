import { MatchNode, MatchSlot } from "../models/MatchNode.js";
import { MATCH_TIME_MAX } from "../models/Time.js";
const TEST : number = (10 * 1000);

export function createTournamentTree(playerCount: number): { root: MatchNode, allMatches: MatchNode[] } {
    const allMatches: MatchNode[] = [];
    let matchScheduledTime = Date.now() + TEST;
    
    let currentRoundMatchesCount = playerCount / 2;
    
    let previousRoundNodes: MatchNode[] = [];

    for (let i = 0; i < currentRoundMatchesCount; i++) {
        const match = new MatchNode(`match_r1_${i}`);
        allMatches.push(match);
        previousRoundNodes.push(match);
    }

    let roundIndex = 2;
    while (previousRoundNodes.length > 1) {
        const nextRoundNodes: MatchNode[] = [];
        
        for (let i = 0; i < previousRoundNodes.length; i += 2) {
            const parentMatch = new MatchNode(`match_r${roundIndex}_${i / 2}`);
            allMatches.push(parentMatch);


            const leftChild = previousRoundNodes[i];
            leftChild!.nextMatch = parentMatch;
            leftChild!.slot = MatchSlot.LEFT;
            leftChild!.scheduledAt = matchScheduledTime;

            const rightChild = previousRoundNodes[i + 1];
            rightChild!.nextMatch = parentMatch;
            rightChild!.slot = MatchSlot.RIGHT;
            rightChild!.scheduledAt = matchScheduledTime;

            nextRoundNodes.push(parentMatch);
        }

        matchScheduledTime += MATCH_TIME_MAX;
        previousRoundNodes = nextRoundNodes;
        roundIndex++;
    }

    const root = previousRoundNodes[0]!;
    root.scheduledAt = matchScheduledTime + MATCH_TIME_MAX;

    return { root, allMatches };
}
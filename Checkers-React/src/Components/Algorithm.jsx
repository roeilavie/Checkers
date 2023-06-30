import { cloneBoard, getPossibleMoves, executeMove, isGoalState } from "./ServiceFunctions";
export const minimax = (hypotheticalBoard, activePlayer, depth, maxDepth) => {
    let output = [];
    for (let i = 0; i < hypotheticalBoard.length; i++) {
      for (let j = 0; j < hypotheticalBoard[i].length; j++) {
        if (hypotheticalBoard[i][j].indexOf(activePlayer) > -1) {
          let possibleMoves = getPossibleMoves(
            i,
            j,
            hypotheticalBoard,
            activePlayer
          );
          for (let k = 0; k < possibleMoves.length; k++) {
            let tempBoard = cloneBoard(hypotheticalBoard);
            tempBoard[i][j] = "a" + tempBoard[i][j];

            let buildHighlightTag = "h ";
            for (let m = 0; m < possibleMoves[k].wouldDelete.length; m++) {
              buildHighlightTag +=
                "d" +
                String(possibleMoves[k].wouldDelete[m].targetRow) +
                String(possibleMoves[k].wouldDelete[m].targetCell) +
                " ";
            }
            tempBoard[possibleMoves[k].targetRow][possibleMoves[k].targetCell] =
              buildHighlightTag;

            let buildingObject = {
              piece: { targetRow: i, targetCell: j },
              move: possibleMoves[k],
              board: executeMove(
                possibleMoves[k].targetRow,
                possibleMoves[k].targetCell,
                tempBoard,
                activePlayer
              ),
              terminal: null,
              children: [],
              score: 0,
              activePlayer: activePlayer,
              depth: depth,
            };
            //does that move win the game?
            buildingObject.terminal = isGoalState(
              buildingObject.board,
              activePlayer
            );

            if (buildingObject.terminal) {
              //if terminal, score is easy, just depends on who won
              if (activePlayer === 'b') {
                buildingObject.score = 100 - depth;
              } else {
                buildingObject.score = -100 - depth;
              }
            } else if (depth > maxDepth) {
              //don't want to blow up the call stack boiiiiii
              buildingObject.score = 0;
            } else {
              buildingObject.children = minimax(
                buildingObject.board,
                activePlayer === "w" ? "b" : "w",
                depth + 1,
                maxDepth
              );
              //if not terminal, we want the best score from this route (or worst depending on who won)
              let scoreHolder = [];

              for (let l = 0; l < buildingObject.children.length; l++) {
                if (typeof buildingObject.children[l].score !== "undefined") {
                  scoreHolder.push(buildingObject.children[l].score);
                }
              }

              scoreHolder.sort(function (a, b) {
                if (a > b) return -1;
                if (a < b) return 1;
                return 0;
              });

              if (scoreHolder.length > 0) {
                if (activePlayer === "b") {
                  buildingObject.score = scoreHolder[scoreHolder.length - 1];
                } else {
                  buildingObject.score = scoreHolder[0];
                }
              } else {
                if (activePlayer === "b") {
                  buildingObject.score = 100 - depth;
                } else {
                  buildingObject.score = -100 - depth;
                }
              }
            }
            if (activePlayer === "b") {
              for (let n = 0; n < buildingObject.move.wouldDelete.length; n++) {
                if (
                  hypotheticalBoard[
                    buildingObject.move.wouldDelete[n].targetRow
                  ][buildingObject.move.wouldDelete[n].targetCell].indexOf(
                    "k"
                  ) > -1
                ) {
                  buildingObject.score += 25 - depth;
                } else {
                  buildingObject.score += 10 - depth;
                }
              }
              if (
                (JSON.stringify(hypotheticalBoard).match(/k/g) || []).length <
                (JSON.stringify(buildingObject.board).match(/k/g) || []).length
              ) {
                //new king made after this move
                buildingObject.score += 15 - depth;
              }
            } else {
              for (let n = 0; n < buildingObject.move.wouldDelete.length; n++) {
                if (
                  hypotheticalBoard[
                    buildingObject.move.wouldDelete[n].targetRow
                  ][buildingObject.move.wouldDelete[n].targetCell].indexOf(
                    "k"
                  ) > -1
                ) {
                  buildingObject.score -= 25 - depth;
                } else {
                  buildingObject.score -= 10 - depth;
                }
              }
              if (
                (JSON.stringify(hypotheticalBoard).match(/k/g) || []).length <
                (JSON.stringify(buildingObject.board).match(/k/g) || []).length
              ) {
                //new king made after this move
                buildingObject.score -= 15 - depth;
              }
            }
            buildingObject.score += buildingObject.move.wouldDelete.length;
            output.push(buildingObject);
          }
        }
      }
    }

    output = output.sort(function (a, b) {
      if (a.score > b.score) return -1;
      if (a.score < b.score) return 1;
      return 0;
    });
    return output;
  };


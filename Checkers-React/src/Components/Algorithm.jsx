// Importing functions from a module
import { cloneBoard, getPossibleMoves, executeMove, isGoalState } from "./ServiceFunctions";

// Implementation of the minimax algorithm
export const minimax = (hypotheticalBoard, activePlayer, depth, maxDepth) => {
  let output = [];

  // Loop through the board positions
  for (let i = 0; i < hypotheticalBoard.length; i++) {
    for (let j = 0; j < hypotheticalBoard[i].length; j++) {
      // Check if the current position belongs to the active player
      if (hypotheticalBoard[i][j].indexOf(activePlayer) > -1) {
        // Get possible moves for the current position
        let possibleMoves = getPossibleMoves(i, j, hypotheticalBoard, activePlayer);

        // For each move, calculate the heuristic score
        for (let k = 0; k < possibleMoves.length; k++) {
          let tempBoard = cloneBoard(hypotheticalBoard);

          // Update the temporary board with the move
          tempBoard[i][j] = "a" + tempBoard[i][j];
          let buildHighlightTag = "h ";

          // Add highlight tags for the pieces that would be deleted by the move
          for (let m = 0; m < possibleMoves[k].wouldDelete.length; m++) {
            buildHighlightTag += "d" + String(possibleMoves[k].wouldDelete[m].targetRow) +
              String(possibleMoves[k].wouldDelete[m].targetCol) + " ";
          }
          tempBoard[possibleMoves[k].targetRow][possibleMoves[k].targetCol] = buildHighlightTag;

          // Create a board state object
          let boardState = {
            piece: { targetRow: i, targetCol: j },
            move: possibleMoves[k],
            board: executeMove(possibleMoves[k].targetRow, possibleMoves[k].targetCol, tempBoard, activePlayer),
            terminal: null,
            children: [],
            score: 0,
            activePlayer: activePlayer,
            depth: depth,
          };

          // Check if the move wins the game
          boardState.terminal = isGoalState(boardState.board, activePlayer);

          if (boardState.terminal) {
            // Assign a score if the move wins the game
            if (activePlayer === 'b') {
              boardState.score = 100 - depth;
            } else {
              boardState.score = -100 - depth;
            }
          } else if (depth > maxDepth) {
            // Assign a score of 0 if the maximum depth is reached
            boardState.score = 0;
          } else {
            // Recursively call minimax for the next depth level
            boardState.children = minimax(boardState.board, activePlayer === "w" ? "b" : "w", depth + 1, maxDepth);

            // Assign the score based on the child board states
            if (boardState.children.length > 0)
              boardState.score = activePlayer === "b" ? boardState.children[1].score : boardState.children[0].score;
            else
              activePlayer === "b" ? boardState.score = 100 - depth : boardState.score = -100 - depth;
          }

          // Calculate the heuristic score based on the move and update the board state's score
          if (activePlayer === "b") {
            // Add points for eating opponent pieces
            for (let n = 0; n < boardState.move.wouldDelete.length; n++) {
              // 25 points for eating a king piece
              if (hypotheticalBoard[boardState.move.wouldDelete[n].targetRow][boardState.move.wouldDelete[n].targetCol].indexOf("k") > -1)
                boardState.score += 25 - depth;
              // 10 points for eating a regular piece
              else
                boardState.score += 10 - depth;
            }

            // Add points for advancing to a king piece
            if ((JSON.stringify(hypotheticalBoard).match(/k/g) || []).length < (JSON.stringify(boardState.board).match(/k/g) || []).length)
              boardState.score += 15 - depth;

          } else {
            // Subtract points for eating computer pieces
            for (let n = 0; n < boardState.move.wouldDelete.length; n++) {
              // -25 points for eating a king piece
              if (hypotheticalBoard[boardState.move.wouldDelete[n].targetRow][boardState.move.wouldDelete[n].targetCol].indexOf("k") > -1)
                boardState.score -= 25 - depth;
              // -10 points for eating a regular piece
              else
                boardState.score -= 10 - depth;

            }
            // Subtract points for advancing to a king piece against the computer
            if ((JSON.stringify(hypotheticalBoard).match(/k/g) || []).length < (JSON.stringify(boardState.board).match(/k/g) || []).length)
              boardState.score -= 15 - depth;
          }

          // Add the board state to the output array
          boardState.score += boardState.move.wouldDelete.length;
          output.push(boardState);
        }
      }
    }
  }

  // Sort the board states based on score in descending order
  output = output.sort((a, b) => {
    if (a.score > b.score) return -1;
    if (a.score < b.score) return 1;
    return 0;
  });

  // Return the objects with the highest and lowest score
  return [output[0], output[output.length - 1]];
};

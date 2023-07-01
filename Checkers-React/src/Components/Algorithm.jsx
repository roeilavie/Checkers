import { cloneBoard, getPossibleMoves, executeMove, isGoalState } from "./ServiceFunctions";

export const minimax = (hypotheticalBoard, activePlayer, depth, maxDepth) => {
    let output = [];
    for (let i = 0; i < hypotheticalBoard.length; i++) {
      for (let j = 0; j < hypotheticalBoard[i].length; j++) {

        if (hypotheticalBoard[i][j].indexOf(activePlayer) > -1) {
          let possibleMoves = getPossibleMoves(i,j,hypotheticalBoard,activePlayer);

          //For each move calculate the heuristic score
          for (let k = 0; k < possibleMoves.length; k++) {
            let tempBoard = cloneBoard(hypotheticalBoard);
            tempBoard[i][j] = "a" + tempBoard[i][j];
            let buildHighlightTag = "h ";
            for (let m = 0; m < possibleMoves[k].wouldDelete.length; m++) {
              buildHighlightTag += "d" +String(possibleMoves[k].wouldDelete[m].targetRow) + 
              String(possibleMoves[k].wouldDelete[m].targetCol) + " ";
            }
            tempBoard[possibleMoves[k].targetRow][possibleMoves[k].targetCol] = buildHighlightTag;

            let boardState = {
              piece: { targetRow: i, targetCol: j },
              move: possibleMoves[k],
              board: executeMove(possibleMoves[k].targetRow,possibleMoves[k].targetCol,tempBoard,activePlayer),
              terminal: null,
              children: [],
              score: 0,
              activePlayer: activePlayer,
              depth: depth,
            };

            //Does that move win the game?
            boardState.terminal = isGoalState(boardState.board,activePlayer);
            
            if (boardState.terminal) {
              if (activePlayer === 'b') {
                boardState.score = 100 - depth;
              } else {
                boardState.score = -100 - depth;
              }
            }

            else if (depth > maxDepth) {
              boardState.score = 0;
            } 
            
            else {
              boardState.children = minimax(boardState.board,activePlayer === "w" ? "b" : "w",depth + 1,maxDepth);
              if (boardState.children.length > 0)
                boardState.score = activePlayer === "b" ? boardState.children[1].score : boardState.children[0].score; 
              else 
                activePlayer === "b" ? boardState.score = 100 - depth : boardState.score = -100 - depth;
            }

            //Heuristic 
            if (activePlayer === "b") {
              //Dispose a piece from the opponent pieces
              for (let n = 0; n < boardState.move.wouldDelete.length; n++) {
                //25 points for eating king piece
                if (hypotheticalBoard[boardState.move.wouldDelete[n].targetRow][boardState.move.wouldDelete[n].targetCol].indexOf("k") > -1) 
                  boardState.score += 25 - depth;
                //10 points for eating regular piece
                else 
                  boardState.score += 10 - depth;
              }

              //15 points for advancing to king piece
              if ((JSON.stringify(hypotheticalBoard).match(/k/g) || []).length < (JSON.stringify(boardState.board).match(/k/g) || []).length) 
                boardState.score += 15 - depth;
              
            } 
            else {
              //Dispose a piece from the computer pieces
              for (let n = 0; n < boardState.move.wouldDelete.length; n++) {
                //-25 points for eating king piece
                if (hypotheticalBoard[boardState.move.wouldDelete[n].targetRow][boardState.move.wouldDelete[n].targetCol].indexOf("k") > -1) 
                  boardState.score -= 25 - depth;
                //-10 points for eating regular piece
                else 
                  boardState.score -= 10 - depth;
                
              }
              //-15 points for advancing to king piece against the computer
              if ((JSON.stringify(hypotheticalBoard).match(/k/g) || []).length < (JSON.stringify(boardState.board).match(/k/g) || []).length) 
                boardState.score -= 15 - depth;
            }
            boardState.score += boardState.move.wouldDelete.length;
            output.push(boardState);
          }
        }
      }
    }

    //Returning the objects with the highest and the lowest score
    output = output.sort((a, b) => {
      if (a.score > b.score) return -1;
      if (a.score < b.score) return 1;
      return 0;
    });
    return [output[0], output[output.length - 1]];
  };




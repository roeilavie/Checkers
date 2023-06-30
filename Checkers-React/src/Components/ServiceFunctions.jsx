export const cloneBoard = (board) => {
    let output = [];
    for (let i = 0; i < board.length; i++) output.push(board[i].slice(0));
    return output;
  };

export const getPossibleMoves = (rowIndex, colIndex, board, activePlayer) => {
    let possibleMoves = [];
    let verticalDirection = [];
    let horizontalDirection = [1, -1];
    let isKing = board[rowIndex][colIndex].indexOf("k") > -1;

    if (activePlayer === "b") {
      verticalDirection.push(1);
    } else {
      verticalDirection.push(-1);
    }

    if (isKing) {
      verticalDirection.push(verticalDirection[0] * -1);
    }


    for (let j = 0; j < verticalDirection.length; j++) {
        for (let i = 0; i < horizontalDirection.length; i++) {
          const newRow = rowIndex + verticalDirection[j];
          const newCol = colIndex + horizontalDirection[i];
      
          if (
            typeof board[newRow] !== "undefined" &&
            typeof board[newRow][newCol] !== "undefined" &&
            board[newRow][newCol] === "-"
          ) {
            const index = `${newRow}${newCol}`;
            const hasIndex = possibleMoves.some(move => `${move.targetRow}${move.targetCell}` === index);
            if (!hasIndex) {
              possibleMoves.push({
                targetRow: newRow,
                targetCell: newCol,
                wouldDelete: [],
              });
            }
          }
        }
      }
      
    let jumps = getJumps(rowIndex,colIndex,board,verticalDirection[0],[],[],isKing,activePlayer);
    for (let i = 0; i < jumps.length; i++) {
      possibleMoves.push(jumps[i]);
    }
    return possibleMoves;
  };


 export const getJumps = (sourceRowIndex,sourceColIndex,board,verticalDirection,possibleJumps,wouldDelete,isKing,activePlayer) => {
    let jumpFound = false;
    let verticalDirections = [verticalDirection];
    let horizontalDirection = [1, -1];
    if (isKing) {
      verticalDirections.push(verticalDirections[0] * -1);
    }

    for (let k = 0; k < verticalDirections.length; k++) {
        for (let l = 0; l < horizontalDirection.length; l++) {
          const row1 = sourceRowIndex + verticalDirections[k];
          const col1 = sourceColIndex + horizontalDirection[l];
          const row2 = sourceRowIndex + verticalDirections[k] * 2;
          const col2 = sourceColIndex + horizontalDirection[l] * 2;
      
          const isRow1Valid = typeof board[row1] !== "undefined";
          const isCell1Valid = typeof board[row1]?.[col1] !== "undefined";
          const isRow2Valid = typeof board[row2] !== "undefined";
          const isCell2Valid = typeof board[row2]?.[col2] !== "undefined";
      
          const isCell1Opponent = board[row1]?.[col1]?.indexOf(activePlayer === "w" ? "b" : "w") > -1;
          const isCell2Empty = board[row2]?.[col2] === "-";
      
          if (isRow1Valid &&isCell1Valid &&isRow2Valid &&isCell2Valid &&isCell1Opponent &&isCell2Empty) {
            const jumpTarget = String(row2) + String(col2);
            const isJumpTargetNew = !possibleJumps.some(move =>String(move.targetRow) + String(move.targetCell) === jumpTarget);
      
            if (isJumpTargetNew) {
              const tempJumpObject = {
                targetRow: row2,
                targetCell: col2,
                wouldDelete: [
                  {
                    targetRow: row1,
                    targetCell: col1,
                  },
                  ...wouldDelete,
                ],
              };
      
              possibleJumps.push(tempJumpObject);
              jumpFound = true;
            }
          }
        }
      }
      

    if (jumpFound) {
      for (let i = 0; i < possibleJumps.length; i++) {
        let coords = [possibleJumps[i].targetRow, possibleJumps[i].targetCell];
        let children = getJumps(coords[0],coords[1],board,verticalDirection,possibleJumps,possibleJumps[i].wouldDelete,isKing,activePlayer);
        for (let j = 0; j < children.length; j++) {
          if (possibleJumps.indexOf(children[j]) < 0) {
            possibleJumps.push(children[j]);
          }
        }
      }
    }
    return possibleJumps;
  };

  export const isGoalState = (board, activePlayer) => {
    let opponentPlayer = activePlayer === "w" ? "b" : "w";
    let result = true;
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j].indexOf(opponentPlayer) > -1) {
          result = false;
        }
      }
    }
    return result;
  };

export const executeMove = (rowIndex, colIndex, board, activePlayer) => {
    let activePiece;
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j].indexOf("a") > -1) {
          activePiece = board[i][j];
        }
      }
    }

    let deletions = board[rowIndex][colIndex].match(/d\d\d/g);
    if (deletions !== undefined && deletions !== null && deletions.length > 0) {
      for (let k = 0; k < deletions.length; k++) {
        let deleteCoords = deletions[k].replace("d", "").split("");
        board[deleteCoords[0]][deleteCoords[1]] = "-";
      }
    }

    board = board.map((row) =>row.map((cell) => cell.replace(activePiece, "-")));
    board = board.map((row)=> row.map((cell) => cell.replace("h", "-").replace(/d\d\d/g, "").trim()));
    board[rowIndex][colIndex] = activePiece.replace("a", "");
    if (
      (activePlayer === "b" && rowIndex === 7) ||
      (activePlayer === "w" && rowIndex === 0)
    ) {
      board[rowIndex][colIndex] += " k";
    }
    return board;
  };
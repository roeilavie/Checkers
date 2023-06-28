import React, { useState } from "react";
import Row from "./Row";
import Statistics from "./Statistics";
import Popup from "./Popup";

export default function GameBoard() {
  const [board, setBoard] = useState([
    ["b", "-", "b", "-", "b", "-", "b", "-"],
    ["-", "b", "-", "b", "-", "b", "-", "b"],
    ["b", "-", "b", "-", "b", "-", "b", "-"],
    ["-", "-", "-", "-", "-", "-", "-", "-"],
    ["-", "-", "-", "-", "-", "-", "-", "-"],
    ["-", "r", "-", "r", "-", "r", "-", "r"],
    ["r", "-", "r", "-", "r", "-", "r", "-"],
    ["-", "r", "-", "r", "-", "r", "-", "r"],
  ]);
  const [activePlayer, setActivePlayer] = useState("r");
  let aiDepthCutoff = 3;
  let count = 0;
  const [popShown, setPopShown] = useState(false);

  const handlePieceClick = (e) => {
    let rowIndex = parseInt(e.target.attributes["data-row"].nodeValue);
    let cellIndex = parseInt(e.target.attributes["data-cell"].nodeValue);
    let newBoard = [...board];
    let resetActivePlayer = activePlayer;

    if (board[rowIndex][cellIndex].indexOf(activePlayer) > -1) {
      //this is triggered if the piece that was clicked on is one of the player's own pieces, it activates it and highlights possible moves
      newBoard = board.map((row) => row.map((cell) => cell.replace("a", "")));
      //un-activate any previously activated pieces
      newBoard[rowIndex][cellIndex] = "a" + newBoard[rowIndex][cellIndex];
      setBoard(newBoard);
      highlightPossibleMoves(rowIndex, cellIndex);
    } else if (board[rowIndex][cellIndex].indexOf("h") > -1) {
      //this is activated if the piece clicked is a highlighted square, it moves the active piece to that spot.
      newBoard = executeMove(rowIndex, cellIndex, board, activePlayer);
      setBoard(newBoard);
      //is the game over? if not, swap active player
      if (winDetection(board, activePlayer)) {
        console.log(activePlayer + " won the game!");
      } else {
        resetActivePlayer = activePlayer === "r" ? "b" : "r";
        if (resetActivePlayer === "b") {
          setTimeout(() => {
            ai();
          }, 50);
        }
      }
    }
    setActivePlayer(resetActivePlayer);
  };

  const executeMove = (rowIndex, cellIndex, board, activePlayer) => {
    let activePiece;
    for (let i = 0; i < board.length; i++) {
      //for each row
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j].indexOf("a") > -1) {
          activePiece = board[i][j];
        }
      }
    }

    //make any jump deletions
    let deletions = board[rowIndex][cellIndex].match(/d\d\d/g);
    if (deletions !== undefined && deletions !== null && deletions.length > 0) {
      for (let k = 0; k < deletions.length; k++) {
        let deleteCoords = deletions[k].replace("d", "").split("");
        board[deleteCoords[0]][deleteCoords[1]] = "-";
      }
    }
    //remove active piece from it's place
    board = board.map((row) =>
      row.map((cell) => cell.replace(activePiece, "-"))
    );
    //unhighlight
    board = board.map((row) =>
      row.map((cell) => cell.replace("h", "-").replace(/d\d\d/g, "").trim())
    );
    //place active piece, now unactive, in it's new place
    board[rowIndex][cellIndex] = activePiece.replace("a", "");
    if (
      (activePlayer === "b" && rowIndex === 7) ||
      (activePlayer === "r" && rowIndex === 0)
    ) {
      board[rowIndex][cellIndex] += " k";
    }
    return board;
  };

  const highlightPossibleMoves = (rowIndex, cellIndex) => {
    //unhighlight any previously highlighted cells
    const newBoard = board.map((row) =>
      row.map((cell) => cell.replace("h", "-").replace(/d\d\d/g, "").trim())
    );
    let possibleMoves = findAllPossibleMoves(
      rowIndex,
      cellIndex,
      newBoard,
      activePlayer
    );

    //actually highlight the possible moves on the board
    //the 'highlightTag' inserts the information in to a cell that specifies
    for (let j = 0; j < possibleMoves.length; j++) {
      let buildHighlightTag = "h ";
      for (let k = 0; k < possibleMoves[j].wouldDelete.length; k++) {
        buildHighlightTag +=
          "d" +
          String(possibleMoves[j].wouldDelete[k].targetRow) +
          String(possibleMoves[j].wouldDelete[k].targetCell) +
          " ";
      }
      newBoard[possibleMoves[j].targetRow][possibleMoves[j].targetCell] =
        buildHighlightTag;
    }
    setBoard(newBoard);
  };

  const findAllPossibleMoves = (rowIndex, cellIndex, board, activePlayer) => {
    let possibleMoves = [];
    let directionOfMotion = [];
    let leftOrRight = [1, -1];
    let isKing = board[rowIndex][cellIndex].indexOf("k") > -1;
    if (activePlayer === "b") {
      directionOfMotion.push(1);
    } else {
      directionOfMotion.push(-1);
    }

    //if it's a king, we allow it to both go forward and backward, otherwise it can only move in it's color's normal direction
    //the move loop below runs through every direction of motion allowed, so if there are two it will hit them both
    if (isKing) {
      directionOfMotion.push(directionOfMotion[0] * -1);
    }

    //normal move detection happens here (ie. non jumps)
    //for each direction of motion allowed to the piece it loops (forward for normal pieces, both for kings)
    //inside of that loop, it checks in that direction of motion for both left and right (checkers move diagonally)
    //any moves found are pushed in to the possible moves array
    for (let j = 0; j < directionOfMotion.length; j++) {
      for (let i = 0; i < leftOrRight.length; i++) {
        if (
          typeof board[rowIndex + directionOfMotion[j]] !== "undefined" &&
          typeof board[rowIndex + directionOfMotion[j]][
            cellIndex + leftOrRight[i]
          ] !== "undefined" &&
          board[rowIndex + directionOfMotion[j]][cellIndex + leftOrRight[i]] ===
            "-"
        ) {
          if (
            possibleMoves
              .map(function (move) {
                return String(move.targetRow) + String(move.targetCell);
              })
              .indexOf(
                String(rowIndex + directionOfMotion[j]) +
                  String(cellIndex + leftOrRight[i])
              ) < 0
          ) {
            possibleMoves.push({
              targetRow: rowIndex + directionOfMotion[j],
              targetCell: cellIndex + leftOrRight[i],
              wouldDelete: [],
            });
          }
        }
      }
    }

    //get jumps
    let jumps = findAllJumps(
      rowIndex,
      cellIndex,
      board,
      directionOfMotion[0],
      [],
      [],
      isKing,
      activePlayer
    );

    //loop and push all jumps in to possibleMoves
    for (let i = 0; i < jumps.length; i++) {
      possibleMoves.push(jumps[i]);
    }
    return possibleMoves;
  };

  const findAllJumps = (
    sourceRowIndex,
    sourceCellIndex,
    board,
    directionOfMotion,
    possibleJumps,
    wouldDelete,
    isKing,
    activePlayer
  ) => {
    //jump moves
    let thisIterationDidSomething = false;
    let directions = [directionOfMotion];
    let leftOrRight = [1, -1];
    if (isKing) {
      //if it's a king, we'll also look at moving backwards
      directions.push(directions[0] * -1);
    }
    //here we detect any jump possible moves
    //for each direction available to the piece (based on if it's a king or not)
    //and for each diag (left or right) we look 2 diag spaces away to see if it's open and if we'd jump an enemy to get there.
    for (let k = 0; k < directions.length; k++) {
      for (let l = 0; l < leftOrRight.length; l++) {
        if (
          typeof board[sourceRowIndex + directions[k]] !== "undefined" &&
          typeof board[sourceRowIndex + directions[k]][
            sourceCellIndex + leftOrRight[l]
          ] !== "undefined" &&
          typeof board[sourceRowIndex + directions[k] * 2] !== "undefined" &&
          typeof board[sourceRowIndex + directions[k] * 2][
            sourceCellIndex + leftOrRight[l] * 2
          ] !== "undefined" &&
          board[sourceRowIndex + directions[k]][
            sourceCellIndex + leftOrRight[l]
          ].indexOf(activePlayer === "r" ? "b" : "r") > -1 &&
          board[sourceRowIndex + directions[k] * 2][
            sourceCellIndex + leftOrRight[l] * 2
          ] === "-"
        ) {
          if (
            possibleJumps
              .map((move) => String(move.targetRow) + String(move.targetCell))
              .indexOf(
                String(sourceRowIndex + directions[k] * 2) +
                  String(sourceCellIndex + leftOrRight[l] * 2)
              ) < 0
          ) {
            //this eventual jump target did not already exist in the list
            let tempJumpObject = {
              targetRow: sourceRowIndex + directions[k] * 2,
              targetCell: sourceCellIndex + leftOrRight[l] * 2,
              wouldDelete: [
                {
                  targetRow: sourceRowIndex + directions[k],
                  targetCell: sourceCellIndex + leftOrRight[l],
                },
              ],
            };

            for (let i = 0; i < wouldDelete.length; i++) {
              tempJumpObject.wouldDelete.push(wouldDelete[i]);
            }
            possibleJumps.push(tempJumpObject);
            thisIterationDidSomething = true;
          }
        }
      }
    }

    //if a jump was found, thisIterationDidSomething is set to true and this function calls itself again from that source point, this is how we recurse to find multi jumps
    if (thisIterationDidSomething) {
      for (let i = 0; i < possibleJumps.length; i++) {
        let coords = [possibleJumps[i].targetRow, possibleJumps[i].targetCell];
        let children = findAllJumps(
          coords[0],
          coords[1],
          board,
          directionOfMotion,
          possibleJumps,
          possibleJumps[i].wouldDelete,
          isKing,
          activePlayer
        );
        for (let j = 0; j < children.length; j++) {
          if (possibleJumps.indexOf(children[j]) < 0) {
            possibleJumps.push(children[j]);
          }
        }
      }
    }
    return possibleJumps;
  };

  const reset = () => {
    setBoard([
      ["b", "-", "b", "-", "b", "-", "b", "-"],
      ["-", "b", "-", "b", "-", "b", "-", "b"],
      ["b", "-", "b", "-", "b", "-", "b", "-"],
      ["-", "-", "-", "-", "-", "-", "-", "-"],
      ["-", "-", "-", "-", "-", "-", "-", "-"],
      ["-", "r", "-", "r", "-", "r", "-", "r"],
      ["r", "-", "r", "-", "r", "-", "r", "-"],
      ["-", "r", "-", "r", "-", "r", "-", "r"],
    ]);
    setActivePlayer("r");
  };

  const winDetection = (board, activePlayer) => {
    let enemyPlayer = activePlayer === "r" ? "b" : "r";
    let result = true;
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j].indexOf(enemyPlayer) > -1) {
          result = false;
        }
      }
    }
    return result;
  };

  const cloneBoard = (board) => {
    let output = [];
    for (let i = 0; i < board.length; i++) output.push(board[i].slice(0));
    return output;
  };

  const ai = () => {
    //prep a branching future prediction
    count = 0;
    console.time("decisionTree");
    let decisionTree = aiBranch(board, activePlayer, 1);
    console.timeEnd("decisionTree");
    console.log(count);

    //execute the most favorable move
    if (decisionTree.length > 0) {
      console.log(decisionTree[0]);
      setTimeout(() => {
        handlePieceClick({
          target: {
            attributes: {
              "data-row": {
                nodeValue: decisionTree[0].piece.targetRow,
              },
              "data-cell": {
                nodeValue: decisionTree[0].piece.targetCell,
              },
            },
          },
        });
        setTimeout(() => {
          handlePieceClick({
            target: {
              attributes: {
                "data-row": {
                  nodeValue: decisionTree[0].move.targetRow,
                },
                "data-cell": {
                  nodeValue: decisionTree[0].move.targetCell,
                },
              },
            },
          });
        }, 1000);
      }, 750);
    } else {
      alert("no moves, you win!");
    }
  };

  const aiBranch = (hypotheticalBoard, player, depth) => {
    count++;
    let output = [];
    for (let i = 0; i < hypotheticalBoard.length; i++) {
      for (let j = 0; j < hypotheticalBoard[i].length; j++) {
        if (hypotheticalBoard[i][j].indexOf(player) > -1) {
          let possibleMoves = findAllPossibleMoves(
            i,
            j,
            hypotheticalBoard,
            player
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
                player
              ),
              terminal: null,
              children: [],
              score: 0,
              activePlayer: player,
              depth: depth,
            };
            //does that move win the game?
            buildingObject.terminal = winDetection(
              buildingObject.board,
              activePlayer
            );

            if (buildingObject.terminal) {
              //console.log('a terminal move was found');
              //if terminal, score is easy, just depends on who won
              if (activePlayer === player) {
                buildingObject.score = 100 - depth;
              } else {
                buildingObject.score = -100 - depth;
              }
            } else if (depth > aiDepthCutoff) {
              //don't want to blow up the call stack boiiiiii
              buildingObject.score = 0;
            } else {
              buildingObject.children = aiBranch(
                buildingObject.board,
                player === "r" ? "b" : "r",
                depth + 1
              );
              //if not terminal, we want the best score from this route (or worst depending on who won)
              let scoreHolder = [];

              for (let l = 0; l < buildingObject.children.length; l++) {
                if (typeof buildingObject.children[l].score !== "undefined") {
                  scoreHolder.push(buildingObject.children[l].score);
                }
              }

              scoreHolder.sort((a, b) => {
                if (a > b) return -1;
                if (a < b) return 1;
                return 0;
              });

              if (scoreHolder.length > 0) {
                if (player === activePlayer) {
                  buildingObject.score = scoreHolder[scoreHolder.length - 1];
                } else {
                  buildingObject.score = scoreHolder[0];
                }
              } else {
                if (player === activePlayer) {
                  buildingObject.score = 100 - depth;
                } else {
                  buildingObject.score = -100 - depth;
                }
              }
            }
            if (player === activePlayer) {
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

    output = output.sort((a, b) => {
      if (a.score > b.score) return -1;
      if (a.score < b.score) return 1;
      return 0;
    });
    return output;
  };

  const aboutPopOpen = (e) => {
    setPopShown(true);
  };

  const aboutPopClose = (e) => {
    setPopShown(false);
  };

  return (
    <div className="container">
      <div className={"board " + activePlayer}>
        {board.map((row, index) => (
          <Row
            rowArr={row}
            handlePieceClick={handlePieceClick}
            rowIndex={index}
            key={index}
          />
        ))}
      </div>
      <div className="clear"></div>
      <button onClick={reset}>Reset</button>
      <button onClick={aboutPopOpen}>About</button>
      <Statistics board={board} />
      <Popup shown={popShown} close={aboutPopClose} copy="Hey Tomer" />
    </div>
  );
}

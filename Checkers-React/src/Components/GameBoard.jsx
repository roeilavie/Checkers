import React, { Component } from "react";
import Row from "./Row";
import Statistics from "./Statistics";
import Popup from "./Popup";

export default class GameBoard extends Component {
  constructor() {
    super();
    this.state = {
      board: [
        ["b", "-", "b", "-", "b", "-", "b", "-"],
        ["-", "b", "-", "b", "-", "b", "-", "b"],
        ["b", "-", "b", "-", "b", "-", "b", "-"],
        ["-", "-", "-", "-", "-", "-", "-", "-"],
        ["-", "-", "-", "-", "-", "-", "-", "-"],
        ["-", "r", "-", "r", "-", "r", "-", "r"],
        ["r", "-", "r", "-", "r", "-", "r", "-"],
        ["-", "r", "-", "r", "-", "r", "-", "r"],
      ],
      activePlayer: "r",
      aiDepthCutoff: 3,
      count: 0,
      popShown: false,
    };
  }

  aboutPopOpen = (e) => {
    this.setState({ popShown: true });
  };

  aboutPopClose = (e) => {
    this.setState({ popShown: false });
  };

  handlePieceClick = (e) => {
    let rowIndex = parseInt(e.target.attributes["data-row"].nodeValue);
    let cellIndex = parseInt(e.target.attributes["data-cell"].nodeValue);

    if (
      this.state.board[rowIndex][cellIndex].indexOf(this.state.activePlayer) >
      -1
    ) {
      //this is triggered if the piece that was clicked on is one of the player's own pieces, it activates it and highlights possible moves
      //this is triggered if the piece that was clicked on is one of the player's own pieces, it activates it and highlights possible moves
      // eslint-disable-next-line
      this.state.board = this.state.board.map((row) =>
        row.map((cell) => cell.replace("a", ""))
      );

      //un-activate any previously activated pieces
      // eslint-disable-next-line
      this.state.board[rowIndex][cellIndex] =
        "a" + this.state.board[rowIndex][cellIndex];
      this.highlightPossibleMoves(rowIndex, cellIndex);
    } else if (this.state.board[rowIndex][cellIndex].indexOf("h") > -1) {
      //this is activated if the piece clicked is a highlighted square, it moves the active piece to that spot.
      // eslint-disable-next-line
      this.state.board = this.executeMove(
        rowIndex,
        cellIndex,
        this.state.board,
        this.state.activePlayer
      );
      //is the game over? if not, swap active player
      this.setState(this.state);
      if (this.winDetection(this.state.board, this.state.activePlayer)) {
        console.log(this.state.activePlayer + " won the game!");
      } else {
        // eslint-disable-next-line
        this.state.activePlayer = this.state.activePlayer === "r" ? "b" : "r";
        if (this.state.activePlayer === "b") {
          setTimeout(() => this.ai(), 50);
        }
      }
    }
  };

  executeMove = (rowIndex, cellIndex, board, activePlayer) => {
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
    board = board.map(function (row) {
      return row.map(function (cell) {
        return cell.replace("h", "-").replace(/d\d\d/g, "").trim();
      });
    });
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

  highlightPossibleMoves = (rowIndex, cellIndex) => {
    //unhighlight any previously highlighted cells
    const newBoard = this.state.board.map((row) =>
      row.map((cell) => cell.replace("h", "-").replace(/d\d\d/g, "").trim())
    );

    let possibleMoves = this.findAllPossibleMoves(
      rowIndex,
      cellIndex,
      newBoard,
      this.state.activePlayer
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

    this.setState({ board: newBoard });
  };

  findAllPossibleMoves = (rowIndex, cellIndex, board, activePlayer) => {
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
    let jumps = this.findAllJumps(
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

  findAllJumps = (
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
              .map(function (move) {
                return String(move.targetRow) + String(move.targetCell);
              })
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
        let children = this.findAllJumps(
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

  reset = () => {
    this.setState({
      board: [
        ["b", "-", "b", "-", "b", "-", "b", "-"],
        ["-", "b", "-", "b", "-", "b", "-", "b"],
        ["b", "-", "b", "-", "b", "-", "b", "-"],
        ["-", "-", "-", "-", "-", "-", "-", "-"],
        ["-", "-", "-", "-", "-", "-", "-", "-"],
        ["-", "r", "-", "r", "-", "r", "-", "r"],
        ["r", "-", "r", "-", "r", "-", "r", "-"],
        ["-", "r", "-", "r", "-", "r", "-", "r"],
      ],
      activePlayer: "r",
    });
  };

  winDetection = (board, activePlayer) => {
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

  cloneBoard = (board) => {
    let output = [];
    for (let i = 0; i < board.length; i++) output.push(board[i].slice(0));
    return output;
  };

  ai = () => {
    //prep a branching future prediction
    this.count = 0;
    console.time("decisionTree");
    let decisionTree = this.aiBranch(
      this.state.board,
      this.state.activePlayer,
      1
    );
    console.timeEnd("decisionTree");
    console.log(this.count);
    //execute the most favorable move
    if (decisionTree.length > 0) {
      console.log(decisionTree[0]);
      setTimeout(() => {
        this.handlePieceClick({
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
          this.handlePieceClick({
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

  aiBranch = (hypotheticalBoard, activePlayer, depth) => {
    this.count++;
    let output = [];
    for (let i = 0; i < hypotheticalBoard.length; i++) {
      for (let j = 0; j < hypotheticalBoard[i].length; j++) {
        if (hypotheticalBoard[i][j].indexOf(activePlayer) > -1) {
          let possibleMoves = this.findAllPossibleMoves(
            i,
            j,
            hypotheticalBoard,
            activePlayer
          );
          for (let k = 0; k < possibleMoves.length; k++) {
            let tempBoard = this.cloneBoard(hypotheticalBoard);
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
              board: this.executeMove(
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
            buildingObject.terminal = this.winDetection(
              buildingObject.board,
              activePlayer
            );

            if (buildingObject.terminal) {
              //console.log('a terminal move was found');
              //if terminal, score is easy, just depends on who won
              if (activePlayer === this.state.activePlayer) {
                buildingObject.score = 100 - depth;
              } else {
                buildingObject.score = -100 - depth;
              }
            } else if (depth > this.state.aiDepthCutoff) {
              //don't want to blow up the call stack boiiiiii
              buildingObject.score = 0;
            } else {
              buildingObject.children = this.aiBranch(
                buildingObject.board,
                activePlayer === "r" ? "b" : "r",
                depth + 1
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
                if (activePlayer === this.state.activePlayer) {
                  buildingObject.score = scoreHolder[scoreHolder.length - 1];
                } else {
                  buildingObject.score = scoreHolder[0];
                }
              } else {
                if (activePlayer === this.state.activePlayer) {
                  buildingObject.score = 100 - depth;
                } else {
                  buildingObject.score = -100 - depth;
                }
              }
            }
            if (activePlayer === this.state.activePlayer) {
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

  render() {
    return (
      <div className="container">
        <div className={"board " + this.state.activePlayer}>
          {this.state.board.map(function (row, index) {
            return (
              <Row
                rowArr={row}
                handlePieceClick={this.handlePieceClick}
                rowIndex={index}
                key={index}
              />
            );
          }, this)}
        </div>
        <div className="clear"></div>
        <button onClick={this.reset}>Reset</button>
        <button onClick={this.aboutPopOpen}>About</button>
        <Statistics board={this.state.board} />
        <Popup
          shown={this.state.popShown}
          close={this.aboutPopClose}
          copy="Hi Tomer, my average is higher than yours, just reminding you"
        />
      </div>
    );
  }
}

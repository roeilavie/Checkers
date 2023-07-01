import React, { Component } from "react";
import Row from "./Row";
import { minimax } from "./Algorithm";
import { getPossibleMoves, executeMove, isGoalState } from "./ServiceFunctions";

const initialBoard = [
  ["b", "-", "b", "-", "b", "-", "b", "-"],
  ["-", "b", "-", "b", "-", "b", "-", "b"],
  ["b", "-", "b", "-", "b", "-", "b", "-"],
  ["-", "-", "-", "-", "-", "-", "-", "-"],
  ["-", "-", "-", "-", "-", "-", "-", "-"],
  ["-", "w", "-", "w", "-", "w", "-", "w"],
  ["w", "-", "w", "-", "w", "-", "w", "-"],
  ["-", "w", "-", "w", "-", "w", "-", "w"],
];

export default class GameBoard extends Component {
  constructor() {
    super();
    this.state = {
      board: initialBoard,
      activePlayer: "w",
      maxDepth: 3,
    };
  }

  handlePieceClick = (e) => {
    let rowIndex = parseInt(e.target.attributes["data-row"].nodeValue);
    let colIndex = parseInt(e.target.attributes["data-cell"].nodeValue);

    if (this.state.board[rowIndex][colIndex].indexOf(this.state.activePlayer) > -1) {
      // eslint-disable-next-line
      this.state.board = this.state.board.map((row) =>row.map((cell) => cell.replace("a", "")));
      // eslint-disable-next-line
      this.state.board[rowIndex][colIndex] = "a" + this.state.board[rowIndex][colIndex];
      this.highlightPossibleMoves(rowIndex, colIndex);
    }
    
    else if (this.state.board[rowIndex][colIndex].indexOf("h") > -1) {
      // eslint-disable-next-line
      this.state.board = executeMove(rowIndex,colIndex,this.state.board,this.state.activePlayer);
      this.setState(this.state);
      if (isGoalState(this.state.board, this.state.activePlayer)) {
        setTimeout(() => {
          alert(this.state.activePlayer === 'b' ? "Computer won the game!" : "You won the game!");
        }, 2000);
      }
      else{
        // eslint-disable-next-line
        this.state.activePlayer = this.state.activePlayer === "w" ? "b" : "w";
        if (this.state.activePlayer === "b") {
          setTimeout(() => this.computer(), 50);
        }
      }
    }
  };

  highlightPossibleMoves = (rowIndex, colIndex) => {
    //Remove highlights
    const newBoard = this.state.board.map((row) =>row.map((cell) => cell.replace("h", "-").replace(/d\d\d/g, "").trim()));
    let possibleMoves = getPossibleMoves(rowIndex,colIndex,newBoard,this.state.activePlayer);

    for (let j = 0; j < possibleMoves.length; j++) {
      let buildHighlightTag = "h ";
      for (let k = 0; k < possibleMoves[j].wouldDelete.length; k++) {
        buildHighlightTag +=
          "d" +
          String(possibleMoves[j].wouldDelete[k].targetRow) +
          String(possibleMoves[j].wouldDelete[k].targetCol) +
          " ";
      }
      newBoard[possibleMoves[j].targetRow][possibleMoves[j].targetCol] =
        buildHighlightTag;
    }

    this.setState({ board: newBoard });
  };

  reset = () => {
    this.setState({
      board: initialBoard,
      activePlayer: "w",
    });
  };

  computer = () => {
    let miniMaxAlgo = minimax(this.state.board,this.state.activePlayer,1,this.state.maxDepth);
    console.log(miniMaxAlgo);
    if (miniMaxAlgo.length > 0) {
      setTimeout(() => {
        this.handlePieceClick({
          target: {
            attributes: {
              "data-row": {
                nodeValue: miniMaxAlgo[0].piece.targetRow,
              },
              "data-cell": {
                nodeValue: miniMaxAlgo[0].piece.targetCol,
              },
            },
          },
        });

        setTimeout(() => {
          this.handlePieceClick({
            target: {
              attributes: {
                "data-row": {
                  nodeValue: miniMaxAlgo[0].move.targetRow,
                },
                "data-cell": {
                  nodeValue: miniMaxAlgo[0].move.targetCol,
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

  render() {
    return (
      <div className="container">
        <h1>Welcome to our checkers game</h1>
        <h2>Black: Computer</h2>
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
        <h2>White: You</h2>
        <div className="clear"></div>
        <button onClick={this.reset}>New Game</button>
      </div>
    );
  }
}

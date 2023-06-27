import React from "react";
import Row from "./Row";

export default function GameBoard() {
  const board = [
    ["b", "-", "b", "-", "b", "-", "b", "-"],
    ["-", "b", "-", "b", "-", "b", "-", "b"],
    ["b", "-", "b", "-", "b", "-", "b", "-"],
    ["-", "-", "-", "-", "-", "-", "-", "-"],
    ["-", "-", "-", "-", "-", "-", "-", "-"],
    ["-", "r", "-", "r", "-", "r", "-", "r"],
    ["r", "-", "r", "-", "r", "-", "r", "-"],
    ["-", "r", "-", "r", "-", "r", "-", "r"],
  ];

  const handlePieceClick = (e) => {};

  return (
    <div className="container">
      <div className={"board"}>
        {board.map((row, index) => (
          <Row
            rowArr={row}
            handlePieceClick={handlePieceClick}
            rowIndex={index}
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

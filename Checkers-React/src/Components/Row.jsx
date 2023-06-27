import React from "react";
import Cell from "./Cell";

export default function Row(props) {
  return (
    <div className="row">
      {props.rowArr.map((cell, index) => (
        <Cell
          rowIndex={props.rowIndex}
          index={index}
          cell={cell}
          handlePieceClick={props.handlePieceClick}
          key={index}
        />
      ))}
    </div>
  );
}

import React from "react";

export default function Cell(props) {
  return (
    <div className={"cell cell-" + props.cell}>
      <div
        className="gamePiece"
        onClick={props.handlePieceClick}
        data-row={props.rowIndex}
        data-cell={props.index}
      ></div>
    </div>
  );
}

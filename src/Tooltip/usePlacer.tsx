import { Placement } from "@floating-ui/react-dom";
import React, { useState } from "react";

const PLACES = [
  "top",
  "right",
  "bottom",
  "left",
  "top-start",
  "top-end",
  "right-start",
  "right-end",
  "bottom-start",
  "bottom-end",
  "left-start",
  "left-end",
] as const;

export const usePlacer = () => {
  const [place, setPlace] = useState<Placement>("top");

  return {
    place,
    setPlace,
  };
};

export const PlaceSelector: React.FC<{
  place: Placement;
  setPlace: React.Dispatch<React.SetStateAction<Placement>>;
}> = ({ place, setPlace }) => {
  return (
    <div
      style={{
        position: "fixed",
        display: "flex",
        gap: "8px",
        top: "8px",
        left: "8px",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      {PLACES.map((p) => (
        <button
          style={{
            backgroundColor: place === p ? "#bada55" : undefined,
            color: place !== p ? "#bada55" : "black",
          }}
          onClick={() => setPlace(p)}
        >
          {p}
        </button>
      ))}
    </div>
  );
};

import "./App.css";
import { Popover } from "./Tooltip";
import { PlaceSelector, usePlacer } from "./Tooltip/usePlacer";

function App() {
  const placer = usePlacer();

  return (
    <div className="page">
      <PlaceSelector {...placer} />
      <div className="popover-container">
        <div
          style={{
            height: "100px",
            overflow: "hidden",
            background: "#bada55",
            width: "100%",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <span style={{ color: "black" }}>
            Overflow from the green box is hidden
          </span>
          <Popover id="myPopover" placement={placer.place}>
            <Popover.Anchor>
              <button type="button">Open the popover</button>
            </Popover.Anchor>
            <Popover.Content>
              <div className="content">
                <span>Hello</span>
                <button type="button">Just here chillin</button>
              </div>
            </Popover.Content>
          </Popover>
        </div>
      </div>
    </div>
  );
}

export default App;

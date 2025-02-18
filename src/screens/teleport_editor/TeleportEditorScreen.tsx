import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function TeleportEditorScreen() {
  const navigate = useNavigate();

  return (
    <div>
      <Button onClick={() => navigate("/")}>Back</Button>
      <div> This is a teleport editor </div>
    </div>
  );
}

function TeleportZoneListCard() {
  return (
    <div>
      This will display a list of the current configured teleport zones much
      like the switch list
    </div>
  );
}

function ModelViewer() {
  <div>
    This will display the 3d model and provide the interface for the user to
    decide where the teleport zone should be
  </div>;
}

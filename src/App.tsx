import { PlaneForm } from "@/components/form/form";
import { FileManagement } from "@/components/file-management";

function App() {
  return (
    <div className="container flex">
      <FileManagement />
      <PlaneForm />
    </div>
  );
}

export default App;

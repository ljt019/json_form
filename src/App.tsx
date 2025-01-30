import { PlaneForm } from "@/components/form/form";
import { FileManagement } from "@/components/file-management";

function App() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <FileManagement />
        </div>
        <div className="w-full md:w-2/3">
          <PlaneForm />
        </div>
      </div>
    </div>
  );
}

export default App;

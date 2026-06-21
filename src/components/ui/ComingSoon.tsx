import { Hammer } from "lucide-react";

interface ComingSoonProps {
  moduleName: string;
  description?: string;
}

export function ComingSoon({ moduleName, description }: ComingSoonProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-full mb-8 shadow-sm border border-blue-100">
        <Hammer className="w-16 h-16 text-blue-600 animate-pulse" strokeWidth={1.5} />
      </div>
      
      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
        {moduleName}
      </h1>
      
      <p className="text-lg text-gray-500 max-w-lg mx-auto">
        {description || `The ${moduleName} module is currently under active development. It will be available in an upcoming release phase.`}
      </p>
      
      <div className="mt-12 inline-flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-200 shadow-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping mr-2"></span>
        Work in Progress
      </div>
    </div>
  );
}

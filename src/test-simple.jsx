// Simple test component to verify React is working
export default function TestSimple() {
  console.log("🧪 TestSimple: Component rendering...");
  
  return (
    <div className="p-8 bg-blue-100 min-h-screen">
      <h1 className="text-2xl font-bold text-blue-800">🧪 Test Component</h1>
      <p className="mt-4 text-blue-600">If you can see this, React is working!</p>
      <div className="mt-4 p-4 bg-white rounded-lg shadow">
        <h2 className="font-bold">Environment Check:</h2>
        <p>Frontend URL: {window.location.href}</p>
        <p>Current time: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}

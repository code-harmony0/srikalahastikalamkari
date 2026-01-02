export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-yellow-800">Legacy Code Copied</h2>
        <p className="text-yellow-700 mt-2">
          The Admin Dashboard components have been copied from the source project.
          They are located in <code>components/admin</code>.
        </p>
        <p className="text-yellow-700 mt-2">
          The original pages (using React Router) are in <code>components/admin/pages_legacy</code>.
          You can migrate them one by one to this App Router structure.
        </p>
      </div>
    </div>
  );
}

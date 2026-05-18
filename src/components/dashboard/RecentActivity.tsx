const activities = [
  "Completed React Basics Session",
  "Uploaded JavaScript Notes",
  "Answered 5 Community Questions",
  "Joined UI/UX Discussion",
];

function RecentActivity() {
  return (
    <div className="bg-zinc-900/70 border border-cyan-500/10 rounded-3xl p-8">
      <h2 className="text-3xl font-semibold mb-6">
        Recent Activity
      </h2>

      <div className="space-y-5">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="bg-zinc-800/70 rounded-2xl px-5 py-5 border border-zinc-700 hover:border-cyan-500/30 transition-all"
          >
            <p className="text-zinc-300 text-lg">
              {activity}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentActivity;
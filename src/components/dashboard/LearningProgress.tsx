function LearningProgress() {
  return (
    <div className="bg-zinc-900/70 border border-cyan-500/10 rounded-3xl p-8">
      <h2 className="text-3xl font-semibold mb-8">
        Learning Progress
      </h2>

      <div className="space-y-8">

        <div>
          <div className="flex justify-between mb-3">
            <span className="text-zinc-300 text-lg">
              Frontend Development
            </span>

            <span className="text-cyan-400 font-semibold">
              80%
            </span>
          </div>

          <div className="w-full bg-zinc-800 rounded-full h-4">
            <div className="bg-cyan-400 h-4 rounded-full w-[80%]"></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-3">
            <span className="text-zinc-300 text-lg">
              Backend Development
            </span>

            <span className="text-blue-400 font-semibold">
              60%
            </span>
          </div>

          <div className="w-full bg-zinc-800 rounded-full h-4">
            <div className="bg-blue-500 h-4 rounded-full w-[60%]"></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-3">
            <span className="text-zinc-300 text-lg">
              Open Source Contributions
            </span>

            <span className="text-purple-400 font-semibold">
              75%
            </span>
          </div>

          <div className="w-full bg-zinc-800 rounded-full h-4">
            <div className="bg-purple-500 h-4 rounded-full w-[75%]"></div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LearningProgress;
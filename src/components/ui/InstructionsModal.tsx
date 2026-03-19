'use client';

interface InstructionsModalProps {
  onClose: () => void;
}

export default function InstructionsModal({ onClose }: InstructionsModalProps) {
  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="comic-panel rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-comic-entrance">
        {/* Header */}
        <div className="p-6 flex justify-between items-center" style={{ borderBottom: '2px solid var(--panel-light)' }}>
          <h2 className="comic-subtitle text-2xl" style={{ color: 'var(--comic-green)' }}>
            HOW TO PLAY
          </h2>
          <button
            onClick={onClose}
            className="text-2xl hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Goal */}
          <section>
            <h3 className="comic-subtitle text-lg mb-2" style={{ color: 'var(--comic-yellow)' }}>
              YOUR GOAL
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Survive the zombie apocalypse by making smart insurance decisions!
              You start with <strong style={{ color: 'var(--comic-green)' }}>$10,000</strong> and{' '}
              <strong style={{ color: 'var(--comic-red)' }}>100 HP</strong>.
              If either reaches zero, it&apos;s game over.
            </p>
          </section>

          {/* How Each Wave Works */}
          <section>
            <h3 className="comic-subtitle text-lg mb-2" style={{ color: 'var(--comic-yellow)' }}>
              EACH WAVE
            </h3>
            <div className="space-y-3" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex gap-3 items-start">
                <span className="comic-subtitle text-lg" style={{ color: 'var(--comic-green)' }}>1.</span>
                <p><strong style={{ color: 'var(--parchment)' }}>Buy insurance</strong> &mdash; Choose which policies to buy this wave. Each policy protects against a different disaster.</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="comic-subtitle text-lg" style={{ color: 'var(--comic-green)' }}>2.</span>
                <p><strong style={{ color: 'var(--parchment)' }}>Face the wave</strong> &mdash; A random event happens: zombies attack your home, someone gets bitten, raiders steal supplies, or you need to evacuate. Sometimes nothing happens!</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="comic-subtitle text-lg" style={{ color: 'var(--comic-green)' }}>3.</span>
                <p><strong style={{ color: 'var(--parchment)' }}>See the results</strong> &mdash; If you had the right insurance, it pays for most of the damage. If not, you pay everything yourself.</p>
              </div>
            </div>
          </section>

          {/* Understanding Insurance */}
          <section>
            <h3 className="comic-subtitle text-lg mb-2" style={{ color: 'var(--comic-yellow)' }}>
              HOW INSURANCE WORKS
            </h3>
            <div className="space-y-4" style={{ color: 'var(--text-secondary)' }}>
              <div
                className="rounded-lg p-4"
                style={{ background: 'var(--panel-mid)', border: '1px solid var(--panel-light)' }}
              >
                <h4 className="font-bold mb-1" style={{ color: 'var(--parchment)' }}>Premium (Cost Per Wave)</h4>
                <p>This is what you pay every wave for the insurance policy &mdash; like a monthly bill. You pay this whether or not disaster strikes.</p>
              </div>
              <div
                className="rounded-lg p-4"
                style={{ background: 'var(--panel-mid)', border: '1px solid var(--panel-light)' }}
              >
                <h4 className="font-bold mb-1" style={{ color: 'var(--parchment)' }}>Deductible</h4>
                <p>When disaster hits, this is the amount you pay <em>before</em> insurance kicks in. Think of it as your &ldquo;share&rdquo; of the bill. Lower deductible = insurance starts helping sooner.</p>
              </div>
              <div
                className="rounded-lg p-4"
                style={{ background: 'var(--panel-mid)', border: '1px solid var(--panel-light)' }}
              >
                <h4 className="font-bold mb-1" style={{ color: 'var(--parchment)' }}>Coverage Percentage</h4>
                <p>After you pay the deductible, insurance covers this percentage of the remaining damage. <strong style={{ color: 'var(--comic-blue)' }}>50% coverage</strong> means they pay half and you pay half. <strong style={{ color: 'var(--comic-purple)' }}>90% coverage</strong> means they pay almost everything.</p>
              </div>
            </div>
          </section>

          {/* Tiers */}
          <section>
            <h3 className="comic-subtitle text-lg mb-2" style={{ color: 'var(--comic-yellow)' }}>
              INSURANCE TIERS
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="tier-badge tier-basic">BASIC</span>
                <span style={{ color: 'var(--text-secondary)' }}>Cheapest, but only covers 50%. Higher deductible. You still pay a lot when disaster hits.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="tier-badge tier-standard">STANDARD</span>
                <span style={{ color: 'var(--text-secondary)' }}>Costs more, covers 75%. Lower deductible. Good balance of cost and protection.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="tier-badge tier-premium">PREMIUM</span>
                <span style={{ color: 'var(--text-secondary)' }}>Most expensive, covers 90%. Lowest deductible. You&apos;re well protected but it costs a lot each wave.</span>
              </div>
            </div>
          </section>

          {/* Example */}
          <section>
            <h3 className="comic-subtitle text-lg mb-2" style={{ color: 'var(--comic-yellow)' }}>
              EXAMPLE
            </h3>
            <div
              className="rounded-lg p-4 space-y-3"
              style={{ background: 'var(--panel-mid)', border: '1px solid var(--panel-light)' }}
            >
              <p style={{ color: 'var(--text-secondary)' }}>
                Zombies attack your home causing <strong style={{ color: 'var(--comic-red)' }}>$1,500 damage</strong>:
              </p>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between p-2 rounded" style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)' }}>
                  <span style={{ color: 'var(--comic-red)' }}>No insurance:</span>
                  <span style={{ color: 'var(--comic-red)' }}>You pay all $1,500 + lose 10 HP</span>
                </div>
                <div className="flex justify-between p-2 rounded" style={{ background: 'rgba(107,101,144,0.1)', border: '1px solid rgba(107,101,144,0.2)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Basic (50%):</span>
                  <span style={{ color: 'var(--text-secondary)' }}>$300 premium + $200 deductible + $650 (50%) = <strong>$1,150</strong></span>
                </div>
                <div className="flex justify-between p-2 rounded" style={{ background: 'rgba(76,201,240,0.1)', border: '1px solid rgba(76,201,240,0.2)' }}>
                  <span style={{ color: 'var(--comic-blue)' }}>Standard (75%):</span>
                  <span style={{ color: 'var(--comic-blue)' }}>$500 premium + $150 deductible + $338 (25%) = <strong>$988</strong></span>
                </div>
                <div className="flex justify-between p-2 rounded" style={{ background: 'rgba(155,93,229,0.1)', border: '1px solid rgba(155,93,229,0.2)' }}>
                  <span style={{ color: 'var(--comic-purple)' }}>Premium (90%):</span>
                  <span style={{ color: 'var(--comic-purple)' }}>$800 premium + $100 deductible + $150 (10%) = <strong>$1,050</strong></span>
                </div>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Better coverage costs more per wave but saves more when disaster strikes. The trick is figuring out which disasters are likely and budgeting wisely!
              </p>
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="comic-subtitle text-lg mb-2" style={{ color: 'var(--comic-yellow)' }}>
              TIPS
            </h3>
            <ul className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex gap-2">
                <span style={{ color: 'var(--comic-green)' }}>&#x25B8;</span>
                You don&apos;t have to buy every type of insurance every wave &mdash; pick the ones you think you&apos;ll need
              </li>
              <li className="flex gap-2">
                <span style={{ color: 'var(--comic-green)' }}>&#x25B8;</span>
                Early waves do less damage, so you can save money at the start
              </li>
              <li className="flex gap-2">
                <span style={{ color: 'var(--comic-green)' }}>&#x25B8;</span>
                Watch for random events &mdash; some give discounts on insurance!
              </li>
              <li className="flex gap-2">
                <span style={{ color: 'var(--comic-green)' }}>&#x25B8;</span>
                Hover or tap the info button on each policy to see exactly what it saves you
              </li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4" style={{ borderTop: '2px solid var(--panel-light)', background: 'var(--panel-dark)' }}>
          <button
            onClick={onClose}
            className="btn-comic btn-comic-green w-full py-3 px-6 rounded-lg text-lg"
          >
            GOT IT!
          </button>
        </div>
      </div>
    </div>
  );
}

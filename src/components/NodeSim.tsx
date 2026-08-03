import type { MapNode } from '../lib/types'
import { getSim } from '../lib/sims'
import { track } from '../lib/track'

/**
 * Simulation node body. The live sim is SSO/session-gated so it can't be
 * iframed — instead we show an enticing, on-brand thumbnail that opens the
 * example simulation in a new tab (the whole thumbnail is the link). The
 * copy is explicit that this is a generic example, not the visitor's topic.
 *
 * SWAP THE THUMBNAIL: drop a still frame of the sim avatar into
 * /public/sim-thumbnail.jpg and it replaces the placeholder automatically.
 */
export function NodeSim({
  node,
  training,
  onOpened,
}: {
  node: MapNode
  training: string
  /** Called after the sim is launched — advances the guided sequence. */
  onOpened?: () => void
}) {
  const sim = getSim(training, node.id)

  const open = () => {
    track('sim_opened', { node_id: node.id, mode: 'new_tab' })
    if (sim.embedUrl) window.open(sim.embedUrl, '_blank', 'noopener,noreferrer')
    onOpened?.()
  }

  return (
    <div className="text-left">
      <p className="text-[15px] leading-relaxed text-ink-soft">{sim.intro}</p>

      {/* Enticing, fully-clickable thumbnail → opens the example sim in a new tab */}
      <button
        type="button"
        onClick={open}
        className="group relative mt-4 block aspect-video w-full overflow-hidden rounded-xl border border-line"
        aria-label="Open the example simulation in a new tab"
      >
        {/* Placeholder background — replaced by the avatar image when present */}
        <span className="absolute inset-0 bg-gradient-to-br from-[#eef2f6] to-[#dfe6ee]" />
        <img
          src={`${import.meta.env.BASE_URL}sim-thumbnail.jpg`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />

        {/* Branded play button */}
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-16 place-items-center rounded-full bg-white/95 text-primary shadow-lg transition-transform group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="ml-0.5 size-7" fill="currentColor">
              <path d="M8 5v14l11-7L8 5Z" />
            </svg>
          </span>
        </span>

        {/* Duration chip */}
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg bg-ink/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          {node.estMinutes} min
        </span>

        {/* Example badge (branded) */}
        <span className="absolute right-3 top-3 rounded-full bg-info-soft px-3 py-1 text-xs font-bold text-primary">
          Example sim
        </span>
      </button>

      <button
        type="button"
        onClick={open}
        className="mt-4 inline-flex items-center gap-2 rounded-btn bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
      >
        Open example simulation
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17L17 7M17 7H8M17 7v9" />
        </svg>
      </button>
    </div>
  )
}

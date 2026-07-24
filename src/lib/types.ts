/** Content model for the learning map. See CLAUDE_CODE_BRIEF.md → Content model. */

export type NodeType = 'check' | 'content' | 'sim' | 'report' | 'usecase' | 'cta'

export type NodeState = 'completed' | 'verified' | 'current' | 'available' | 'locked'

export type IconKey =
  | 'book'
  | 'target'
  | 'chat'
  | 'chart'
  | 'people'
  | 'shield'
  | 'play'
  | 'flag'
  | 'lightbulb'
  | 'clipboard'

export interface MapNode {
  id: string
  type: NodeType
  title: string
  subtitle?: string
  /** Short blurb shown in the active-node popover. */
  blurb?: string
  stage: string
  /** World-space coordinates (px) for layout. */
  position: { x: number; y: number }
  /** ids of downstream nodes (edges drawn from this node to each). */
  edges: string[]
  state: NodeState
  icon: IconKey
  estMinutes: number
  skillTags: string[]
}

export interface MapContent {
  scenario: {
    company: string
    course: string
    breadcrumb: string[]
    description: string
    percentComplete: number
  }
  nodes: MapNode[]
}

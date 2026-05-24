'use client'

import { useNavStore } from '@/stores/navStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useAudioStore } from '@/stores/audioStore'
import Sidebar from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import PlayerBar from '@/components/layout/PlayerBar'
import ExpandedPlayer from '@/components/layout/ExpandedPlayer'
import MusicPage from '@/components/pages/MusicPage'
import CollectionPage from '@/components/pages/CollectionPage'
import RecentPage from '@/components/pages/RecentPage'
import LocalPage from '@/components/pages/LocalPage'
import SkinPage from '@/components/pages/SkinPage'
import EffectLayer from '@/components/skin/EffectLayer'
import { BackgroundLayer } from '@/components/skin/BackgroundLayer'
import { Equalizer } from '@/components/audio/Equalizer'

function ContentArea() {
  const { activeNav } = useNavStore()

  switch (activeNav) {
    case 'music':
      return <MusicPage />
    case 'collection':
      return <CollectionPage />
    case 'recent':
      return <RecentPage />
    case 'local':
      return <LocalPage />
    case 'skin':
      return <SkinPage />
    default:
      return <MusicPage />
  }
}

export default function HomePage() {
  const { isPlayerExpanded } = usePlayerStore()
  const { eqOpen, setEqOpen, toggleEq } = useAudioStore()

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col relative">
      {/* Background layer - fixed, z-0 */}
      <BackgroundLayer />
      
      {/* Effect layer - fixed, z-10 */}
      <EffectLayer />

      {/* Main content - above background, semi-transparent to show bg through */}
      <div className="relative z-20 flex flex-col h-full">
        {/* Top bar */}
        <TopBar 
          onEqClick={toggleEq} 
        />

        {/* Middle: Sidebar + Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar />

          {/* Content area - semi-transparent so background shows through */}
          <main className="flex-1 overflow-y-auto p-6 pb-24 bg-[#06080E]/70 backdrop-blur-sm">
            <ContentArea />
          </main>
        </div>

        {/* Bottom player bar */}
        <PlayerBar />

        {/* Expanded player overlay */}
        {isPlayerExpanded && <ExpandedPlayer />}
      </div>

      {/* Equalizer dialog */}
      <Equalizer open={eqOpen} onOpenChange={setEqOpen} />
    </div>
  )
}

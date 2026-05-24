import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const songs = await db.song.findMany({
      orderBy: { addedAt: 'desc' },
    })
    return NextResponse.json(songs)
  } catch (error) {
    console.error('Error fetching songs:', error)
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, folderPath } = body

    if (action === 'scan') {
      if (!folderPath) {
        return NextResponse.json({ error: 'folderPath is required' }, { status: 400 })
      }

      const audioExtensions = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma', '.ape']
      const newSongs: Array<{
        title: string
        artist: string
        album: string
        filePath: string
        fileSize: number
      }> = []

      const scanDir = (dirPath: string) => {
        try {
          const entries = fs.readdirSync(dirPath, { withFileTypes: true })
          for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name)
            if (entry.isDirectory()) {
              scanDir(fullPath)
            } else if (entry.isFile()) {
              const ext = path.extname(entry.name).toLowerCase()
              if (audioExtensions.includes(ext)) {
                const stats = fs.statSync(fullPath)
                const nameWithoutExt = path.basename(entry.name, ext)
                const parts = nameWithoutExt.split(' - ')
                const title = parts.length > 1 ? parts[1].trim() : nameWithoutExt
                const artist = parts.length > 1 ? parts[0].trim() : '未知歌手'

                newSongs.push({
                  title,
                  artist,
                  album: '未知专辑',
                  filePath: fullPath,
                  fileSize: stats.size,
                })
              }
            }
          }
        } catch {
          // Skip directories we can't read
        }
      }

      scanDir(folderPath)

      let addedCount = 0
      for (const song of newSongs) {
        const existing = await db.song.findFirst({
          where: { filePath: song.filePath },
        })
        if (!existing) {
          await db.song.create({
            data: {
              title: song.title,
              artist: song.artist,
              album: song.album,
              filePath: song.filePath,
              fileSize: song.fileSize,
              isLocal: true,
              isDownloaded: false,
            },
          })
          addedCount++
        }
      }

      return NextResponse.json({
        success: true,
        totalFound: newSongs.length,
        added: addedCount,
        skipped: newSongs.length - addedCount,
      })
    }

    if (action === 'addSong') {
      const { title, artist, album, filePath, fileSize } = body
      const song = await db.song.create({
        data: {
          title: title || path.basename(filePath),
          artist: artist || '未知歌手',
          album: album || '未知专辑',
          filePath,
          fileSize: fileSize || 0,
          isLocal: true,
          isDownloaded: false,
        },
      })
      return NextResponse.json(song)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing music request:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

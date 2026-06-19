import { Howl, Howler } from 'howler'
import { useSoundStore } from '../store'

type SoundKey = 'click' | 'hover' | 'success' | 'navigation' | 'card' | 'favorite' | 'error'

// Synthesized sounds using data URIs (no external files needed)
const SOUNDS: Record<SoundKey, { src: string[]; volume?: number }> = {
  click:      { src: ['data:audio/wav;base64,'], volume: 0.4 },
  hover:      { src: ['data:audio/wav;base64,'], volume: 0.15 },
  success:    { src: ['data:audio/wav;base64,'], volume: 0.5 },
  navigation: { src: ['data:audio/wav;base64,'], volume: 0.3 },
  card:       { src: ['data:audio/wav;base64,'], volume: 0.35 },
  favorite:   { src: ['data:audio/wav;base64,'], volume: 0.5 },
  error:      { src: ['data:audio/wav;base64,'], volume: 0.4 },
}

class SoundService {
  private howls: Map<SoundKey, Howl> = new Map()
  private cryCache: Map<string, Howl> = new Map()

  private createToneBuffer(frequency: number, duration: number, type: OscillatorType = 'sine'): string {
    // Generate a simple tone as a base64 WAV
    const sampleRate = 8000
    const numSamples = Math.floor(sampleRate * duration)
    const buffer = new ArrayBuffer(44 + numSamples * 2)
    const view = new DataView(buffer)
    const writeString = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)) }
    writeString(0, 'RIFF'); view.setUint32(4, 36 + numSamples * 2, true)
    writeString(8, 'WAVE'); writeString(12, 'fmt ')
    view.setUint32(16, 16, true); view.setUint16(20, 1, true)
    view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true)
    view.setUint16(34, 16, true); writeString(36, 'data')
    view.setUint32(40, numSamples * 2, true)
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate
      const envelope = Math.exp(-t * 5)
      let sample = 0
      if (type === 'sine') sample = Math.sin(2 * Math.PI * frequency * t)
      else if (type === 'square') sample = Math.sign(Math.sin(2 * Math.PI * frequency * t))
      else sample = 2 * (t * frequency - Math.floor(t * frequency + 0.5))
      view.setInt16(44 + i * 2, Math.round(sample * envelope * 16383), true)
    }
    const bytes = new Uint8Array(buffer)
    let binary = ''
    bytes.forEach(b => binary += String.fromCharCode(b))
    return 'data:audio/wav;base64,' + btoa(binary)
  }

  init() {
    const tones: Record<SoundKey, [number, number, OscillatorType]> = {
      click:      [800, 0.08, 'sine'],
      hover:      [600, 0.05, 'sine'],
      success:    [1000, 0.2, 'sine'],
      navigation: [500, 0.1, 'sine'],
      card:       [700, 0.1, 'sine'],
      favorite:   [1200, 0.15, 'sine'],
      error:      [200, 0.1, 'square'],
    }
    Object.entries(tones).forEach(([key, [freq, dur, type]]) => {
      const src = this.createToneBuffer(freq, dur, type)
      this.howls.set(key as SoundKey, new Howl({ src: [src], volume: SOUNDS[key as SoundKey].volume ?? 0.4, preload: true }))
    })
  }

  play(key: SoundKey) {
    const { muted, volume } = useSoundStore.getState()
    if (muted) return
    Howler.volume(volume)
    const howl = this.howls.get(key)
    if (howl) howl.play()
  }

  playCry(url: string) {
    const { muted, volume } = useSoundStore.getState()
    if (muted) return
    if (this.cryCache.has(url)) {
      this.cryCache.get(url)!.play()
      return
    }
    const howl = new Howl({ src: [url], format: ['ogg', 'mp3'], volume: Math.min(volume * 1.5, 1) })
    this.cryCache.set(url, howl)
    howl.play()
  }

  setVolume(v: number) { Howler.volume(v) }
  mute() { Howler.mute(true) }
  unmute() { Howler.mute(false) }
}

export const soundService = new SoundService()

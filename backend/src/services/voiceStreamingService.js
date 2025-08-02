const EventEmitter = require('events')
const logger = require('../config/logger')
const elevenLabsService = require('./elevenLabsService')
const VoiceSessionManager = require('./voiceSessionManager')

class VoiceStreamingService extends EventEmitter {
  constructor() {
    super()
    this.activeStreams = new Map()
    this.streamBuffer = new Map()
    this.maxBufferSize = 1024 * 1024 // 1MB buffer per stream
    this.streamTimeout = 30000 // 30 seconds
    this.sessionManager = new VoiceSessionManager()
    
    // Performance metrics
    this.metrics = {
      streamsCreated: 0,
      streamsCompleted: 0,
      streamsFailed: 0,
      totalLatency: 0,
      averageLatency: 0
    }
  }

  /**
   * Initialize voice streaming for a negotiation session
   */
  async initializeVoiceStream(negotiationId, userId, character, io) {
    const streamId = `voice_${negotiationId}_${Date.now()}`
    
    try {
      logger.info('Initializing voice stream', {
        streamId,
        negotiationId,
        userId,
        characterId: character.id,
        characterName: character.name
      })

      const streamConfig = {
        streamId,
        negotiationId,
        userId,
        character,
        io,
        status: 'initializing',
        createdAt: new Date(),
        lastActivity: new Date(),
        buffer: [],
        totalChunks: 0,
        totalBytes: 0
      }

      this.activeStreams.set(streamId, streamConfig)
      this.metrics.streamsCreated++

      // Create voice session
      await this.sessionManager.createSession(streamId, negotiationId, userId, character)

      // Notify client that stream is ready
      io.to(`negotiation-${negotiationId}`).emit('voice-stream-ready', {
        streamId,
        negotiationId,
        character: {
          id: character.id,
          name: character.name,
          voice_config: elevenLabsService.selectVoiceForCharacter(character)
        },
        status: 'ready',
        timestamp: new Date().toISOString()
      })

      streamConfig.status = 'ready'
      
      logger.info('Voice stream initialized successfully', { streamId, negotiationId })
      
      return streamId
      
    } catch (error) {
      logger.error('Failed to initialize voice stream', {
        streamId,
        negotiationId,
        error: error.message,
        stack: error.stack
      })
      
      this.metrics.streamsFailed++
      throw error
    }
  }

  /**
   * Process text-to-speech and stream audio in real-time
   */
  async streamVoiceResponse(streamId, text, metadata = {}) {
    const streamConfig = this.activeStreams.get(streamId)
    
    if (!streamConfig) {
      throw new Error(`Stream ${streamId} not found`)
    }

    const startTime = Date.now()
    let chunkCount = 0
    let totalBytes = 0

    try {
      logger.info('Starting voice response streaming', {
        streamId,
        negotiationId: streamConfig.negotiationId,
        textLength: text.length,
        characterId: streamConfig.character.id
      })

      streamConfig.status = 'generating'
      streamConfig.lastActivity = new Date()

      // Emit generation start event
      streamConfig.io.to(`negotiation-${streamConfig.negotiationId}`).emit('voice-generation-start', {
        streamId,
        negotiationId: streamConfig.negotiationId,
        character: streamConfig.character.name,
        textLength: text.length,
        timestamp: new Date().toISOString()
      })

      // Generate speech using ElevenLabs
      const speechResult = await elevenLabsService.generateSpeech(
        text,
        streamConfig.character,
        {
          optimize_streaming_latency: 4,
          output_format: 'mp3_44100_128'
        }
      )

      streamConfig.status = 'streaming'
      const audioStream = speechResult.audioStream

      // Handle audio stream chunks
      return new Promise((resolve, reject) => {
        const chunks = []
        let isFirstChunk = true

        audioStream.on('data', (chunk) => {
          chunkCount++
          totalBytes += chunk.length
          chunks.push(chunk)

          // Send first chunk as soon as possible for low latency
          if (isFirstChunk) {
            const firstChunkLatency = Date.now() - startTime
            logger.info('First audio chunk ready', {
              streamId,
              latencyMs: firstChunkLatency,
              chunkSize: chunk.length
            })

            streamConfig.io.to(`negotiation-${streamConfig.negotiationId}`).emit('voice-chunk-first', {
              streamId,
              negotiationId: streamConfig.negotiationId,
              chunk: chunk.toString('base64'),
              latency: firstChunkLatency,
              metadata: {
                ...metadata,
                isFirstChunk: true,
                totalExpectedChunks: 'unknown' // We don't know total yet
              },
              timestamp: new Date().toISOString()
            })

            isFirstChunk = false
          } else {
            // Stream subsequent chunks
            streamConfig.io.to(`negotiation-${streamConfig.negotiationId}`).emit('voice-chunk', {
              streamId,
              negotiationId: streamConfig.negotiationId,
              chunk: chunk.toString('base64'),
              chunkIndex: chunkCount,
              metadata: {
                ...metadata,
                isFirstChunk: false
              },
              timestamp: new Date().toISOString()
            })
          }

          // Update stream config
          streamConfig.totalChunks = chunkCount
          streamConfig.totalBytes = totalBytes
          streamConfig.lastActivity = new Date()
        })

        audioStream.on('end', () => {
          const totalLatency = Date.now() - startTime
          
          logger.info('Voice streaming completed', {
            streamId,
            negotiationId: streamConfig.negotiationId,
            totalLatency,
            chunkCount,
            totalBytes,
            characterId: streamConfig.character.id
          })

          // Emit completion event
          streamConfig.io.to(`negotiation-${streamConfig.negotiationId}`).emit('voice-stream-complete', {
            streamId,
            negotiationId: streamConfig.negotiationId,
            totalChunks: chunkCount,
            totalBytes,
            latency: totalLatency,
            metadata: {
              ...metadata,
              speechResult: speechResult.metadata
            },
            timestamp: new Date().toISOString()
          })

          streamConfig.status = 'completed'
          this.metrics.streamsCompleted++
          this.updateLatencyMetrics(totalLatency)

          // Update session with completion info
          this.sessionManager.updateSession(streamId, {
            status: 'completed',
            totalLatency,
            chunkCount,
            totalBytes,
            completedAt: new Date()
          })

          resolve({
            streamId,
            totalLatency,
            chunkCount,
            totalBytes,
            audioBuffer: Buffer.concat(chunks)
          })
        })

        audioStream.on('error', (error) => {
          logger.error('Audio stream error', {
            streamId,
            negotiationId: streamConfig.negotiationId,
            error: error.message,
            stack: error.stack
          })

          streamConfig.io.to(`negotiation-${streamConfig.negotiationId}`).emit('voice-stream-error', {
            streamId,
            negotiationId: streamConfig.negotiationId,
            error: error.message,
            timestamp: new Date().toISOString()
          })

          streamConfig.status = 'error'
          this.metrics.streamsFailed++

          reject(error)
        })

        // Set timeout for stream
        setTimeout(() => {
          if (streamConfig.status === 'streaming') {
            logger.warn('Stream timeout reached', { streamId })
            audioStream.destroy()
            reject(new Error('Stream timeout'))
          }
        }, this.streamTimeout)
      })

    } catch (error) {
      logger.error('Voice streaming failed', {
        streamId,
        negotiationId: streamConfig.negotiationId,
        error: error.message,
        stack: error.stack
      })

      streamConfig.status = 'error'
      this.metrics.streamsFailed++

      // Emit error to client
      streamConfig.io.to(`negotiation-${streamConfig.negotiationId}`).emit('voice-stream-error', {
        streamId,
        negotiationId: streamConfig.negotiationId,
        error: error.message,
        timestamp: new Date().toISOString()
      })

      throw error
    }
  }

  /**
   * Handle user audio input (for future speech-to-text functionality)
   */
  async processUserAudioInput(streamId, audioChunk, metadata = {}) {
    const streamConfig = this.activeStreams.get(streamId)
    
    if (!streamConfig) {
      throw new Error(`Stream ${streamId} not found`)
    }

    try {
      logger.info('Processing user audio input', {
        streamId,
        negotiationId: streamConfig.negotiationId,
        chunkSize: audioChunk.length,
        metadata
      })

      // For now, we'll just acknowledge receipt
      // Future: implement speech-to-text processing here
      
      streamConfig.io.to(`negotiation-${streamConfig.negotiationId}`).emit('user-audio-received', {
        streamId,
        negotiationId: streamConfig.negotiationId,
        chunkSize: audioChunk.length,
        timestamp: new Date().toISOString()
      })

      streamConfig.lastActivity = new Date()

      return {
        streamId,
        status: 'received',
        chunkSize: audioChunk.length
      }

    } catch (error) {
      logger.error('Failed to process user audio input', {
        streamId,
        error: error.message
      })
      throw error
    }
  }

  /**
   * Clean up and close voice stream
   */
  async closeVoiceStream(streamId, reason = 'completed') {
    const streamConfig = this.activeStreams.get(streamId)
    
    if (!streamConfig) {
      logger.warn('Attempted to close non-existent stream', { streamId })
      return
    }

    try {
      logger.info('Closing voice stream', {
        streamId,
        negotiationId: streamConfig.negotiationId,
        reason,
        duration: Date.now() - streamConfig.createdAt.getTime()
      })

      // Notify client
      streamConfig.io.to(`negotiation-${streamConfig.negotiationId}`).emit('voice-stream-closed', {
        streamId,
        negotiationId: streamConfig.negotiationId,
        reason,
        timestamp: new Date().toISOString()
      })

      // Update session
      await this.sessionManager.closeSession(streamId, reason)

      // Clean up
      this.activeStreams.delete(streamId)
      this.streamBuffer.delete(streamId)

      logger.info('Voice stream closed successfully', { streamId })

    } catch (error) {
      logger.error('Failed to close voice stream', {
        streamId,
        error: error.message
      })
    }
  }

  /**
   * Get stream status and metrics
   */
  getStreamStatus(streamId) {
    const streamConfig = this.activeStreams.get(streamId)
    
    if (!streamConfig) {
      return null
    }

    return {
      streamId: streamConfig.streamId,
      negotiationId: streamConfig.negotiationId,
      status: streamConfig.status,
      character: {
        id: streamConfig.character.id,
        name: streamConfig.character.name
      },
      createdAt: streamConfig.createdAt,
      lastActivity: streamConfig.lastActivity,
      totalChunks: streamConfig.totalChunks,
      totalBytes: streamConfig.totalBytes,
      duration: Date.now() - streamConfig.createdAt.getTime()
    }
  }

  /**
   * Get all active streams for monitoring
   */
  getActiveStreams() {
    const streams = []
    
    for (const [streamId, config] of this.activeStreams.entries()) {
      streams.push(this.getStreamStatus(streamId))
    }

    return streams
  }

  /**
   * Update latency metrics
   */
  updateLatencyMetrics(latency) {
    this.metrics.totalLatency += latency
    const totalCompleted = this.metrics.streamsCompleted
    this.metrics.averageLatency = totalCompleted > 0 ? this.metrics.totalLatency / totalCompleted : 0
  }

  /**
   * Get service metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      activeStreams: this.activeStreams.size,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Clean up expired streams
   */
  cleanupExpiredStreams() {
    const now = Date.now()
    const expiredStreams = []

    for (const [streamId, config] of this.activeStreams.entries()) {
      const age = now - config.lastActivity.getTime()
      if (age > this.streamTimeout) {
        expiredStreams.push(streamId)
      }
    }

    for (const streamId of expiredStreams) {
      logger.info('Cleaning up expired stream', { streamId })
      this.closeVoiceStream(streamId, 'expired')
    }

    return expiredStreams.length
  }

  /**
   * Start periodic cleanup
   */
  startCleanupInterval(intervalMs = 60000) { // 1 minute
    setInterval(() => {
      const cleaned = this.cleanupExpiredStreams()
      if (cleaned > 0) {
        logger.info('Cleaned up expired streams', { count: cleaned })
      }
    }, intervalMs)
  }
}

module.exports = VoiceStreamingService
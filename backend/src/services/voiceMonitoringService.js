const logger = require('../config/logger')
const EventEmitter = require('events')

class VoiceMonitoringService extends EventEmitter {
  constructor() {
    super()
    this.metrics = {
      system: {
        uptime: 0,
        memoryUsage: {},
        cpuUsage: 0,
        activeConnections: 0
      },
      voice: {
        totalSynthesisRequests: 0,
        successfulSynthesis: 0,
        failedSynthesis: 0,
        averageLatency: 0,
        totalLatency: 0,
        activeStreams: 0,
        totalStreamsCreated: 0
      },
      elevenlabs: {
        apiCalls: 0,
        apiErrors: 0,
        charactersUsed: 0,
        averageResponseTime: 0,
        rateLimitHits: 0,
        quotaUtilization: 0
      },
      websocket: {
        activeConnections: 0,
        totalConnections: 0,
        messagesReceived: 0,
        messagesSent: 0,
        disconnections: 0,
        errors: 0
      },
      database: {
        queries: 0,
        slowQueries: 0,
        errors: 0,
        averageQueryTime: 0,
        connectionPoolSize: 0
      }
    }

    this.alerts = []
    this.thresholds = this.initializeThresholds()
    this.startMonitoring()
  }

  /**
   * Initialize monitoring thresholds
   */
  initializeThresholds() {
    return {
      system: {
        memoryUsagePercent: 80, // Alert if memory usage > 80%
        cpuUsagePercent: 90,    // Alert if CPU usage > 90%
        uptimeMinimum: 3600     // Alert if uptime < 1 hour (unexpected restart)
      },
      voice: {
        latencyMs: 1500,        // Alert if average latency > 1.5s
        failureRate: 0.05,      // Alert if failure rate > 5%
        activeStreamsMax: 50    // Alert if too many concurrent streams
      },
      elevenlabs: {
        errorRate: 0.03,        // Alert if API error rate > 3%
        responseTimeMs: 2000,   // Alert if average response time > 2s
        quotaUtilization: 0.9   // Alert if quota utilization > 90%
      },
      websocket: {
        disconnectionRate: 0.1, // Alert if disconnection rate > 10%
        errorRate: 0.05,        // Alert if WebSocket error rate > 5%
        maxConnections: 1000    // Alert if too many connections
      },
      database: {
        slowQueryMs: 1000,      // Alert if queries taking > 1s
        errorRate: 0.02,        // Alert if DB error rate > 2%
        connectionPoolMin: 5    // Alert if connection pool too small
      }
    }
  }

  /**
   * Record voice synthesis metrics
   */
  recordVoiceSynthesis(data) {
    const { success, latency, characterId, error } = data

    this.metrics.voice.totalSynthesisRequests++
    
    if (success) {
      this.metrics.voice.successfulSynthesis++
      
      if (latency) {
        this.metrics.voice.totalLatency += latency
        this.metrics.voice.averageLatency = 
          this.metrics.voice.totalLatency / this.metrics.voice.successfulSynthesis
      }
    } else {
      this.metrics.voice.failedSynthesis++
      this.checkVoiceFailureRate()
    }

    // Check latency threshold
    if (latency && latency > this.thresholds.voice.latencyMs) {
      this.createAlert('voice_latency', `High voice synthesis latency: ${latency}ms`, 'warning')
    }

    this.emit('voice_synthesis_recorded', data)
  }

  /**
   * Record ElevenLabs API metrics
   */
  recordElevenLabsMetrics(data) {
    const { success, responseTime, charactersUsed, error, quotaInfo } = data

    this.metrics.elevenlabs.apiCalls++
    
    if (success) {
      if (responseTime) {
        const total = (this.metrics.elevenlabs.averageResponseTime * (this.metrics.elevenlabs.apiCalls - 1)) + responseTime
        this.metrics.elevenlabs.averageResponseTime = total / this.metrics.elevenlabs.apiCalls
      }
      
      if (charactersUsed) {
        this.metrics.elevenlabs.charactersUsed += charactersUsed
      }
    } else {
      this.metrics.elevenlabs.apiErrors++
      
      if (error?.includes('rate limit')) {
        this.metrics.elevenlabs.rateLimitHits++
        this.createAlert('elevenlabs_rate_limit', 'ElevenLabs rate limit hit', 'warning')
      }
    }

    // Update quota utilization
    if (quotaInfo) {
      this.metrics.elevenlabs.quotaUtilization = 
        quotaInfo.character_count / quotaInfo.character_limit
      
      if (this.metrics.elevenlabs.quotaUtilization > this.thresholds.elevenlabs.quotaUtilization) {
        this.createAlert('elevenlabs_quota', 
          `ElevenLabs quota utilization high: ${Math.round(this.metrics.elevenlabs.quotaUtilization * 100)}%`, 
          'critical')
      }
    }

    this.emit('elevenlabs_metrics_recorded', data)
  }

  /**
   * Record WebSocket metrics
   */
  recordWebSocketMetrics(event, data = {}) {
    switch (event) {
      case 'connection':
        this.metrics.websocket.activeConnections++
        this.metrics.websocket.totalConnections++
        break
      case 'disconnection':
        this.metrics.websocket.activeConnections = Math.max(0, this.metrics.websocket.activeConnections - 1)
        this.metrics.websocket.disconnections++
        break
      case 'message_received':
        this.metrics.websocket.messagesReceived++
        break
      case 'message_sent':
        this.metrics.websocket.messagesSent++
        break
      case 'error':
        this.metrics.websocket.errors++
        break
    }

    // Check thresholds
    if (this.metrics.websocket.activeConnections > this.thresholds.websocket.maxConnections) {
      this.createAlert('websocket_connections', 
        `High WebSocket connections: ${this.metrics.websocket.activeConnections}`, 
        'warning')
    }

    this.emit('websocket_metrics_recorded', { event, data })
  }

  /**
   * Record database metrics
   */
  recordDatabaseMetrics(data) {
    const { queryTime, success, error, query } = data

    this.metrics.database.queries++
    
    if (success) {
      if (queryTime) {
        const total = (this.metrics.database.averageQueryTime * (this.metrics.database.queries - 1)) + queryTime
        this.metrics.database.averageQueryTime = total / this.metrics.database.queries
        
        if (queryTime > this.thresholds.database.slowQueryMs) {
          this.metrics.database.slowQueries++
          this.createAlert('database_slow_query', 
            `Slow database query: ${queryTime}ms`, 
            'warning', 
            { query: query?.substring(0, 100) })
        }
      }
    } else {
      this.metrics.database.errors++
      this.checkDatabaseErrorRate()
    }

    this.emit('database_metrics_recorded', data)
  }

  /**
   * Record system metrics
   */
  recordSystemMetrics() {
    const memUsage = process.memoryUsage()
    
    this.metrics.system.uptime = process.uptime()
    this.metrics.system.memoryUsage = {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      usagePercent: (memUsage.heapUsed / memUsage.heapTotal) * 100
    }

    // Check memory threshold
    if (this.metrics.system.memoryUsage.usagePercent > this.thresholds.system.memoryUsagePercent) {
      this.createAlert('system_memory', 
        `High memory usage: ${Math.round(this.metrics.system.memoryUsage.usagePercent)}%`, 
        'critical')
    }

    // Record CPU usage (simplified)
    const cpuUsage = process.cpuUsage()
    this.metrics.system.cpuUsage = (cpuUsage.user + cpuUsage.system) / 1000000 // Convert to seconds

    this.emit('system_metrics_recorded', this.metrics.system)
  }

  /**
   * Create alert
   */
  createAlert(type, message, severity, metadata = {}) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type,
      message,
      severity, // 'info', 'warning', 'critical'
      metadata,
      timestamp: new Date(),
      acknowledged: false
    }

    this.alerts.push(alert)
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift()
    }

    logger[severity === 'critical' ? 'error' : severity === 'warning' ? 'warn' : 'info'](
      `ALERT [${severity.toUpperCase()}]: ${message}`, 
      { alertId: alert.id, metadata }
    )

    this.emit('alert_created', alert)

    // Auto-escalate critical alerts
    if (severity === 'critical') {
      this.escalateAlert(alert)
    }

    return alert.id
  }

  /**
   * Escalate critical alert
   */
  escalateAlert(alert) {
    // In production, this would send notifications via email, Slack, PagerDuty, etc.
    logger.error('CRITICAL ALERT ESCALATED', {
      alertId: alert.id,
      type: alert.type,
      message: alert.message,
      metadata: alert.metadata
    })

    // Could integrate with external alerting systems here
    this.emit('alert_escalated', alert)
  }

  /**
   * Check voice failure rate
   */
  checkVoiceFailureRate() {
    const total = this.metrics.voice.totalSynthesisRequests
    const failed = this.metrics.voice.failedSynthesis
    
    if (total > 10) { // Only check after minimum number of requests
      const failureRate = failed / total
      
      if (failureRate > this.thresholds.voice.failureRate) {
        this.createAlert('voice_failure_rate', 
          `High voice synthesis failure rate: ${Math.round(failureRate * 100)}%`, 
          'critical')
      }
    }
  }

  /**
   * Check database error rate
   */
  checkDatabaseErrorRate() {
    const total = this.metrics.database.queries
    const errors = this.metrics.database.errors
    
    if (total > 10) {
      const errorRate = errors / total
      
      if (errorRate > this.thresholds.database.errorRate) {
        this.createAlert('database_error_rate', 
          `High database error rate: ${Math.round(errorRate * 100)}%`, 
          'critical')
      }
    }
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      alerts: {
        total: this.alerts.length,
        unacknowledged: this.alerts.filter(a => !a.acknowledged).length,
        critical: this.alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length
      }
    }
  }

  /**
   * Get recent alerts
   */
  getAlerts(limit = 20, severity = null) {
    let alerts = [...this.alerts].reverse() // Most recent first
    
    if (severity) {
      alerts = alerts.filter(a => a.severity === severity)
    }
    
    return alerts.slice(0, limit)
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId)
    
    if (alert) {
      alert.acknowledged = true
      alert.acknowledgedAt = new Date()
      
      logger.info('Alert acknowledged', { alertId })
      this.emit('alert_acknowledged', alert)
      
      return true
    }
    
    return false
  }

  /**
   * Get system health status
   */
  getHealthStatus() {
    const health = {
      status: 'healthy',
      components: {},
      issues: []
    }

    // Check system health
    health.components.system = {
      status: this.metrics.system.memoryUsage.usagePercent > this.thresholds.system.memoryUsagePercent ? 'degraded' : 'healthy',
      metrics: {
        memoryUsage: `${Math.round(this.metrics.system.memoryUsage.usagePercent)}%`,
        uptime: `${Math.round(this.metrics.system.uptime / 3600)}h`
      }
    }

    // Check voice synthesis health
    const voiceFailureRate = this.metrics.voice.totalSynthesisRequests > 0 
      ? this.metrics.voice.failedSynthesis / this.metrics.voice.totalSynthesisRequests 
      : 0
    
    health.components.voice = {
      status: voiceFailureRate > this.thresholds.voice.failureRate || 
              this.metrics.voice.averageLatency > this.thresholds.voice.latencyMs ? 'degraded' : 'healthy',
      metrics: {
        averageLatency: `${Math.round(this.metrics.voice.averageLatency)}ms`,
        successRate: `${Math.round((1 - voiceFailureRate) * 100)}%`,
        activeStreams: this.metrics.voice.activeStreams
      }
    }

    // Check ElevenLabs health
    const elevenLabsErrorRate = this.metrics.elevenlabs.apiCalls > 0
      ? this.metrics.elevenlabs.apiErrors / this.metrics.elevenlabs.apiCalls
      : 0

    health.components.elevenlabs = {
      status: elevenLabsErrorRate > this.thresholds.elevenlabs.errorRate ||
              this.metrics.elevenlabs.averageResponseTime > this.thresholds.elevenlabs.responseTimeMs ? 'degraded' : 'healthy',
      metrics: {
        errorRate: `${Math.round(elevenLabsErrorRate * 100)}%`,
        averageResponseTime: `${Math.round(this.metrics.elevenlabs.averageResponseTime)}ms`,
        quotaUtilization: `${Math.round(this.metrics.elevenlabs.quotaUtilization * 100)}%`
      }
    }

    // Check WebSocket health
    const wsDisconnectionRate = this.metrics.websocket.totalConnections > 0
      ? this.metrics.websocket.disconnections / this.metrics.websocket.totalConnections
      : 0

    health.components.websocket = {
      status: wsDisconnectionRate > this.thresholds.websocket.disconnectionRate ? 'degraded' : 'healthy',
      metrics: {
        activeConnections: this.metrics.websocket.activeConnections,
        disconnectionRate: `${Math.round(wsDisconnectionRate * 100)}%`
      }
    }

    // Check database health
    const dbErrorRate = this.metrics.database.queries > 0
      ? this.metrics.database.errors / this.metrics.database.queries
      : 0

    health.components.database = {
      status: dbErrorRate > this.thresholds.database.errorRate ||
              this.metrics.database.averageQueryTime > this.thresholds.database.slowQueryMs ? 'degraded' : 'healthy',
      metrics: {
        averageQueryTime: `${Math.round(this.metrics.database.averageQueryTime)}ms`,
        errorRate: `${Math.round(dbErrorRate * 100)}%`,
        slowQueries: this.metrics.database.slowQueries
      }
    }

    // Determine overall status
    const componentStatuses = Object.values(health.components).map(c => c.status)
    if (componentStatuses.includes('degraded')) {
      health.status = 'degraded'
    }

    // Add recent critical issues
    health.issues = this.alerts
      .filter(a => a.severity === 'critical' && !a.acknowledged)
      .slice(0, 5)
      .map(a => ({
        type: a.type,
        message: a.message,
        timestamp: a.timestamp
      }))

    return health
  }

  /**
   * Start monitoring
   */
  startMonitoring() {
    // Record system metrics every 30 seconds
    setInterval(() => {
      this.recordSystemMetrics()
    }, 30000)

    // Clean up old alerts every hour
    setInterval(() => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      this.alerts = this.alerts.filter(a => a.timestamp > oneHourAgo || !a.acknowledged)
    }, 60 * 60 * 1000)

    logger.info('Voice monitoring service started')
  }

  /**
   * Export metrics for external monitoring systems
   */
  exportMetrics(format = 'json') {
    const metrics = this.getMetrics()
    
    if (format === 'prometheus') {
      // Convert to Prometheus format
      return this.toPrometheusFormat(metrics)
    }
    
    return metrics
  }

  /**
   * Convert metrics to Prometheus format
   */
  toPrometheusFormat(metrics) {
    const lines = []
    
    // System metrics
    lines.push(`# HELP voice_system_memory_usage Memory usage percentage`)
    lines.push(`# TYPE voice_system_memory_usage gauge`)
    lines.push(`voice_system_memory_usage ${metrics.system.memoryUsage.usagePercent}`)
    
    // Voice metrics
    lines.push(`# HELP voice_synthesis_latency_ms Average voice synthesis latency`)
    lines.push(`# TYPE voice_synthesis_latency_ms gauge`)
    lines.push(`voice_synthesis_latency_ms ${metrics.voice.averageLatency}`)
    
    lines.push(`# HELP voice_synthesis_requests_total Total voice synthesis requests`)
    lines.push(`# TYPE voice_synthesis_requests_total counter`)
    lines.push(`voice_synthesis_requests_total ${metrics.voice.totalSynthesisRequests}`)
    
    // Add more metrics as needed...
    
    return lines.join('\n')
  }
}

module.exports = VoiceMonitoringService
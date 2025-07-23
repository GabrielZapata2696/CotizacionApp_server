import { Usuario } from '@/models/Usuario';
import { Empresa } from '@/models/Empresa';
import { logger } from '@/utils/logger';

export interface AuditLogEntry {
  userId: number;
  userName: string;
  userEmail: string;
  companyId?: number;
  companyName?: string;
  action: AuditAction;
  resource?: string;
  resourceId?: number;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  severity: AuditSeverity;
}

export enum AuditAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED',
  
  // User Management
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_PROFILE_VIEWED = 'USER_PROFILE_VIEWED',
  USER_PREFERENCES_UPDATED = 'USER_PREFERENCES_UPDATED',
  
  // Company Management
  COMPANY_CREATED = 'COMPANY_CREATED',
  COMPANY_UPDATED = 'COMPANY_UPDATED',
  COMPANY_VIEWED = 'COMPANY_VIEWED',
  COMPANY_SETTINGS_UPDATED = 'COMPANY_SETTINGS_UPDATED',
  PAYMENT_SETTINGS_UPDATED = 'PAYMENT_SETTINGS_UPDATED',
  
  // Pricing & Quotations
  PRICING_CALCULATED = 'PRICING_CALCULATED',
  QUOTATION_CREATED = 'QUOTATION_CREATED',
  QUOTATION_UPDATED = 'QUOTATION_UPDATED',
  QUOTATION_VIEWED = 'QUOTATION_VIEWED',
  METAL_RATES_VIEWED = 'METAL_RATES_VIEWED',
  METAL_RATES_UPDATED = 'METAL_RATES_UPDATED',
  FORMULA_VIEWED = 'FORMULA_VIEWED',
  FORMULA_UPDATED = 'FORMULA_UPDATED',
  
  // Products
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED',
  PRODUCT_VIEWED = 'PRODUCT_VIEWED',
  PRODUCT_DELETED = 'PRODUCT_DELETED',
  PRODUCT_PRICE_CALCULATED = 'PRODUCT_PRICE_CALCULATED',
  
  // System Events
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  API_RATE_LIMIT_EXCEEDED = 'API_RATE_LIMIT_EXCEEDED',
  QUERY_LIMIT_EXCEEDED = 'QUERY_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS_ATTEMPT = 'UNAUTHORIZED_ACCESS_ATTEMPT',
  
  // File Operations
  FILE_UPLOADED = 'FILE_UPLOADED',
  FILE_DELETED = 'FILE_DELETED',
  
  // Admin Actions
  ADMIN_ACTION = 'ADMIN_ACTION',
  SYSTEM_CONFIGURATION_CHANGED = 'SYSTEM_CONFIGURATION_CHANGED'
}

export enum AuditSeverity {
  LOW = 'LOW',       // Regular user actions
  MEDIUM = 'MEDIUM', // Important business operations
  HIGH = 'HIGH',     // Security events, errors
  CRITICAL = 'CRITICAL' // System failures, security breaches
}

export class AuditService {
  
  /**
   * Log an audit entry
   */
  public static async log(entry: Partial<AuditLogEntry>): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        userId: entry.userId!,
        userName: entry.userName || 'Unknown',
        userEmail: entry.userEmail || 'Unknown',
        companyId: entry.companyId,
        companyName: entry.companyName,
        action: entry.action!,
        resource: entry.resource,
        resourceId: entry.resourceId,
        details: entry.details,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        timestamp: entry.timestamp || new Date(),
        severity: entry.severity || AuditSeverity.LOW
      };

      // Log to Winston logger with structured data
      logger.info('AUDIT_LOG', {
        audit: auditEntry,
        type: 'audit',
        level: auditEntry.severity
      });

      // In a production environment, you might also want to:
      // 1. Store in a separate audit database/table
      // 2. Send to external audit logging service
      // 3. Alert on critical events
      
      // Handle critical events
      if (auditEntry.severity === AuditSeverity.CRITICAL) {
        await AuditService.handleCriticalEvent(auditEntry);
      }

    } catch (error) {
      // Never let audit logging break the main application flow
      logger.error('Failed to write audit log:', error);
    }
  }

  /**
   * Log user authentication events
   */
  public static async logAuth(
    action: AuditAction,
    userId: number,
    userName: string,
    userEmail: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const severity = action === AuditAction.LOGIN_FAILED || 
                    action === AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT 
                    ? AuditSeverity.HIGH 
                    : AuditSeverity.MEDIUM;

    await AuditService.log({
      userId,
      userName,
      userEmail,
      action,
      details,
      ipAddress,
      userAgent,
      severity
    });
  }

  /**
   * Log pricing and calculation events
   */
  public static async logPricing(
    action: AuditAction,
    userId: number,
    companyId?: number,
    details?: {
      productId?: number;
      calculatedPrice?: number;
      metalRates?: any;
      formulaUsed?: any;
      currency?: string;
    },
    ipAddress?: string
  ): Promise<void> {
    try {
      const user = await Usuario.findByPk(userId, {
        include: [{
          model: Empresa,
          as: 'empresa',
          attributes: ['id', 'nombre']
        }]
      });

      if (user) {
        await AuditService.log({
          userId,
          userName: user.nombre,
          userEmail: user.email,
          companyId: companyId || user.empresaId,
          companyName: user.empresa?.nombre,
          action,
          resource: 'pricing',
          details,
          ipAddress,
          severity: AuditSeverity.MEDIUM
        });

        // Update user's weekly query count for pricing calculations
        if (action === AuditAction.PRICING_CALCULATED || action === AuditAction.PRODUCT_PRICE_CALCULATED) {
          await AuditService.updateUserQueryCount(userId);
        }
      }
    } catch (error) {
      logger.error('Failed to log pricing audit:', error);
    }
  }

  /**
   * Log quotation events
   */
  public static async logQuotation(
    action: AuditAction,
    userId: number,
    quotationId: number,
    details?: any,
    ipAddress?: string
  ): Promise<void> {
    try {
      const user = await Usuario.findByPk(userId, {
        include: [{
          model: Empresa,
          as: 'empresa',
          attributes: ['id', 'nombre']
        }]
      });

      if (user) {
        await AuditService.log({
          userId,
          userName: user.nombre,
          userEmail: user.email,
          companyId: user.empresaId,
          companyName: user.empresa?.nombre,
          action,
          resource: 'quotation',
          resourceId: quotationId,
          details,
          ipAddress,
          severity: AuditSeverity.MEDIUM
        });
      }
    } catch (error) {
      logger.error('Failed to log quotation audit:', error);
    }
  }

  /**
   * Log admin actions
   */
  public static async logAdmin(
    action: AuditAction,
    userId: number,
    resource?: string,
    resourceId?: number,
    details?: any,
    ipAddress?: string
  ): Promise<void> {
    try {
      const user = await Usuario.findByPk(userId);

      if (user) {
        await AuditService.log({
          userId,
          userName: user.nombre,
          userEmail: user.email,
          action,
          resource,
          resourceId,
          details,
          ipAddress,
          severity: AuditSeverity.HIGH
        });
      }
    } catch (error) {
      logger.error('Failed to log admin audit:', error);
    }
  }

  /**
   * Log system errors and security events
   */
  public static async logSecurity(
    action: AuditAction,
    userId?: number,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    let userName = 'System';
    let userEmail = 'system@sitekol.com';

    if (userId) {
      try {
        const user = await Usuario.findByPk(userId);
        if (user) {
          userName = user.nombre;
          userEmail = user.email;
        }
      } catch (error) {
        // Continue with default values
      }
    }

    await AuditService.log({
      userId: userId || 0,
      userName,
      userEmail,
      action,
      details,
      ipAddress,
      userAgent,
      severity: AuditSeverity.HIGH
    });
  }

  /**
   * Get audit logs for a user (admin only)
   */
  public static async getUserAuditLogs(
    userId: number,
    limit: number = 100,
    offset: number = 0
  ): Promise<AuditLogEntry[]> {
    // In a real implementation, this would query the audit database
    // For now, we'll return an empty array since we're logging to Winston
    // You would implement this based on your chosen audit storage solution
    return [];
  }

  /**
   * Get system audit logs (admin only)
   */
  public static async getSystemAuditLogs(
    filters?: {
      action?: AuditAction;
      severity?: AuditSeverity;
      startDate?: Date;
      endDate?: Date;
    },
    limit: number = 100,
    offset: number = 0
  ): Promise<AuditLogEntry[]> {
    // In a real implementation, this would query the audit database
    return [];
  }

  /**
   * Update user's weekly query count
   */
  private static async updateUserQueryCount(userId: number): Promise<void> {
    try {
      const user = await Usuario.findByPk(userId);
      if (user) {
        const now = new Date();
        const weekStart = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        
        // Reset counter if it's a new week
        if (!user.fechaUltimaConsulta || user.fechaUltimaConsulta < weekStart) {
          await user.update({
            consultasSemana: 1,
            fechaUltimaConsulta: now
          });
        } else {
          await user.update({
            consultasSemana: (user.consultasSemana || 0) + 1,
            fechaUltimaConsulta: now
          });
        }
      }
    } catch (error) {
      logger.error('Failed to update user query count:', error);
    }
  }

  /**
   * Handle critical audit events
   */
  private static async handleCriticalEvent(entry: AuditLogEntry): Promise<void> {
    try {
      // Log to console for immediate visibility
      console.error(`CRITICAL AUDIT EVENT: ${entry.action}`, entry);

      // In production, you might:
      // 1. Send email/SMS alerts to administrators
      // 2. Create incident tickets
      // 3. Trigger security response workflows
      // 4. Store in high-priority security database

      logger.error('CRITICAL_AUDIT_EVENT', {
        audit: entry,
        alert: true,
        requiresAttention: true
      });

    } catch (error) {
      logger.error('Failed to handle critical audit event:', error);
    }
  }

  /**
   * Generate audit report (admin only)
   */
  public static async generateAuditReport(
    startDate: Date,
    endDate: Date,
    userId?: number
  ): Promise<{
    summary: {
      totalEvents: number;
      eventsByAction: { [key: string]: number };
      eventsBySeverity: { [key: string]: number };
      topUsers: { userId: number; userName: string; eventCount: number }[];
    };
    events: AuditLogEntry[];
  }> {
    // In a real implementation, this would generate comprehensive reports
    // from the audit database
    return {
      summary: {
        totalEvents: 0,
        eventsByAction: {},
        eventsBySeverity: {},
        topUsers: []
      },
      events: []
    };
  }
}

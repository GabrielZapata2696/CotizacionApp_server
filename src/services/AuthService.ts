import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import Session from '../models/Session';
import config from '../config';

interface SessionInfo {
  ip_address?: string;
  user_agent?: string;
}

export class AuthService {
  /**
   * Check if user has any active sessions
   */
  async hasActiveSession(userId: string): Promise<boolean> {
    try {
      const activeSession = await Session.findOne({
        where: {
          usuario_id: userId,
          is_active: true,
          expires_at: {
            [Op.gt]: new Date()
          }
        }
      });
      
      return !!activeSession;
    } catch (error) {
      console.error('Error checking active session:', error);
      return false;
    }
  }

  /**
   * Create a new session for the user
   */
  async createSession(
    userId: string, 
    accessToken: string, 
    refreshToken: string,
    sessionInfo?: SessionInfo
  ): Promise<void> {
    try {
      // Calculate expiration times
      const accessTokenExpira = new Date();
      accessTokenExpira.setHours(accessTokenExpira.getHours() + 24); // 24 hours
      
      const refreshTokenExpira = new Date();
      refreshTokenExpira.setDate(refreshTokenExpira.getDate() + 7); // 7 days
      
      // Create session record
      await Session.create({
        usuario_id: userId,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: accessTokenExpira,
        refresh_expires_at: refreshTokenExpira,
        ip_address: sessionInfo?.ip_address,
        user_agent: sessionInfo?.user_agent,
        is_active: true
      });
      
      console.log(`✅ Session created for user ${userId}`);
    } catch (error) {
      console.error('❌ Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  /**
   * Invalidate all sessions for a user
   */
  async invalidateUserSessions(userId: string): Promise<void> {
    try {
      await Session.update(
        { is_active: false },
        {
          where: {
            usuario_id: userId,
            is_active: true
          }
        }
      );
      
      console.log(`✅ All sessions invalidated for user ${userId}`);
    } catch (error) {
      console.error('❌ Error invalidating user sessions:', error);
      throw new Error('Failed to invalidate sessions');
    }
  }

  /**
   * Invalidate a specific session by token
   */
  async invalidateSession(accessToken: string): Promise<void> {
    try {
      await Session.update(
        { is_active: false },
        {
          where: {
            access_token: accessToken,
            is_active: true
          }
        }
      );
      
      console.log(`✅ Session invalidated for token`);
    } catch (error) {
      console.error('❌ Error invalidating session:', error);
      throw new Error('Failed to invalidate session');
    }
  }

  /**
   * Validate if a session is active and not expired
   */
  async validateSession(accessToken: string): Promise<Session | null> {
    try {
      const session = await Session.findOne({
        where: {
          access_token: accessToken,
          is_active: true,
          expires_at: {
            [Op.gt]: new Date()
          }
        }
      });
      
      return session;
    } catch (error) {
      console.error('❌ Error validating session:', error);
      return null;
    }
  }

  /**
   * Refresh a session with new tokens
   */
  async refreshSession(
    refreshToken: string, 
    newAccessToken: string, 
    newRefreshToken: string
  ): Promise<Session | null> {
    try {
      // Find session by refresh token
      const session = await Session.findOne({
        where: {
          refresh_token: refreshToken,
          is_active: true,
          refresh_expires_at: {
            [Op.gt]: new Date()
          }
        }
      });
      
      if (!session) {
        return null;
      }
      
      // Update with new tokens and expiry times
      const accessTokenExpira = new Date();
      accessTokenExpira.setHours(accessTokenExpira.getHours() + 24);
      
      const refreshTokenExpira = new Date();
      refreshTokenExpira.setDate(refreshTokenExpira.getDate() + 7);
      
      await session.update({
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_at: accessTokenExpira,
        refresh_expires_at: refreshTokenExpira
      });
      
      console.log(`✅ Session refreshed for user ${session.usuario_id}`);
      return session;
    } catch (error) {
      console.error('❌ Error refreshing session:', error);
      return null;
    }
  }

  /**
   * Clean up expired sessions (should be run periodically)
   * todo: crear un job para ejecutar esto periódicamente
   *       o usar un cron job si el framework lo soporta
   * 
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await Session.destroy({
        where: {
          [Op.or]: [
            {
              expires_at: {
                [Op.lt]: new Date()
              }
            },
            {
              refresh_expires_at: {
                [Op.lt]: new Date()
              }
            }
          ]
        }
      });
      
      console.log(`🧹 Cleaned up ${result} expired sessions`);
      return result;
    } catch (error) {
      console.error('❌ Error cleaning up expired sessions:', error);
      return 0;
    }
  }

  /**
   * Get active sessions for a user
   */
  async getUserActiveSessions(userId: string): Promise<Session[]> {
    try {
      const sessions = await Session.findAll({
        where: {
          usuario_id: userId,
          is_active: true,
          expires_at: {
            [Op.gt]: new Date()
          }
        },
        order: [['created_at', 'DESC']],
        attributes: ['id', 'ip_address', 'user_agent', 'created_at', 'expires_at']
      });
      
      return sessions;
    } catch (error) {
      console.error('❌ Error getting user active sessions:', error);
      return [];
    }
  }
}

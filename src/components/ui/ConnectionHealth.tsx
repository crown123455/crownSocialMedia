'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import styles from './ConnectionHealth.module.css';
import { ConnectionHealth as HealthType } from '@/types';

interface Props {
  health: HealthType;
  platform: string;
  onAction?: (action: string) => void;
}

export function ConnectionHealth({ health, platform, onAction }: Props) {
  const getIcon = () => {
    switch (health.status) {
      case 'connected': return <CheckCircle2 className="text-success" size={20} />;
      case 'expiring_soon': return <Clock className="text-warning" size={20} />;
      case 'expired': return <XCircle className="text-error" size={20} />;
      case 'missing_permissions':
      case 'app_review_required':
      case 'unsupported_account_type': return <AlertTriangle className="text-warning" size={20} />;
      case 'rate_limited':
      case 'api_error': return <AlertCircle className="text-error" size={20} />;
      default: return <AlertCircle size={20} />;
    }
  };

  const getContainerClass = () => {
    switch (health.status) {
      case 'connected': return styles.success;
      case 'expiring_soon':
      case 'missing_permissions':
      case 'app_review_required':
      case 'unsupported_account_type': return styles.warning;
      case 'expired':
      case 'rate_limited':
      case 'api_error': return styles.error;
      default: return styles.default;
    }
  };

  return (
    <div className={`${styles.container} ${getContainerClass()}`}>
      <div className={styles.iconWrap}>
        {getIcon()}
      </div>
      <div className={styles.content}>
        <h4 className={styles.title}>
          {health.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </h4>
        <p className={styles.message}>{health.message}</p>
        <span className={styles.time}>Last checked: {new Date(health.last_checked).toLocaleString()}</span>
      </div>
      {health.action_required && health.action_required !== 'wait' && (
        <div className={styles.actionWrap}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAction && onAction(health.action_required!)}
          >
            {health.action_required === 'reconnect' ? `Reconnect ${platform}` : 'View Details'}
          </Button>
        </div>
      )}
    </div>
  );
}

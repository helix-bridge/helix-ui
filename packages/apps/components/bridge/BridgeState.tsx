import { Alert } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { map } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { useApi } from '../../hooks';

interface IncidentResponse {
  page: Page;
  incidents: Incident[];
}

interface Incident {
  created_at: string;
  id: string;
  impact: string;
  incident_updates: IncidentUpdated[];
  monitoring_at?: number;
  name: string;
  page_id: string;
  resolved_at?: number;
  shortlink: string;
  status: string;
  updated_at: string;
}

interface IncidentUpdated {
  body: string;
  created_at: string;
  display_at: string;
  id: string;
  incident_id: string;
  status: string;
  updated_at: string;
}

interface Page {
  id: string;
  name: string;
  url: string;
  updated_at: string;
}

interface BridgeStateProps {
  className?: string;
}

export function BridgeState({ className = '' }: BridgeStateProps) {
  const { isDev } = useApi();

  const url = useMemo(
    () =>
      isDev
        ? 'https://jsr14wbllzf1.statuspage.io/api/v2/incidents/unresolved.json'
        : 'https://kjb7q9wwny2q.statuspage.io/api/v2/incidents/unresolved.json',
    [isDev]
  );

  const [message, setMessage] = useState('');

  useEffect(() => {
    const sub$$ = ajax<IncidentResponse>({ url, method: 'GET' })
      .pipe(map((res) => res.response || null))
      .subscribe((data) => {
        const target = data.incidents.find((item) => !!item.incident_updates.length);

        if (target) {
          setMessage(target.incident_updates[0].body);
        }
      });

    return () => sub$$.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return message ? <Alert showIcon type="warning" closable message={message} className={className} /> : null;
}

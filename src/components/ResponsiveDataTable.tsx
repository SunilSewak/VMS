import React from 'react';

export interface ColumnDefinition<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  /**
   * priority determines when to display the column:
   * - 'always': Displayed on desktop, tablet, and mobile cards.
   * - 'tablet-desktop': Displayed on tablet and desktop. Hidden on mobile viewports.
   * - 'desktop': Only displayed on desktop. Hidden on tablet and mobile.
   */
  priority: 'always' | 'tablet-desktop' | 'desktop';
  /**
   * Optional field used for rendering labeled card details on mobile layout
   */
  mobileLabel?: string;
}

interface ResponsiveDataTableProps<T> {
  columns: ColumnDefinition<T>[];
  data: T[];
  emptyState?: React.ReactNode;
  keyExtractor: (row: T) => string | number;
}

export function ResponsiveDataTable<T>({ columns, data, emptyState, keyExtractor }: ResponsiveDataTableProps<T>) {
  if (data.length === 0) {
    return <>{emptyState || <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No data available</div>}</>;
  }

  return (
    <div style={{ width: '100%' }}>
      {/* 1. Desktop & Tablet View (HTML Table with class-driven column visibility) */}
      <div className="hide-mobile" style={{ width: '100%', overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--surface)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-sm)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
              {columns.map((col, idx) => {
                let className = '';
                if (col.priority === 'desktop') {
                  className = 'show-desktop';
                } else if (col.priority === 'tablet-desktop') {
                  className = 'hide-mobile'; // visible on tablet & desktop
                }
                
                return (
                  <th 
                    key={idx} 
                    className={className}
                    style={{ 
                      padding: 'var(--space-3) var(--space-4)', 
                      fontWeight: '600', 
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      fontSize: '11px',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr 
                key={keyExtractor(row)} 
                style={{ borderBottom: '1px solid var(--border)', transition: 'background-color var(--transition-fast)' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {columns.map((col, idx) => {
                  let className = '';
                  if (col.priority === 'desktop') {
                    className = 'show-desktop';
                  } else if (col.priority === 'tablet-desktop') {
                    className = 'hide-mobile';
                  }

                  return (
                    <td 
                      key={idx} 
                      className={className}
                      style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-main)', verticalAlign: 'middle' }}
                    >
                      {col.accessor(row)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile View (Stacked Cards Layout) */}
      <div className="show-mobile" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {data.map((row) => (
          <div 
            key={keyExtractor(row)} 
            className="card" 
            style={{ 
              padding: 'var(--space-4)', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 'var(--space-2)' 
            }}
          >
            {/* Find the 'always' priority columns first to render as a header, e.g., name or primary details */}
            {columns.map((col, idx) => {
              const val = col.accessor(row);
              
              if (idx === 0 || col.priority === 'always') {
                return (
                  <div key={idx} style={{ borderBottom: idx === 0 ? '1px solid var(--border)' : 'none', paddingBottom: idx === 0 ? 'var(--space-2)' : '0', marginBottom: idx === 0 ? 'var(--space-2)' : '0' }}>
                    {idx === 0 ? (
                      <div style={{ fontWeight: '700', fontSize: 'var(--font-base)', color: 'var(--primary)' }}>
                        {val}
                      </div>
                    ) : (
                      <div style={{ fontSize: 'var(--font-sm)' }}>
                        {val}
                      </div>
                    )}
                  </div>
                );
              }

              // Other columns rendered as labeled key-values
              return (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-xs)', borderBottom: '1px dashed var(--border)', paddingBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>{col.mobileLabel || col.header}</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '600', textAlign: 'right' }}>{val}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

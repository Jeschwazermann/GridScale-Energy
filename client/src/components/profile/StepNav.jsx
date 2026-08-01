/**
 * StepNav.jsx
 * Horizontal step progress bar for ProfileBuilder.
 */

export function StepNav({ steps, current, canNavigate, onNavigate }) {
  return (
    <nav className="pb-stepnav" aria-label="Profile builder steps">
      {steps.map((step, i) => {
        const done      = step.id < current;
        const active    = step.id === current;
        const reachable = canNavigate(step.id);

        return (
          <button
            key={step.id}
            className={[
              'pb-step-pill',
              done    ? 'pb-step-done'   : '',
              active  ? 'pb-step-active' : '',
              !reachable && !done && !active ? 'pb-step-locked' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => reachable && onNavigate(step.id)}
            disabled={!reachable}
            aria-current={active ? 'step' : undefined}
            aria-label={`Step ${step.id}: ${step.label}${done ? ' (complete)' : ''}`}
          >
            <span className="pb-step-num">
              {done ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : step.id}
            </span>
            <span className="pb-step-label">{step.label}</span>

            {/* Connector line between steps */}
            {i < steps.length - 1 && (
              <span className={`pb-step-connector ${done ? 'pb-connector-done' : ''}`} aria-hidden />
            )}
          </button>
        );
      })}
    </nav>
  );
}

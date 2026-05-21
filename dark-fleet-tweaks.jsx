/* global React, ReactDOM, TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakColor, TweakToggle */
const { useEffect } = React;

const ACCENT_OPTIONS = [
  { id: 'amber',   color: '#f0a040' },
  { id: 'signal',  color: '#e85d3a' },
  { id: 'purple',  color: '#a07bd4' },
  { id: 'sky',     color: '#5bbce8' },
];

function DarkFleetTweaks() {
  const defaults = window.__TWEAK_DEFAULTS || {
    primaryAccent: 'amber', density: 'spacious', mapDefault: 'globe', showUncertainty: true,
  };
  const [t, setTweak] = useTweaks(defaults);

  // Apply accent
  useEffect(() => {
    const map = {
      amber:  '#f0a040',
      signal: '#e85d3a',
      purple: '#a07bd4',
      sky:    '#5bbce8',
    };
    const c = map[t.primaryAccent] || '#f0a040';
    document.documentElement.style.setProperty('--accent-invisible', c);
    // Tint variants
    const hex2rgba = (hex, a) => {
      const n = parseInt(hex.slice(1), 16);
      return `rgba(${(n>>16)&255}, ${(n>>8)&255}, ${n&255}, ${a})`;
    };
    document.documentElement.style.setProperty('--accent-invisible-20', hex2rgba(c, 0.2));
    document.documentElement.style.setProperty('--accent-invisible-10', hex2rgba(c, 0.1));
  }, [t.primaryAccent]);

  // Density
  useEffect(() => {
    document.body.classList.toggle('compact', t.density === 'compact');
  }, [t.density]);

  // Uncertainty notes
  useEffect(() => {
    document.querySelectorAll('.uncertainty-note').forEach(el => {
      el.style.display = t.showUncertainty ? '' : 'none';
    });
  }, [t.showUncertainty]);

  // Map default — only acts on first apply
  useEffect(() => {
    if (t.mapDefault === 'flat') {
      // Defer to allow map init
      const tryClick = () => {
        const btn = document.getElementById('proj-flat');
        if (btn && !btn.classList.contains('active')) btn.click();
      };
      setTimeout(tryClick, 400);
    }
  }, [t.mapDefault]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Accent color">
        <TweakColor
          label="Primary accent (dark fleet)"
          value={t.primaryAccent}
          options={ACCENT_OPTIONS.map(o => o.color)}
          onChange={(c) => {
            const found = ACCENT_OPTIONS.find(o => o.color === c);
            setTweak('primaryAccent', found ? found.id : 'amber');
          }}
        />
      </TweakSection>
      <TweakSection title="Layout">
        <TweakRadio
          label="Density"
          value={t.density}
          options={[
            { value: 'spacious', label: 'Spacious' },
            { value: 'compact',  label: 'Compact'  },
          ]}
          onChange={(v) => setTweak('density', v)}
        />
      </TweakSection>
      <TweakSection title="Map">
        <TweakRadio
          label="Default projection"
          value={t.mapDefault}
          options={[
            { value: 'globe', label: 'Globe' },
            { value: 'flat',  label: 'Flat'  },
          ]}
          onChange={(v) => setTweak('mapDefault', v)}
        />
      </TweakSection>
      <TweakSection title="Editorial">
        <TweakToggle
          label="Show uncertainty notes"
          value={t.showUncertainty}
          onChange={(v) => setTweak('showUncertainty', v)}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<DarkFleetTweaks />);

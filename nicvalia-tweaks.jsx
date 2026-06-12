/* Tweaks de NicValia — acento + animación de zoom */
const NV_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#e85c8f",
  "zoomDur": 1.4,
  "zoomScale": 1.08,
  "logoStyle": "integrado"
}/*EDITMODE-END*/;

function NvTweaks() {
  const [t, setTweak] = useTweaks(NV_TWEAK_DEFAULTS);

  React.useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--accent", t.accent);
    root.setProperty("--accent-ink", "color-mix(in oklab, " + t.accent + " 78%, #54323e)");
    root.setProperty("--zoom-dur", t.zoomDur + "s");
    root.setProperty("--zoom-scale", String(t.zoomScale));
  }, [t]);

  React.useEffect(() => {
    const circular = t.logoStyle === "circular";
    document.documentElement.setAttribute("data-logo", circular ? "circular" : "integrado");
    const src = circular ? "images/logo-nicvalia.jpg" : "images/logo-hd.png";
    document.querySelectorAll(".brand-logo, .footer-logo").forEach((img) => {
      if (!img.src.endsWith(src)) img.src = src;
    });
  }, [t.logoStyle]);

  return (
    <TweaksPanel>
      <TweakSection label="Logo" />
      <TweakRadio
        label="Estilo"
        value={t.logoStyle}
        options={["integrado", "circular"]}
        onChange={(v) => setTweak("logoStyle", v)}
      />
      <TweakSection label="Color" />
      <TweakColor
        label="Rosa de acento"
        value={t.accent}
        options={["#e85c8f", "#f178a4", "#d94f6e", "#c2185b"]}
        onChange={(v) => setTweak("accent", v)}
      />
      <TweakSection label="Zoom de productos" />
      <TweakSlider
        label="Velocidad"
        value={t.zoomDur}
        min={0.4} max={3} step={0.1} unit="s"
        onChange={(v) => setTweak("zoomDur", v)}
      />
      <TweakSlider
        label="Intensidad"
        value={t.zoomScale}
        min={1.02} max={1.2} step={0.01} unit="×"
        onChange={(v) => setTweak("zoomScale", v)}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<NvTweaks />);

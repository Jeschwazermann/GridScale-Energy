import { useState, useRef, useEffect } from "react";
import {
  User,
  Building,
  Phone,
  MapPin,
  Zap,
  Fuel,
  Camera,
  CheckCircle,
  AlertCircle,
  Loader,
  Mail,
} from "lucide-react";
import InstallerLayout from "../../layouts/installer";
import { useAuth } from "../../contexts/useAuth";
import { updateProfile, uploadLogo } from "../../services/installerApi";

/* ─── Shared input style ─────────────────────────────────────── */
const inp =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition";

/* ─── Section card ───────────────────────────────────────────── */
const Section = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-6 py-5 border-b border-gray-50">
      <h2 className="font-display font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    <div className="px-6 py-6">{children}</div>
  </div>
);

/* ─── Field ──────────────────────────────────────────────────── */
const Field = ({ label, hint, icon: Icon, children }) => (
  <div>
    <label className="flex text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 items-center gap-1.5">
      {Icon && <Icon size={11} className="text-gray-400" />}
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

/* ─── SettingsPage ───────────────────────────────────────────── */
export default function SettingsPage() {
  const { profile, user, refreshProfile } = useAuth();

  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    phone: "",
    address: "",
    defaultGridTariff: "",
    defaultFuelPrice: "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoError, setLogoError] = useState(null);
  const fileInputRef = useRef(null);

  // Tracks which profile.id we've already pre-filled the form from, so a
  // same-profile refetch (e.g. after Save) doesn't re-trigger setForm and
  // clobber edits the person has made since the last fetch resolved.
  const prefilledProfileIdRef = useRef(null);

  /* Pre-fill from profile — once per actual profile identity, not on every
     object reference change. */
  useEffect(() => {
    if (!profile) return;
    if (prefilledProfileIdRef.current === profile.id) return;
    prefilledProfileIdRef.current = profile.id;

    setForm({
      companyName: profile.company_name ?? "",
      contactName: profile.contact_name ?? "",
      phone: profile.phone ?? "",
      address: profile.address ?? "",
      defaultGridTariff: profile.default_grid_tariff ?? "",
      defaultFuelPrice: profile.default_fuel_price ?? "",
    });
    setLogoUrl(profile.logo_url ?? null);
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ── Save profile ── */
  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await updateProfile({
        companyName: form.companyName || null,
        contactName: form.contactName || null,
        phone: form.phone || null,
        address: form.address || null,
        defaultGridTariff: form.defaultGridTariff
          ? parseFloat(form.defaultGridTariff)
          : null,
        defaultFuelPrice: form.defaultFuelPrice
          ? parseFloat(form.defaultFuelPrice)
          : null,
      });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err.response?.data?.error || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Logo upload ── */
  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      setLogoError("Please upload a JPG, PNG, WebP, or SVG file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Logo must be under 2MB.");
      return;
    }

    setLogoUploading(true);
    setLogoError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target.result.split(",")[1];
        const { data } = await uploadLogo({ base64, mimeType: file.type });
        setLogoUrl(data.logoUrl);
        setLogoUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setLogoError(err.response?.data?.error || "Logo upload failed.");
      setLogoUploading(false);
    }
  };

  return (
    <InstallerLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ── Page header ── */}
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">
            Settings
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Manage your company profile, branding, and default inputs.
          </p>
        </div>

        {/* ── Logo ── */}
        <Section
          title="Company Logo"
          subtitle="Used on professional quotations and proposals"
        >
          <div className="flex items-center gap-6">
            {/* Logo preview */}
            <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 shrink-0 overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Company logo"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <Building size={28} className="text-gray-200" />
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={logoUploading}
                className="inline-flex items-center gap-2 border border-gray-200 hover:border-teal-300 text-gray-600 hover:text-teal-700 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
              >
                {logoUploading ? (
                  <>
                    <Loader size={14} className="animate-spin" /> Uploading…
                  </>
                ) : (
                  <>
                    <Camera size={14} />{" "}
                    {logoUrl ? "Change Logo" : "Upload Logo"}
                  </>
                )}
              </button>
              <p className="text-xs text-gray-400">
                JPG, PNG, WebP or SVG · Max 2MB
              </p>
              {logoError && <p className="text-xs text-red-500">{logoError}</p>}
              {logoUrl && !logoUploading && (
                <p className="text-xs text-teal-600 flex items-center gap-1">
                  <CheckCircle size={11} /> Logo uploaded
                </p>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleLogoChange}
              className="hidden"
            />
          </div>
        </Section>

        {/* ── Company Profile ── */}
        <Section
          title="Company Profile"
          subtitle="This appears on your quotations and proposals"
        >
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Company Name" icon={Building}>
                <input
                  type="text"
                  name="companyName"
                  placeholder="e.g. SunPower Nigeria Ltd"
                  value={form.companyName}
                  onChange={handleChange}
                  className={inp}
                />
              </Field>
              <Field label="Your Name" icon={User}>
                <input
                  type="text"
                  name="contactName"
                  placeholder="e.g. Emeka Okonkwo"
                  value={form.contactName}
                  onChange={handleChange}
                  className={inp}
                />
              </Field>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Phone" icon={Phone}>
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g. 08012345678"
                  value={form.phone}
                  onChange={handleChange}
                  className={inp}
                />
              </Field>
              <Field label="Email" icon={Mail}>
                <input
                  type="email"
                  value={user?.email ?? ""}
                  disabled
                  className={`${inp} bg-gray-50 text-gray-400 cursor-not-allowed`}
                />
              </Field>
            </div>
            <Field label="Business Address" icon={MapPin}>
              <input
                type="text"
                name="address"
                placeholder="e.g. 12 Adeola Odeku Street, Victoria Island, Lagos"
                value={form.address}
                onChange={handleChange}
                className={inp}
              />
            </Field>
          </div>
        </Section>

        {/* ── Default Inputs ── */}
        <Section
          title="Default Energy Inputs"
          subtitle="Pre-fills the calculator when running assessments — save time on common inputs"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="Default Grid Tariff (₦/kWh)"
              icon={Zap}
              hint="Your area's typical NERC tariff. Pre-fills the Grid section."
            >
              <input
                type="number"
                name="defaultGridTariff"
                placeholder="e.g. 68"
                value={form.defaultGridTariff}
                onChange={handleChange}
                className={inp}
              />
            </Field>
            <Field
              label="Default Fuel Price (₦/litre)"
              icon={Fuel}
              hint="Current fuel price in your area. Pre-fills the Generator section."
            >
              <input
                type="number"
                name="defaultFuelPrice"
                placeholder="e.g. 1200"
                value={form.defaultFuelPrice}
                onChange={handleChange}
                className={inp}
              />
            </Field>
          </div>
        </Section>

        {/* ── Save error ── */}
        {saveError && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 flex items-center gap-3">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}

        {/* ── Save button ── */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold font-display py-4 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-teal-200 flex items-center justify-center gap-2 text-base"
        >
          {saving ? (
            <>
              <Loader size={17} className="animate-spin" /> Saving…
            </>
          ) : saved ? (
            <>
              <CheckCircle size={17} /> Saved
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </InstallerLayout>
  );
}

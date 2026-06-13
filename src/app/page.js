"use client";

import { useState, useEffect } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_URL?.replace(/\/$/, "");

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState("form");
  const [isOpen, setIsOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    number: "",
    dob: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    setMounted(true);
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/users/employee`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setEmployees(data);
        } else if (data.data && Array.isArray(data.data)) {
          setEmployees(data.data);
        } else {
          setEmployees([]);
        }
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openNewForm = () => {
    setFormData({ id: null, name: "", email: "", number: "", dob: "" });
    setStatus({ type: "", message: "" });
    setIsOpen(true);
  };

  const handleEditClick = (emp) => {
    const formattedDate = emp.dob ? emp.dob.split("T")[0] : "";
    setFormData({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      number: emp.number,
      dob: formattedDate,
    });
    setStatus({ type: "", message: "" });
    setIsOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      const response = await fetch(`${BASE_URL}/api/users/delete/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message || "Employee deleted successfully!");
        fetchEmployees();
      } else {
        alert(data.message || "Failed to delete item");
      }
    } catch (error) {
      alert("Connection error to backend server");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    const isEditing = formData.id !== null;
    const url = isEditing
      ? `${BASE_URL}/api/users/edit/${formData.id}`
      : `${BASE_URL}/api/users/register`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          number: formData.number,
          dob: formData.dob,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setStatus({ type: "success", message: data.message });
        setTimeout(() => {
          setIsOpen(false);
          setStatus({ type: "", message: "" });
          fetchEmployees();
          setViewMode("details");
        }, 1500);
      } else {
        setStatus({ type: "error", message: data.message || "Something went wrong" });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Failed to connect to backend server" });
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avatarPalette = [
    { bg: "#EEF2FF", text: "#4F46E5" },
    { bg: "#FDF4FF", text: "#9333EA" },
    { bg: "#FFF1F2", text: "#E11D48" },
    { bg: "#ECFDF5", text: "#059669" },
    { bg: "#FFFBEB", text: "#D97706" },
    { bg: "#EFF6FF", text: "#2563EB" },
    { bg: "#FFF7ED", text: "#EA580C" },
    { bg: "#F0FDFA", text: "#0D9488" },
  ];
  const getAvatar = (id) => avatarPalette[id % avatarPalette.length];

  const accentColors = [
    "#4F46E5", "#9333EA", "#E11D48", "#059669",
    "#D97706", "#2563EB", "#EA580C", "#0D9488",
  ];
  const getAccent = (id) => accentColors[id % accentColors.length];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F8F9FC",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: "#111827",
    }}>

      {/* TOP NAV */}
      <nav style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #E5E7EB",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 28px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", boxShadow: "0 2px 8px rgba(79,70,229,0.35)",
            }}>👥</div>
            <span style={{ fontWeight: "700", fontSize: "18px", color: "#111827", letterSpacing: "-0.3px" }}>
              EmpDesk
            </span>
          </div>

          {/* Nav tabs */}
          <div style={{ display: "flex", gap: "4px", background: "#F3F4F6", borderRadius: "12px", padding: "4px" }}>
            {[
              { id: "form", label: "Dashboard" },
              { id: "details", label: "Employees" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                style={{
                  padding: "8px 20px",
                  border: "none",
                  borderRadius: "9px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  transition: "all 0.18s",
                  background: viewMode === tab.id ? "#FFFFFF" : "transparent",
                  color: viewMode === tab.id ? "#111827" : "#6B7280",
                  boxShadow: viewMode === tab.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Add button in nav */}
          <button
            onClick={openNewForm}
            style={{
              padding: "9px 20px",
              background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
              transition: "all 0.18s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(79,70,229,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(79,70,229,0.3)"; }}
          >
            <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span> Add Employee
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "36px 28px" }}>

        {/* ═══════════════════════════ DASHBOARD VIEW ═══════════════════════════ */}
        {viewMode === "form" && (
          <div>
            {/* Welcome banner */}
            <div style={{
              background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
              borderRadius: "24px",
              padding: "40px 48px",
              marginBottom: "28px",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(79,70,229,0.3)",
            }}>
              {/* decorative circles */}
              <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
              <div style={{ position: "absolute", bottom: "-60px", right: "120px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px", fontWeight: "500", margin: "0 0 10px 0" }}>
                  Welcome back 👋
                </p>
                <h1 style={{ color: "#FFFFFF", fontSize: "32px", fontWeight: "800", margin: "0 0 12px 0", letterSpacing: "-0.5px" }}>
                  Employee Management
                </h1>
                <p style={{ color: "rgba(255,255,255,0.7)", margin: "0 0 28px 0", fontSize: "15px", maxWidth: "440px" }}>
                  Register, track and manage your entire workforce from one place.
                </p>
                <button
                  onClick={openNewForm}
                  style={{
                    padding: "12px 28px",
                    background: "#FFFFFF",
                    color: "#4F46E5",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: "700",
                    fontSize: "15px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"; }}
                >
                  + Register New Employee
                </button>
              </div>
            </div>

            {/* KPI row */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "28px",
            }}>
              {[
                { label: "Total Employees", value: employees.length, icon: "👥", color: "#4F46E5", light: "#EEF2FF" },
                { label: "Active Today",    value: 12,               icon: "🟢", color: "#059669", light: "#ECFDF5" },
                { label: "New This Month",  value: 5,                icon: "📈", color: "#D97706", light: "#FFFBEB" },
                { label: "Departments",     value: 4,                icon: "🏢", color: "#7C3AED", light: "#FDF4FF" },
              ].map((card) => (
                <div
                  key={card.label}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "18px",
                    padding: "22px",
                    transition: "all 0.2s",
                    cursor: "default",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.09)"; e.currentTarget.style.borderColor = card.color + "55"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
                >
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "12px",
                    background: card.light, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "22px", marginBottom: "16px",
                  }}>
                    {card.icon}
                  </div>
                  <div style={{ fontSize: "30px", fontWeight: "800", color: "#111827", lineHeight: 1 }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "5px", fontWeight: "500" }}>
                    {card.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick tips */}
            <div style={{
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "18px",
              padding: "28px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "0 0 18px 0" }}>
                Quick Actions
              </h3>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {[
                  { icon: "➕", label: "Add Employee",     action: openNewForm },
                  { icon: "📋", label: "View Directory",   action: () => setViewMode("details") },
                  { icon: "🔄", label: "Refresh Data",     action: fetchEmployees },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "11px 20px",
                      background: "#F8F9FC",
                      border: "1px solid #E5E7EB",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "#374151",
                      transition: "all 0.18s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#EEF2FF"; e.currentTarget.style.borderColor = "#C7D2FE"; e.currentTarget.style.color = "#4F46E5"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#F8F9FC"; e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; }}
                  >
                    <span>{item.icon}</span> {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════ EMPLOYEES VIEW ═══════════════════════════ */}
        {viewMode === "details" && (
          <div>
            {/* Page title + toolbar */}
            <div style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              marginBottom: "24px",
            }}>
              <div>
                <h2 style={{ fontSize: "26px", fontWeight: "800", color: "#111827", margin: "0 0 4px 0", letterSpacing: "-0.4px" }}>
                  Employee Directory
                </h2>
                <p style={{ color: "#9CA3AF", margin: 0, fontSize: "14px" }}>
                  {employees.length} total employees
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                {/* Search */}
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: "13px", top: "50%",
                    transform: "translateY(-50%)", fontSize: "15px", pointerEvents: "none",
                  }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search employees…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      paddingLeft: "38px", paddingRight: "14px",
                      paddingTop: "9px", paddingBottom: "9px",
                      background: "#FFFFFF",
                      border: "1px solid #E5E7EB",
                      borderRadius: "10px",
                      color: "#111827", fontSize: "14px",
                      outline: "none", width: "220px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                      transition: "border-color 0.18s",
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "#4F46E5"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#E5E7EB"}
                  />
                </div>
                <button
                  onClick={fetchEmployees}
                  style={{
                    padding: "9px 16px",
                    background: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "10px",
                    color: "#6B7280",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.18s",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#D1D5DB"; e.currentTarget.style.color = "#374151"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#6B7280"; }}
                >
                  ↺ Refresh
                </button>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{
                  width: "40px", height: "40px",
                  border: "3px solid #E5E7EB",
                  borderTop: "3px solid #4F46E5",
                  borderRadius: "50%",
                  margin: "0 auto 16px",
                  animation: "spin 0.8s linear infinite",
                }} />
                <p style={{ color: "#9CA3AF", fontSize: "14px" }}>Loading employees…</p>
              </div>
            )}

            {/* Empty */}
            {!loading && filteredEmployees.length === 0 && (
              <div style={{
                background: "#FFFFFF",
                border: "1px dashed #D1D5DB",
                borderRadius: "20px",
                padding: "72px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>🗂️</div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>
                  {searchQuery ? "No results found" : "No employees yet"}
                </h3>
                <p style={{ color: "#9CA3AF", marginBottom: "24px", fontSize: "14px" }}>
                  {searchQuery ? "Try a different search term." : "Click below to add your first employee."}
                </p>
                {!searchQuery && (
                  <button
                    onClick={openNewForm}
                    style={{
                      padding: "11px 28px",
                      background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                      color: "white", border: "none", borderRadius: "10px",
                      cursor: "pointer", fontWeight: "600", fontSize: "14px",
                    }}
                  >+ Add Employee</button>
                )}
              </div>
            )}

            {/* Cards grid */}
            {!loading && filteredEmployees.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "16px",
              }}>
                {filteredEmployees.map((emp, index) => {
                  const av = getAvatar(emp.id);
                  const accent = getAccent(emp.id);
                  return (
                    <div
                      key={emp.id}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "20px",
                        overflow: "hidden",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                        transition: "all 0.22s",
                        animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)";
                        e.currentTarget.style.borderColor = accent + "55";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
                        e.currentTarget.style.borderColor = "#E5E7EB";
                      }}
                    >
                      {/* top accent strip */}
                      <div style={{ height: "4px", background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />

                      <div style={{ padding: "22px" }}>
                        {/* Header */}
                        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "18px" }}>
                          <div style={{
                            width: "50px", height: "50px", borderRadius: "14px",
                            background: av.bg, color: av.text,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "20px", fontWeight: "800", flexShrink: 0,
                          }}>
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontWeight: "700", fontSize: "16px", color: "#111827",
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}>
                              {emp.name}
                            </div>
                            <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>
                              Employee ID #{emp.id}
                            </div>
                          </div>
                          <span style={{
                            fontSize: "11px", fontWeight: "600", color: "#059669",
                            background: "#ECFDF5", border: "1px solid #A7F3D0",
                            padding: "3px 9px", borderRadius: "20px", whiteSpace: "nowrap",
                          }}>Active</span>
                        </div>

                        {/* Info list */}
                        <div style={{
                          background: "#F9FAFB", borderRadius: "12px",
                          padding: "14px 16px", marginBottom: "16px",
                          display: "flex", flexDirection: "column", gap: "10px",
                        }}>
                          {[
                            { icon: "✉️", label: "Email",    value: emp.email },
                            { icon: "📞", label: "Phone",    value: emp.number },
                            { icon: "🎂", label: "Birthday", value: emp.dob ? emp.dob.split("T")[0] : "—" },
                          ].map((row) => (
                            <div key={row.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span style={{ fontSize: "14px", width: "18px", textAlign: "center" }}>{row.icon}</span>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: "10px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                  {row.label}
                                </div>
                                <div style={{
                                  fontSize: "13px", color: "#374151", marginTop: "1px",
                                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                  maxWidth: "220px",
                                }}>
                                  {row.value}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleEditClick(emp)}
                            style={{
                              flex: 1, padding: "9px",
                              background: "#EEF2FF",
                              border: "1px solid #C7D2FE",
                              color: "#4F46E5",
                              borderRadius: "10px",
                              cursor: "pointer", fontWeight: "600", fontSize: "13px",
                              transition: "all 0.18s",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#E0E7FF"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "#EEF2FF"; }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(emp.id)}
                            style={{
                              flex: 1, padding: "9px",
                              background: "#FFF1F2",
                              border: "1px solid #FECDD3",
                              color: "#E11D48",
                              borderRadius: "10px",
                              cursor: "pointer", fontWeight: "600", fontSize: "13px",
                              transition: "all 0.18s",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#FFE4E6"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "#FFF1F2"; }}
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════ MODAL ═══════════════════════════ */}
      {isOpen && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(17,24,39,0.45)",
            backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: "16px",
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <div style={{
            background: "#FFFFFF",
            borderRadius: "24px",
            width: "100%", maxWidth: "460px",
            maxHeight: "92vh", overflow: "auto",
            boxShadow: "0 24px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
            animation: "slideUp 0.25s ease-out",
          }}>
            {/* Modal header */}
            <div style={{
              padding: "28px 28px 24px",
              borderBottom: "1px solid #F3F4F6",
              display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            }}>
              <div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  background: "#EEF2FF", borderRadius: "8px", padding: "4px 10px",
                  marginBottom: "10px",
                }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4F46E5", display: "inline-block" }} />
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    {formData.id ? "Edit Record" : "New Employee"}
                  </span>
                </div>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#111827", margin: 0, letterSpacing: "-0.3px" }}>
                  {formData.id ? "Update Employee Details" : "Register New Employee"}
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: "34px", height: "34px",
                  background: "#F3F4F6", border: "none",
                  borderRadius: "8px", fontSize: "18px",
                  cursor: "pointer", color: "#9CA3AF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.18s", flexShrink: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#E5E7EB"; e.currentTarget.style.color = "#374151"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#9CA3AF"; }}
              >×</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "24px 28px 28px" }}>
              {status.message && (
                <div style={{
                  padding: "12px 14px",
                  marginBottom: "20px",
                  borderRadius: "10px",
                  fontSize: "13px", fontWeight: "500",
                  background: status.type === "success" ? "#ECFDF5" : "#FFF1F2",
                  color: status.type === "success" ? "#065F46" : "#BE123C",
                  border: `1px solid ${status.type === "success" ? "#A7F3D0" : "#FECDD3"}`,
                  display: "flex", alignItems: "center", gap: "8px",
                }}>
                  <span>{status.type === "success" ? "✅" : "⚠️"}</span>
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {[
                  { label: "Full Name",       name: "name",   type: "text",  placeholder: "e.g. Jane Smith",        icon: "👤" },
                  { label: "Email Address",   name: "email",  type: "email", placeholder: "e.g. jane@company.com",  icon: "✉️" },
                  { label: "Phone Number",    name: "number", type: "tel",   placeholder: "e.g. 9876543210",        icon: "📞" },
                  { label: "Date of Birth",   name: "dob",    type: "date",  placeholder: "",                       icon: "🎂" },
                ].map((field) => (
                  <div key={field.name} style={{ marginBottom: "18px" }}>
                    <label style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      fontSize: "13px", fontWeight: "600", color: "#374151",
                      marginBottom: "7px",
                    }}>
                      <span>{field.icon}</span> {field.label}
                      <span style={{ color: "#E11D48", marginLeft: "2px" }}>*</span>
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      required
                      placeholder={field.placeholder}
                      style={{
                        width: "100%", padding: "11px 14px",
                        background: "#F9FAFB",
                        border: "1.5px solid #E5E7EB",
                        borderRadius: "10px",
                        fontSize: "14px", color: "#111827",
                        outline: "none", transition: "all 0.18s",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#4F46E5";
                        e.currentTarget.style.background = "#FFFFFF";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#E5E7EB";
                        e.currentTarget.style.background = "#F9FAFB";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>
                ))}

                <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    style={{
                      flex: 1, padding: "12px",
                      background: "#F3F4F6", border: "1px solid #E5E7EB",
                      color: "#374151", borderRadius: "11px",
                      cursor: "pointer", fontWeight: "600", fontSize: "14px",
                      transition: "all 0.18s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#E5E7EB"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#F3F4F6"}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 2, padding: "12px",
                      background: loading
                        ? "#C7D2FE"
                        : "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                      color: "white", border: "none", borderRadius: "11px",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontWeight: "700", fontSize: "14px",
                      boxShadow: loading ? "none" : "0 2px 12px rgba(79,70,229,0.35)",
                      transition: "all 0.18s",
                    }}
                  >
                    {loading ? "Saving…" : formData.id ? "Save Changes" : "Register Employee"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        input::placeholder { color: #D1D5DB; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #F3F4F6; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 99px; }
      `}</style>
    </div>
  );
}
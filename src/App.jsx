import React, { useState, useEffect } from "react";
import "./App.css";
import jsPDF from "jspdf";

// ----------------------------------------------------
// Dummy Salary Users
// ----------------------------------------------------
const SALARY_USERS = [
  {
    id: "u1",
    displayName: "Alice Johnson",
    data: {
      user: {
        name: "Alice Johnson",
        role: "Data Analyst",
        department: "Analytics",
        payDetail: {
          total_salary_amount: 75000,
          basic: 40000,
          hra: 20000,
          allowances: 15000,
        },
      },
      month: "October 2025",
    },
  },
  {
    id: "u2",
    displayName: "Bob Singh",
    data: {
      user: {
        name: "Bob Singh",
        role: "Senior Developer",
        department: "Engineering",
        payDetail: {
          total_salary_amount: 90000,
          basic: 50000,
          hra: 25000,
          allowances: 15000,
        },
      },
      month: "October 2025",
    },
  },
];

// ----------------------------------------------------
// Dummy Bill Data
// ----------------------------------------------------
const BILL_DATA = {
  bill: {
    billNumber: "INV-2025-001",
    billDate: "2025-10-15",
    customer: {
      name: "Acme Pvt Ltd",
      address: "123, MG Road, Bengaluru",
    },
    items: [
      { description: "Consulting Services", amount: 50000 },
      { description: "Support Services", amount: 15000 },
    ],
    totalAmount: 65000,
    currency: "INR",
  },
};

// ----------------------------------------------------
// Helper: Resolve JSON path like "user.payDetail.total_salary_amount"
// ----------------------------------------------------
function resolvePath(obj, path, defaultValue = "") {
  if (!path) return defaultValue;
  const parts = path.split(".").map((p) => p.trim()).filter(Boolean);
  let current = obj;

  for (const p of parts) {
    if (current && Object.prototype.hasOwnProperty.call(current, p)) {
      current = current[p];
    } else {
      return defaultValue;
    }
  }
  return current ?? defaultValue;
}

const STORAGE_KEY = "pdf_templates_v1";

function loadTemplates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTemplates(templates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

const alignOptions = ["left", "center", "right"];

// ----------------------------------------------------
// Field Row Component
// ----------------------------------------------------
function FieldRow({ field, onChange, onRemove }) {
  const handleChange = (key, value) => {
    onChange({ ...field, [key]: value });
  };

  return (
    <div className="field-row">
      <input
        className="text-input"
        placeholder="Key (label in PDF)"
        value={field.keyLabel}
        onChange={(e) => handleChange("keyLabel", e.target.value)}
      />
      <input
        className="text-input"
        placeholder="Mapping (e.g. user.payDetail.total_salary_amount)"
        value={field.mapping}
        onChange={(e) => handleChange("mapping", e.target.value)}
      />
      <input
        className="text-input"
        placeholder="Default value"
        value={field.defaultValue}
        onChange={(e) => handleChange("defaultValue", e.target.value)}
      />
      <select
        className="select-input"
        value={field.align}
        onChange={(e) => handleChange("align", e.target.value)}
      >
        {alignOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt.toUpperCase()}
          </option>
        ))}
      </select>

      <button className="btn btn-danger" type="button" onClick={onRemove}>
        ✕
      </button>
    </div>
  );
}

// ----------------------------------------------------
// Section Editor (Header / Body / Footer)
// ----------------------------------------------------
function SectionEditor({ title, fields, setFields }) {
  const addField = () => {
    setFields([
      ...fields,
      {
        id: crypto.randomUUID(),
        keyLabel: "",
        mapping: "",
        defaultValue: "",
        align: "left",
      },
    ]);
  };

  const updateField = (idx, updated) => {
    const copy = [...fields];
    copy[idx] = updated;
    setFields(copy);
  };

  const removeField = (idx) => {
    const copy = [...fields];
    copy.splice(idx, 1);
    setFields(copy);
  };

  return (
    <div className="section-editor">
      <div className="section-header">
        <h3>{title}</h3>
        <button className="btn btn-secondary" onClick={addField}>
          + Add Field
        </button>
      </div>

      {fields.length === 0 && <p className="hint">No fields yet.</p>}

      {fields.map((field, idx) => (
        <FieldRow
          key={field.id}
          field={field}
          onChange={(updated) => updateField(idx, updated)}
          onRemove={() => removeField(idx)}
        />
      ))}
    </div>
  );
}

// ----------------------------------------------------
// Template Creation Screen
// ----------------------------------------------------
function TemplateCreation({ onTemplatesChange }) {
  const [templates, setTemplates] = useState(loadTemplates);
  const [templateName, setTemplateName] = useState("Salary Template");
  const [templateType, setTemplateType] = useState("salary");

  const [headerFields, setHeaderFields] = useState([]);
  const [bodyFields, setBodyFields] = useState([]);
  const [footerFields, setFooterFields] = useState([]);

  useEffect(() => {
    saveTemplates(templates);
    onTemplatesChange(templates);
  }, [templates]);

  const handleSave = () => {
    if (!templateName.trim()) return alert("Template name required!");

    const newTemplate = {
      id: crypto.randomUUID(),
      name: templateName.trim(),
      type: templateType,
      headerFields,
      bodyFields,
      footerFields,
    };

    setTemplates([...templates, newTemplate]);

    setTemplateName("");
    setHeaderFields([]);
    setBodyFields([]);
    setFooterFields([]);

    alert("Template saved!");
  };

  return (
    <div className="card">
      <h2>1. Template Creation</h2>

      <div className="form-row">
        <label>Template Name</label>
        <input
          className="text-input"
          value={templateName}
          placeholder="e.g., Salary Template"
          onChange={(e) => setTemplateName(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label>Template Type</label>
        <select
          className="select-input"
          value={templateType}
          onChange={(e) => setTemplateType(e.target.value)}
        >
          <option value="salary">Salary</option>
          <option value="bill">Bill</option>
          <option value="generic">Generic</option>
        </select>
      </div>

      <SectionEditor title="Header" fields={headerFields} setFields={setHeaderFields} />
      <SectionEditor title="Body" fields={bodyFields} setFields={setBodyFields} />
      <SectionEditor title="Footer" fields={footerFields} setFields={setFooterFields} />

      <button className="btn btn-primary" onClick={handleSave}>
        Save Template
      </button>

      <h3 style={{ marginTop: "2rem" }}>Existing Templates</h3>
      {templates.length === 0 && <p className="hint">No templates yet.</p>}

      <ul className="template-list">
        {templates.map((t) => (
          <li key={t.id}>
            <strong>{t.name}</strong> – <em>{t.type.toUpperCase()}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ----------------------------------------------------
// BEAUTIFUL PDF GENERATION (NO "HEADER/BODY/FOOTER" TITLES IN PDF)
// ----------------------------------------------------
function generatePdfFromTemplate(template, data) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginX = 18;
  const marginY = 20;
  const bottomMargin = 20;
  let y = marginY;

  const ensureSpace = (extra = 10) => {
    if (y + extra > pageHeight - bottomMargin) {
      doc.addPage();
      y = marginY;
    }
  };

  // ===== HEADER BAND =====
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(marginX, y, pageWidth - marginX * 2, 16, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);

  doc.text(template.name || "Document", pageWidth / 2, y + 10, {
    align: "center",
  });

  y += 24;

  // Subtitle
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);

  let typeLabel = template.type || "generic";
  typeLabel = typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1);

  doc.text(`${typeLabel} template generated from JSON mapping`, marginX, y);
  y += 8;

  // Divider
  doc.setDrawColor(180, 180, 180);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 10;

  // Back to normal content color
  doc.setTextColor(0, 0, 0);

  // ===== Field Line (Label always left, value aligned) =====
  const writeFieldLine = (label, value, align = "left") => {
    ensureSpace(8);

    const safeLabel = label ? String(label) : "";
    const safeValue = value ?? "";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${safeLabel}:`, marginX, y);

    doc.setFont("helvetica", "normal");

    if (align === "right") {
      doc.text(String(safeValue), pageWidth - marginX, y, { align: "right" });
    } else if (align === "center") {
      doc.text(String(safeValue), pageWidth / 2, y, { align: "center" });
    } else {
      doc.text(String(safeValue), marginX + 40, y);
    }

    y += 7;
  };

  // Render fields in order: Header -> Body -> Footer (structure preserved)
  const sections = [
    ...(template.headerFields || []),
    ...(template.bodyFields || []),
    ...(template.footerFields || []),
  ];

  sections.forEach((f) => {
    const value = resolvePath(data, f.mapping, f.defaultValue);
    writeFieldLine(f.keyLabel || "", value, f.align || "left");
  });

  doc.save(`${template.name || "document"}.pdf`);
}

// ----------------------------------------------------
// Preview + PDF Screen
// ----------------------------------------------------
function PreviewAndPdf({ templates }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const isSalary = selectedTemplate?.type === "salary";
  const isBill = selectedTemplate?.type === "bill";

  const handleGenerate = () => {
    if (!selectedTemplate) return alert("Choose a template!");

    let data;

    if (selectedTemplate.type === "salary") {
      if (!selectedUserId) return alert("Choose a user!");
      const userObj = SALARY_USERS.find((u) => u.id === selectedUserId);
      if (!userObj) return alert("Invalid user selected.");
      data = userObj.data;
    } else if (selectedTemplate.type === "bill") {
      data = BILL_DATA;
    } else {
      data = BILL_DATA;
    }

    generatePdfFromTemplate(selectedTemplate, data);
  };

  return (
    <div className="card">
      <h2>2. PDF Preview & Generation</h2>

      <div className="form-row">
        <label>Select Template</label>
        <select
          className="select-input"
          value={selectedTemplateId}
          onChange={(e) => {
            setSelectedTemplateId(e.target.value);
            setSelectedUserId("");
          }}
        >
          <option value="">-- Select --</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.type})
            </option>
          ))}
        </select>
      </div>

      {isSalary && (
        <div className="form-row">
          <label>Select User</label>
          <select
            className="select-input"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">-- Select User --</option>
            {SALARY_USERS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.displayName}
              </option>
            ))}
          </select>
        </div>
      )}

      {isBill && (
        <p className="hint">
          Bill Template selected — no user input needed. Click Generate PDF.
        </p>
      )}

      <button className="btn btn-primary" onClick={handleGenerate} disabled={!selectedTemplate}>
        Generate PDF
      </button>
    </div>
  );
}

// ----------------------------------------------------
// App Root
// ----------------------------------------------------
export default function App() {
  const [templates, setTemplates] = useState(loadTemplates);
  const [activeTab, setActiveTab] = useState("create");

  return (
    <div className="app-container">
      <h1>Dynamic PDF Template Generator</h1>

      <p className="subtitle">
        Template Creation | JSON Mapping | Alignment | PDF Output
      </p>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "create" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          Template Creation
        </button>

        <button
          className={`tab ${activeTab === "preview" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("preview")}
        >
          PDF Preview
        </button>
      </div>

      {activeTab === "create" ? (
        <TemplateCreation onTemplatesChange={setTemplates} />
      ) : (
        <PreviewAndPdf templates={templates} />
      )}

      <footer className="footer">
        <small>Assignment – Dynamic PDF Template Generation</small>
      </footer>
    </div>
  );
}

export type ProjectStatus = "draft" | "in_review" | "in_progress" | "approved" | "completed" | "rejected";

export interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  location: string;
  status: ProjectStatus;
  progress: number;
  conformity: number;
  filesCount: number;
  issuesOpen: number;
  team: { name: string; role: string; avatar?: string }[];
  startDate: string;
  dueDate: string;
  manager: string;
  description: string;
  cover?: string;
}

export const projects: Project[] = [
  {
    id: "p-1024",
    code: "ALZ-2026-012",
    name: "برج العزب التجاري",
    client: "مجموعة العزب القابضة",
    location: "الرياض - حي الملقا",
    status: "in_progress",
    progress: 68,
    conformity: 92,
    filesCount: 248,
    issuesOpen: 7,
    manager: "م. خالد الفهد",
    startDate: "2026-01-12",
    dueDate: "2027-04-30",
    description: "برج مكاتب من 24 طابقًا مع بدروم خدمي وواجهة زجاجية ثنائية الطبقات.",
    team: [
      { name: "م. خالد الفهد", role: "مدير المشروع" },
      { name: "م. سارة الحربي", role: "مهندس تصميم" },
      { name: "م. ياسر القحطاني", role: "جهة الإشراف" },
      { name: "أ. عبدالله العزب", role: "المالك" },
    ],
  },
  {
    id: "p-1025",
    code: "ALZ-2026-018",
    name: "مجمع الواحة السكني",
    client: "شركة الواحة العقارية",
    location: "جدة - حي الشاطئ",
    status: "in_review",
    progress: 34,
    conformity: 88,
    filesCount: 142,
    issuesOpen: 12,
    manager: "م. منى الزهراني",
    startDate: "2026-03-01",
    dueDate: "2027-09-15",
    description: "مجمع سكني يضم 6 أبراج بإجمالي 320 وحدة سكنية ومرافق ترفيهية.",
    team: [
      { name: "م. منى الزهراني", role: "مدير المشروع" },
      { name: "م. فهد العتيبي", role: "مهندس تصميم" },
    ],
  },
  {
    id: "p-1026",
    code: "ALZ-2025-091",
    name: "مستشفى الأمل التخصصي",
    client: "وزارة الصحة",
    location: "الدمام",
    status: "approved",
    progress: 100,
    conformity: 97,
    filesCount: 512,
    issuesOpen: 0,
    manager: "م. ريم السبيعي",
    startDate: "2024-06-10",
    dueDate: "2026-05-20",
    description: "مستشفى بسعة 280 سرير مع وحدات تخصصية ومركز طوارئ.",
    team: [
      { name: "م. ريم السبيعي", role: "مدير المشروع" },
      { name: "م. تركي الدوسري", role: "جهة الإشراف" },
    ],
  },
  {
    id: "p-1027",
    code: "ALZ-2026-024",
    name: "مدرسة المستقبل الدولية",
    client: "مؤسسة المستقبل التعليمية",
    location: "الرياض - حي العارض",
    status: "draft",
    progress: 8,
    conformity: 0,
    filesCount: 14,
    issuesOpen: 0,
    manager: "م. أحمد الشمري",
    startDate: "2026-05-01",
    dueDate: "2027-08-31",
    description: "مدرسة دولية تستوعب 1200 طالب مع ملاعب رياضية ومسرح.",
    team: [{ name: "م. أحمد الشمري", role: "مدير المشروع" }],
  },
];

export const statusMeta: Record<ProjectStatus, { label: string; tone: string }> = {
  draft: { label: "مسودة", tone: "bg-muted text-muted-foreground" },
  in_review: { label: "قيد المراجعة", tone: "bg-warning/15 text-warning-foreground border border-warning/30" },
  in_progress: { label: "قيد التنفيذ", tone: "bg-info/15 text-info border border-info/30" },
  approved: { label: "معتمد", tone: "bg-success/15 text-success border border-success/30" },
  completed: { label: "مكتمل", tone: "bg-success/20 text-success border border-success/40" },
  rejected: { label: "مرفوض", tone: "bg-destructive/15 text-destructive border border-destructive/30" },
};

export type FileCategory = "site_photos" | "bim" | "drawings" | "reports" | "documents";
export const fileCategoryLabel: Record<FileCategory, string> = {
  site_photos: "صور الموقع",
  bim: "ملفات BIM",
  drawings: "مخططات PDF",
  reports: "تقارير",
  documents: "مستندات",
};

export interface ProjectFile {
  id: string;
  name: string;
  category: FileCategory;
  size: string;
  version: string;
  uploadedBy: string;
  uploadedAt: string;
  status: "draft" | "in_review" | "approved" | "rejected";
}

export const files: ProjectFile[] = [
  { id: "f1", name: "Architecture_Model_v4.rvt", category: "bim", size: "248 MB", version: "v4.2", uploadedBy: "م. سارة الحربي", uploadedAt: "قبل ساعتين", status: "in_review" },
  { id: "f2", name: "Structural_Plan_L01-L12.pdf", category: "drawings", size: "32 MB", version: "v2.0", uploadedBy: "م. خالد الفهد", uploadedAt: "أمس", status: "approved" },
  { id: "f3", name: "MEP_Coordination.ifc", category: "bim", size: "186 MB", version: "v1.5", uploadedBy: "م. سارة الحربي", uploadedAt: "قبل 3 أيام", status: "approved" },
  { id: "f4", name: "Site_Survey_Report.pdf", category: "reports", size: "8 MB", version: "v1.0", uploadedBy: "م. ياسر القحطاني", uploadedAt: "الأسبوع الماضي", status: "approved" },
  { id: "f5", name: "Facade_Render_Final.jpg", category: "site_photos", size: "12 MB", version: "v3.1", uploadedBy: "م. منى الزهراني", uploadedAt: "اليوم", status: "draft" },
  { id: "f6", name: "Soil_Test_Lab.pdf", category: "documents", size: "4 MB", version: "v1.0", uploadedBy: "م. فهد العتيبي", uploadedAt: "قبل أسبوعين", status: "approved" },
];

export interface Approval {
  step: string;
  role: string;
  user: string;
  status: "approved" | "pending" | "rejected" | "waiting";
  date?: string;
  comment?: string;
}
export const approvals: Approval[] = [
  { step: "مراجعة التصميم", role: "مهندس التصميم", user: "م. سارة الحربي", status: "approved", date: "2026-06-10", comment: "تم اعتماد التصميم النهائي للواجهات." },
  { step: "مراجعة الإشراف", role: "جهة الإشراف", user: "م. ياسر القحطاني", status: "pending", comment: "بانتظار مراجعة الحسابات الإنشائية." },
  { step: "اعتماد المالك", role: "المالك", user: "أ. عبدالله العزب", status: "waiting" },
];

export interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  type: "upload" | "approve" | "comment" | "edit" | "create" | "reject";
}
export const activity: Activity[] = [
  { id: "a1", user: "م. سارة الحربي", action: "رفعت ملف", target: "Architecture_Model_v4.rvt", time: "قبل ساعتين", type: "upload" },
  { id: "a2", user: "م. ياسر القحطاني", action: "اعتمد", target: "Structural_Plan_L01-L12.pdf", time: "أمس", type: "approve" },
  { id: "a3", user: "م. خالد الفهد", action: "علق على", target: "MEP_Coordination.ifc", time: "أمس", type: "comment" },
  { id: "a4", user: "م. منى الزهراني", action: "أنشأت قضية", target: "تعارض في مسار التكييف بالطابق 8", time: "قبل يومين", type: "create" },
  { id: "a5", user: "أ. عبدالله العزب", action: "رفض الإصدار", target: "Facade_Render_v2.9", time: "قبل 3 أيام", type: "reject" },
];

export interface Issue {
  id: string;
  code: string;
  title: string;
  type: "issue" | "rfi" | "submittal";
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  assignee: string;
  createdAt: string;
  project: string;
}
export const issues: Issue[] = [
  { id: "i1", code: "ISS-241", title: "تعارض في مسار التكييف بالطابق 8", type: "issue", status: "open", priority: "high", assignee: "م. سارة الحربي", createdAt: "قبل يومين", project: "برج العزب التجاري" },
  { id: "i2", code: "RFI-118", title: "توضيح مواصفات الحديد للأعمدة الرئيسية", type: "rfi", status: "in_progress", priority: "medium", assignee: "م. ياسر القحطاني", createdAt: "أمس", project: "برج العزب التجاري" },
  { id: "i3", code: "SUB-077", title: "اعتماد عينة الرخام للواجهة", type: "submittal", status: "resolved", priority: "low", assignee: "أ. عبدالله العزب", createdAt: "الأسبوع الماضي", project: "مجمع الواحة السكني" },
  { id: "i4", code: "ISS-242", title: "اختلاف في منسوب الأرضية بالبدروم", type: "issue", status: "open", priority: "critical", assignee: "م. خالد الفهد", createdAt: "اليوم", project: "برج العزب التجاري" },
];

export interface FieldImage {
  id: string;
  title: string;
  location: string;
  uploadedAt: string;
  status: "analyzing" | "conform" | "deviation";
  conformity: number;
  deviations: number;
  notes?: string;
}
export const fieldImages: FieldImage[] = [
  { id: "img1", title: "واجهة شرقية - الطابق 12", location: "P12-E", uploadedAt: "اليوم 09:24", status: "deviation", conformity: 78, deviations: 4, notes: "انحراف في مقاسات النوافذ" },
  { id: "img2", title: "بدروم - منطقة المضخات", location: "B1-MR", uploadedAt: "أمس 16:10", status: "conform", conformity: 96, deviations: 0 },
  { id: "img3", title: "السطح - وحدات التكييف", location: "RF-AC", uploadedAt: "قبل يومين", status: "conform", conformity: 92, deviations: 1 },
  { id: "img4", title: "الواجهة الجنوبية - زجاج", location: "P10-S", uploadedAt: "قبل 3 أيام", status: "analyzing", conformity: 0, deviations: 0 },
];

export interface Member {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Owner" | "Editor" | "Viewer";
  projects: number;
  status: "active" | "invited" | "suspended";
  joinedAt: string;
}
export const members: Member[] = [
  { id: "m1", name: "م. خالد الفهد", email: "khaled@alazab.com", role: "Admin", projects: 8, status: "active", joinedAt: "2024-02-12" },
  { id: "m2", name: "م. سارة الحربي", email: "sara@alazab.com", role: "Editor", projects: 5, status: "active", joinedAt: "2024-05-03" },
  { id: "m3", name: "م. ياسر القحطاني", email: "yaser@supervision.sa", role: "Editor", projects: 3, status: "active", joinedAt: "2025-01-20" },
  { id: "m4", name: "أ. عبدالله العزب", email: "owner@alazab.com", role: "Owner", projects: 12, status: "active", joinedAt: "2023-11-01" },
  { id: "m5", name: "م. ريم السبيعي", email: "reem@alazab.com", role: "Viewer", projects: 2, status: "invited", joinedAt: "2026-06-15" },
];

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "info" | "success" | "warning" | "danger";
  read: boolean;
}
export const notifications: Notification[] = [
  { id: "n1", title: "تم رفع إصدار جديد", body: "Architecture_Model_v4.rvt بواسطة م. سارة", time: "قبل ساعتين", type: "info", read: false },
  { id: "n2", title: "اكتشاف انحراف بالموقع", body: "واجهة شرقية - الطابق 12 (4 انحرافات)", time: "اليوم 09:30", type: "warning", read: false },
  { id: "n3", title: "اعتماد ملف", body: "Structural_Plan_L01-L12.pdf معتمد من الإشراف", time: "أمس", type: "success", read: true },
  { id: "n4", title: "قضية حرجة جديدة", body: "اختلاف في منسوب الأرضية بالبدروم", time: "اليوم", type: "danger", read: false },
];

export const kpis = {
  totalProjects: 12,
  activeProjects: 7,
  filesUploaded: 1284,
  openIssues: 19,
  avgConformity: 91,
  pendingApprovals: 8,
};

export const progressTrend = [
  { month: "ينا", planned: 10, actual: 8 },
  { month: "فبر", planned: 22, actual: 19 },
  { month: "مار", planned: 34, actual: 30 },
  { month: "أبر", planned: 46, actual: 44 },
  { month: "ماي", planned: 58, actual: 55 },
  { month: "يون", planned: 70, actual: 68 },
];

export const conformityTrend = [
  { week: "أ1", value: 84 },
  { week: "أ2", value: 87 },
  { week: "أ3", value: 89 },
  { week: "أ4", value: 91 },
  { week: "أ5", value: 90 },
  { week: "أ6", value: 92 },
];

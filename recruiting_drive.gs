/**
 * recruiting_drive.gs — يستقبل السير الذاتية من الموقع ويحفظها في Google Drive بشكل منظم
 * الفولدرات:  [الفولدر الرئيسي] / [اسم الوظيفة] / [السنة-الشهر] / الاسم - التاريخ.pdf
 *
 * التركيب: افتح script.google.com ← مشروع جديد ← الصق الكود ده ← غيّر SECRET ← Deploy ← New deployment
 *   النوع: Web app — Execute as: Me — Who has access: Anyone ← Deploy ← وافق على الصلاحيات ← انسخ الرابط (/exec)
 */
const CONFIG = {
  SECRET: 'غيّر-الكلمة-دي-لأي-كلمة-سرية-طويلة',   // لازم تكتب نفس القيمة في الموقع (إعداد الربط)
  ROOT_NAME: 'السير الذاتية - التوظيف',             // اسم الفولدر الرئيسي (بيتعمل لوحده لو مش موجود)
  ROOT_FOLDER_ID: '',                               // اختياري: لو عاوز فولدر موجود عندك، حط الـ ID بتاعه هنا
  SHARE: 'none'                                     // 'none' = بس اللي معاهم صلاحية على الفولدر | 'domain' = كل حسابات شركتك (Workspace) | 'anyone' = أي حد معاه الرابط
};

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function clean_(s) { return String(s || 'غير محدد').replace(/[\\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) || 'غير محدد'; }
function root_() {
  if (CONFIG.ROOT_FOLDER_ID) return DriveApp.getFolderById(CONFIG.ROOT_FOLDER_ID);
  const it = DriveApp.getFoldersByName(CONFIG.ROOT_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CONFIG.ROOT_NAME);
}
function sub_(parent, name) {
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}
function doGet(e) { return out_({ ok: true, msg: 'السكربت شغال — الطلبات بتتبعت POST من الموقع.' }); }
function doPost(e) {
  try {
    const b = JSON.parse(e.postData.contents);
    if (b.key !== CONFIG.SECRET) return out_({ ok: false, error: 'المفتاح السري غلط' });
    if (b.action === 'ping') { const r = root_(); return out_({ ok: true, root: r.getName(), url: r.getUrl() }); }
    if (b.action === 'upload') {
      let f = root_();
      (b.path || []).forEach(n => { f = sub_(f, clean_(n)); });
      const blob = Utilities.newBlob(Utilities.base64Decode(b.data), b.mime || 'application/octet-stream', clean_(b.name));
      const file = f.createFile(blob);
      if (CONFIG.SHARE === 'anyone') file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      else if (CONFIG.SHARE === 'domain') file.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW);
      return out_({ ok: true, id: file.getId(), url: file.getUrl(), name: file.getName(), folder: f.getUrl() });
    }
    return out_({ ok: false, error: 'action غير معروف' });
  } catch (err) { return out_({ ok: false, error: String(err) }); }
}

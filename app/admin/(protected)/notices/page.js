import { listNoticesForAdminService } from "@/server-action/service/admin/notice.service";
import NoticeManager from "@/components/admin/NoticeManager";
import { requireAdminPage } from "@/lib/auth/actionAuth";

export const dynamic = "force-dynamic";

export default async function AdminNoticesPage() {
  await requireAdminPage();
  const notices = await listNoticesForAdminService();
  return <NoticeManager notices={notices} />;
}

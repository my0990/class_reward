import TeacherAccountHelper from "@/components/admin/TeacherAccountHelper";
import { requireAdminPage } from "@/lib/auth/actionAuth";

export const dynamic = "force-dynamic";

export default async function AdminAccountsPage() {
  await requireAdminPage();
  return <TeacherAccountHelper />;
}

import { useUser } from "@/hooks/useSession";
import { UserRound } from "lucide-react";
import { ChangePassword } from "@/components/profile/ChangePassword";
import { DeleteUserSection } from "@/components/profile/DeleteUserSection";
import { UsernameForm } from "@/components/profile/UsernameForm";
import { PageHeader } from "@/components/layout/PageHeader";

const ProfilePage = () => {
  const user = useUser();
  return (
    <>
      <title>FXTrax - Profile</title>
      <PageHeader icon={UserRound} title="Profile" description={user.email} />
      <div className="max-w-xl space-y-6">
        <UsernameForm />
        <ChangePassword />
        <DeleteUserSection />
      </div>
    </>
  );
};

export default ProfilePage;

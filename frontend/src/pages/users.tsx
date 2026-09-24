import { NextPage } from "next";
import { UserRound } from "lucide-react";
import ChangePassword from "@/components/profile/ChangePassword";
import DeleteAccountSection from "@/components/profile/DeleteAccountSection";
import UsernameForm from "@/components/profile/UsernameForm";
import { PageHeader } from "@/components/layout/PageHeader";
import withSession, { SessionProps } from "@/components/withSession";

const ProfilePage: NextPage<SessionProps> = ({ user }) => (
  <>
    <title>FXTrax - Profile</title>
    <PageHeader icon={UserRound} title="Profile" description={user.email} />
    <div className="max-w-xl space-y-6">
      <UsernameForm />
      <ChangePassword />
      <DeleteAccountSection />
    </div>
  </>
);

export default withSession(ProfilePage);

"use client";
import ConversationContainer from "@/components/conversations/ConversationContainer";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import ChatBody from "./_components/chatBody/ChatBody";
import DeleteGroupDialog from "./_components/chatBody/dialogs/DeleteGroupDialog";
import LeaveGroupDialog from "./_components/chatBody/dialogs/LeaveGroupDialog";
import RemoveFriendDialog from "./_components/chatBody/dialogs/RemoveFriendDialog";
import ShowGroupMembersDialog from "./_components/chatBody/dialogs/ShowGroupMembersDialog";
import ChatHeader from "./_components/ChatHeader";
import ChatInput from "./_components/input/ChatInput";
import AddFriendGroupDialog from "./_components/chatBody/dialogs/AddFriendGroupDialog";

type Props = {};
const ConversationPage = (props: Props) => {
  const { conversationId } = useParams();
  const conversation = useQuery(api.conversation.getConversationById, {
    conversationId: conversationId as Id<"conversations">,
  });
  const otherUser = conversation?.otherUser;
  const isGroup = conversation?.conversation.isGroup;
  const name = isGroup ? conversation?.conversation.name : otherUser?.username;
  const imageUrl = otherUser?.imageUrl;
  const [removeFriendDialogOpen, setRemoveFriendDialogOpen] = useState(false);
  const [addFriendToGroupDialogOpen, setAddFriendToGroupDialogOpen] =
    useState(false);
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false);
  const [leaveGroupDialogOpen, setLeaveGroupDialogOpen] = useState(false);
  const [openGroupMembers, setOpenGroupMembers] = useState(false);

  const [callType, setCallType] = useState<"audio" | "video" | null>(null);
  return (
    <ConversationContainer>
      <RemoveFriendDialog
        open={removeFriendDialogOpen}
        setOpen={setRemoveFriendDialogOpen}
        conversationId={conversationId as Id<"conversations">}
      />

      {isGroup && (
        <>
          <ShowGroupMembersDialog
            conversationId={conversationId as Id<"conversations">}
            open={openGroupMembers}
            setOpen={setOpenGroupMembers}
          />
          <AddFriendGroupDialog
            otherMembers={
              conversation?.otherMembers?.map((user) => user._id) || []
            }
            conversationId={conversationId as Id<"conversations">}
            open={addFriendToGroupDialogOpen}
            setOpen={setAddFriendToGroupDialogOpen}
          />
          <DeleteGroupDialog
            conversationId={conversationId as Id<"conversations">}
            open={deleteGroupDialogOpen}
            setOpen={setDeleteGroupDialogOpen}
          />
          <LeaveGroupDialog
            conversationId={conversationId as Id<"conversations">}
            open={leaveGroupDialogOpen}
            setOpen={setLeaveGroupDialogOpen}
          />
        </>
      )}

      {conversation ? (
        <>
          <ChatHeader
            imageUrl={imageUrl || ""}
            name={name || ""}
            isGroup={isGroup || false}
            showGroupMembers={() => setOpenGroupMembers(true)}
            options={
              isGroup
                ? [
                    {
                      label: "Add Friend",
                      onClick: () => setAddFriendToGroupDialogOpen(true),
                      destructive: false,
                    },
                    {
                      label: "Leave Group",
                      onClick: () => setLeaveGroupDialogOpen(true),
                      destructive: true,
                    },
                    {
                      label: "Delete Group",
                      onClick: () => setDeleteGroupDialogOpen(true),
                      destructive: true,
                    },
                  ]
                : [
                    {
                      label: "Remove Friend",
                      onClick: () => setRemoveFriendDialogOpen(true),
                      destructive: true,
                    },
                  ]
            }
          />
          <ChatBody
            otherUsers={
              isGroup
                ? (conversation.otherMembers ?? []).filter(
                    (user) => user !== null && user !== undefined
                  )
                : [otherUser].filter(
                    (user) => user !== null && user !== undefined
                  )
            }
          />
          <ChatInput />
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}
    </ConversationContainer>
  );
};
export default ConversationPage;

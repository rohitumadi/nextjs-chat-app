"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { api } from "@/convex/_generated/api";
import { useMutationState } from "@/hooks/useMutationState";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConvexError } from "convex/values";
import EmojiPicker from "emoji-picker-react";
import { SendHorizontal, Smile } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import { z } from "zod";

const chatMessageSchema = z.object({
  content: z.string().trim().min(1),
  type: z.string(),
});
const ChatInput = () => {
  const { conversationId } = useParams();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { mutate: createMessage, pending } = useMutationState(
    api.message.createMessage
  );
  const form = useForm<z.infer<typeof chatMessageSchema>>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: {
      content: "",
      type: "text",
    },
  });
  const onSubmit = async (data: z.infer<typeof chatMessageSchema>) => {
    try {
      await createMessage({
        content: [data.content],
        type: "text",
        conversationId: conversationId,
      });
    } catch (error) {
      toast.error(
        error instanceof ConvexError ? error.data : "Failed to send message"
      );
    }

    form.reset();
  };

  const handleKeyDown = async (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await form.handleSubmit(onSubmit)();
    }
  };
  const handleShowEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  const handleEmojiClick = (emoji: any) => {
    form.setValue("content", form.getValues("content") + emoji.emoji);
  };
  return (
    <Card className=" p-2 m-2 relative  ">
      {showEmojiPicker && (
        <div className="absolute bottom-16">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
      <Form {...form}>
        <form
          className="flex gap-2 items-center"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <Smile
            className="w-6 h-6 cursor-pointer"
            onClick={handleShowEmojiPicker}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <TextareaAutosize
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent outline-none border-0 placeholder:text-muted-foreground text-card-foreground resize-none "
                    rows={1}
                    {...field}
                    maxRows={3}
                    placeholder="Type a message"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button size={"icon"} type="submit" disabled={pending}>
            <SendHorizontal />
          </Button>
        </form>
      </Form>
    </Card>
  );
};
export default ChatInput;

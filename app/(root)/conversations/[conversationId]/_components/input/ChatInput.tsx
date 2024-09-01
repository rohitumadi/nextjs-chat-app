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
import { SendHorizontal } from "lucide-react";
import { useParams } from "next/navigation";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import { z } from "zod";

const chatMessageSchema = z.object({
  content: z.string(),
  type: z.string(),
});
const ChatInput = () => {
  const { conversationId } = useParams();
  const { mutate: createMessage, pending } = useMutationState(
    api.message.createMessage
  );
  const testAreaRef = useRef<HTMLTextAreaElement>(null);
  const form = useForm<z.infer<typeof chatMessageSchema>>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: {
      content: "",
      type: "text",
    },
  });
  const onSubmit = async (data: z.infer<typeof chatMessageSchema>) => {
    console.log(data);
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
  // const handleInputChange = (e: any) => {
  //   const { value, selectionStart } = e.target;
  //   if (selectionStart !== null) {
  //     form.setValue("content", value);
  //   }
  // };
  const handleKeyDown = async (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await form.handleSubmit(onSubmit)();
    }
  };
  return (
    <Card className=" p-2 m-2">
      <Form {...form}>
        <form
          className="flex gap-2 items-center"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <TextareaAutosize
                    onKeyDown={handleKeyDown}
                    className="w-full outline-none border-0 placeholder:text-muted-foreground text-card-foreground resize-none "
                    rows={1}
                    {...field}
                    maxRows={3}
                    // onChange={handleInputChange}
                    // onClick={handleInputChange}
                    placeholder="Type a message"
                  />
                </FormControl>
                <FormMessage />
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

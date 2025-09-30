"use client";

import { FileUpload } from "@/components/fileupload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem
} from "@/components/ui/form";
import { useSendMessage } from "@/hooks/use-send-message";
import { useModalStore } from "@/lib/hooks/use-modal-store";
import { logger } from "@/lib/logger";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  fileUrl: z.string().min(1, {
    message: "Attachment is required."
  })
});

export const MessageFileModal = () => {
  const { isOpen, onClose, type, data } = useModalStore();
  const sendMessage = useSendMessage();

  const isModalOpen = isOpen && type === "messageFile";
  const { apiUrl, query } = data;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileUrl: "",
    }
  });

  const handleClose = () => {
    form.reset();
    onClose();
  }

  const isLoading = form.formState.isSubmitting || sendMessage.isPending;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const normalizedQuery = Object.entries(query ?? {}).reduce<Record<string, string>>((acc, [key, value]) => {
        if (typeof value === "string") {
          acc[key] = value;
        } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
          acc[key] = value[0];
        }

        return acc;
      }, {});

      await sendMessage.mutateAsync({
        content: values.fileUrl,
        apiUrl: apiUrl ?? "/api/messages",
        query: normalizedQuery,
      });

      form.reset();
      handleClose();
    } catch (error) {
      logger.error("Failed to send file message", error);
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Add an attachment
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Send a file as a message
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          endpoint="messageFile"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button disabled={isLoading}>
                Send
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

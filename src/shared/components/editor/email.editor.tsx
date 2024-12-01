"use client";
import EmailEditor, { EditorRef, EmailEditorProps } from "react-email-editor";
import React, { useEffect, useRef, useState } from "react";
import { DefaultJsonData } from "@/assets/mails/default";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/react";
import { saveEmail } from "@/actions/save.email";
import toast from "react-hot-toast";
import { GetEmailDetails } from "@/actions/get.email-details";
import { sendEmail } from "@/shared/utils/email.sender";
import { getSubscribers } from "@/actions/get.subscribers1";
import { GoMail } from "react-icons/go";


const Emaileditor = ({ subjectTitle }: { subjectTitle: string }) => {
  const [loading, setLoading] = useState(true);
  const [jsonData, setJsonData] = useState<any | null>(DefaultJsonData);
  const { user } = useClerk();
  const emailEditorRef = useRef<EditorRef>(null);
  const history = useRouter();

  const sendToAllSubscribers = async () => {
    try {
      const unlayer = emailEditorRef.current?.editor;
      
      unlayer?.exportHtml(async (data) => {
        const { html } = data;
        
        // Validate user authentication
        if (!user?.id) {
          toast.error("User authentication failed. Please log in again.");
          return;
        }

        // Fetch subscribers
        const emails = await getSubscribers({ newsLetterOwnerId: user.id });
        
        // Log subscribers for debugging
        console.log('Fetched Subscribers:', {
          count: emails?.length,
          emails: emails
        });

        if (!emails || emails.length === 0) {
          toast.error("No subscribers found. Have you added any?");
          return;
        }

        try {
          // Map through emails and send to each individually
          const sendPromises = emails.map(async (email) => {
            return sendEmail({
              userEmail: [email], // Send to single email in an array
              subject: subjectTitle,
              content: html,
            });
          });

          // Wait for all emails to be sent
          await Promise.all(sendPromises);
          
          toast.success(`Email sent to ${emails.length} subscribers successfully!`);
          history.push("/dashboard/write");
        } catch (emailError:any) {
          console.error(emailError);
          toast.error(emailError.message);
        }
      });
    } catch (error:any) {
      console.error('Send to All Unexpected Error:', error);
      toast.error(`An unexpected error occurred: ${error.message}`);
    }
  };

  const exportHtml = () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml(async (data) => {
      const { design, html } = data;
      setJsonData(design);
      
      try {
        await sendEmail({
          userEmail: ["deepgalani126@gmail.com"],
          subject: subjectTitle,
          content: html,
        });
        
        toast.success("Email sent successfully!");
        history.push("/dashboard/write");
      } catch (error:any) {
        console.error('Send Email Error:', error);
        toast.error(`Failed to send email: ${error.message}`);
      }
    });
  };

  useEffect(() => {
    getEmailDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onReady: EmailEditorProps["onReady"] = () => {
    const unlayer: any = emailEditorRef.current?.editor;
    unlayer.loadDesign(jsonData);
  };

  const saveDraft = async () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.exportHtml(async (data) => {
      const { design } = data;
      
      try {
        const res:any = await saveEmail({
          title: subjectTitle,
          content: JSON.stringify(design),
          newsLetterOwnerId: user?.id!,
        });
        
        toast.success(res.message);
        history.push("/dashboard/write");
      } catch (error:any) {
        console.error('Save Draft Error:', error);
        toast.error(`Failed to save draft: ${error.message}`);
      }
    });
  };

  const getEmailDetails = async () => {
    try {
      const res:any = await GetEmailDetails({
        title: subjectTitle,
        newsLetterOwnerId: user?.id!,
      });
      
      if (res) {
        setJsonData(JSON.parse(res?.content));
      }
      setLoading(false);
    } catch (error:any) {
      console.error('Get Email Details Error:', error);
      toast.error(`Failed to load email details: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <>
      {!loading && (
        <div className="w-full h-[90vh] relative">
          <EmailEditor
            minHeight={"80vh"}
            ref={emailEditorRef}
            onReady={onReady}
          />
          <div className="absolute bottom-0 flex items-center justify-end gap-4 right-0 w-full border-t p-3">
            <Button
              className="hover:bg-gray-200 bg-white cursor-pointer flex items-center gap-1 text-black border border-[#00000048] text-lg rounded-lg"
              onClick={saveDraft}
            >
              <span className="opacity-[.7]">Save Draft</span>
            </Button>
            <Button
              className="bg-[#000] hover:bg-gray-500 text-white cursor-pointer flex items-center gap-1 border text-lg rounded-lg"
              onClick={exportHtml}
            >
              <span>Send</span>
            </Button>
            <Button
              className="bg-blue-500 text-white cursor pointer flex items-center gap-1 border text-lg rounded-lg"
              onClick={sendToAllSubscribers}
            >
              <GoMail className="mr-1" /> <span>Send to All</span>
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Emaileditor;
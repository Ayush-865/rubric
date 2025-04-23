"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share as ShareIcon, Copy, Check, Link } from "lucide-react";

interface ShareProps {
  classId: string;
  students: Array<{
    id: string;
    name: string;
    rollNo: string;
  }>;
}

const Share = ({ classId, students }: ShareProps) => {
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/class/share/`
      : "/class/share/";

  const shareUrl = selectedStudent
    ? `${baseUrl}${classId}?student=${selectedStudent}`
    : `${baseUrl}${classId}`;

  const copyToClipboard = () => {
    if (!shareUrl) return;

    navigator.clipboard.writeText(shareUrl);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-gray-800 hover:bg-gray-700 border-gray-700 text-white"
        >
          <ShareIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Share Link</DialogTitle>
          <DialogDescription className="text-gray-400">
            Copy this link to share the class marks.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="link" className="text-white">
              Shareable Link
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="link"
                value={shareUrl}
                readOnly
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                className={`${
                  copied
                    ? "bg-green-900/20 text-green-400 border-green-800"
                    : "bg-gray-800 border-gray-700 text-white"
                }`}
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="flex sm:justify-end">
          <Button
            variant="outline"
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Share;
